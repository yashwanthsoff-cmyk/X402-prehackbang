/**
 * Local, internally-consistent mock dataset for the MandiPulse demo.
 * Replace with real API responses when the x402 backend is wired up.
 */

export type Market = {
  id: string;
  name: string;
  district: string;
  state: string;
};

export type Commodity = { id: string; name: string; unit: string };

export const COMMODITIES: Commodity[] = [
  { id: "onion", name: "Onion", unit: "₹ / quintal" },
  { id: "tomato", name: "Tomato", unit: "₹ / quintal" },
  { id: "wheat", name: "Wheat", unit: "₹ / quintal" },
  { id: "rice", name: "Rice (Paddy)", unit: "₹ / quintal" },
  { id: "potato", name: "Potato", unit: "₹ / quintal" },
];

export const STATES = [
  "Maharashtra",
  "Karnataka",
  "Uttar Pradesh",
  "Gujarat",
  "Punjab",
] as const;

export const MARKETS: Market[] = [
  { id: "lasalgaon", name: "Lasalgaon", district: "Nashik", state: "Maharashtra" },
  { id: "pimpalgaon", name: "Pimpalgaon Baswant", district: "Nashik", state: "Maharashtra" },
  { id: "vashi", name: "Vashi APMC", district: "Thane", state: "Maharashtra" },
  { id: "kalyan", name: "Kalyan", district: "Thane", state: "Maharashtra" },
  { id: "yeshwanthpur", name: "Yeshwanthpur", district: "Bengaluru Urban", state: "Karnataka" },
  { id: "hubballi", name: "Hubballi APMC", district: "Dharwad", state: "Karnataka" },
  { id: "azadpur", name: "Azadpur", district: "Delhi North", state: "Uttar Pradesh" },
  { id: "agra", name: "Agra Mandi", district: "Agra", state: "Uttar Pradesh" },
  { id: "varanasi", name: "Varanasi Mandi", district: "Varanasi", state: "Uttar Pradesh" },
  { id: "unjha", name: "Unjha", district: "Mehsana", state: "Gujarat" },
  { id: "rajkot", name: "Rajkot Yard", district: "Rajkot", state: "Gujarat" },
  { id: "khanna", name: "Khanna", district: "Ludhiana", state: "Punjab" },
  { id: "moga", name: "Moga", district: "Moga", state: "Punjab" },
];

export function districtsFor(state: string) {
  return Array.from(new Set(MARKETS.filter((m) => m.state === state).map((m) => m.district)));
}

export function marketsFor(state: string, district: string) {
  return MARKETS.filter((m) => m.state === state && m.district === district);
}

export function marketById(id: string) {
  return MARKETS.find((m) => m.id === id);
}

/** Deterministic pseudo-random so a market+commodity always returns the same range. */
function seed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 1000) / 1000;
}

const BASE: Record<string, number> = {
  onion: 1850,
  tomato: 1420,
  wheat: 2380,
  rice: 2140,
  potato: 1180,
};

export type PriceQuote = {
  commodityId: string;
  commodity: string;
  unit: string;
  marketId: string;
  market: string;
  district: string;
  state: string;
  min: number;
  modal: number;
  max: number;
  /** minutes since last observation */
  ageMinutes: number;
  arrivalsTonnes: number;
};

/** Markets deliberately missing recent data, to exercise the stale-data UI state. */
export const STALE_MARKETS = new Set(["varanasi", "moga"]);
/** Market+commodity pairs that are simply not covered. */
export const UNCOVERED = new Set(["unjha:tomato", "khanna:onion"]);

export function buildQuote(marketId: string, commodityId: string): PriceQuote | null {
  const market = marketById(marketId);
  const commodity = COMMODITIES.find((c) => c.id === commodityId);
  if (!market || !commodity) return null;
  if (UNCOVERED.has(`${marketId}:${commodityId}`)) return null;

  const s = seed(`${marketId}-${commodityId}`);
  const base = Math.round((BASE[commodityId] ?? 1500) * (0.82 + s * 0.4));
  const spread = Math.round(base * (0.06 + s * 0.09));
  const ageMinutes = STALE_MARKETS.has(marketId)
    ? 2760 + Math.round(s * 900)
    : 35 + Math.round(s * 260);

  return {
    commodityId,
    commodity: commodity.name,
    unit: commodity.unit,
    marketId,
    market: market.name,
    district: market.district,
    state: market.state,
    min: base - spread,
    modal: base,
    max: base + spread,
    ageMinutes,
    arrivalsTonnes: 40 + Math.round(s * 600),
  };
}

export function formatAge(minutes: number) {
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export const STALE_THRESHOLD_MINUTES = 720;