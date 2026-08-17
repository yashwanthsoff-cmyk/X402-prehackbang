import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type GuardDecision = {
  id: string;
  at: string;
  endpoint: string;
  amount: number;
  allowed: boolean;
  reason: string;
};

export type ActivityRow = {
  id: string;
  at: string;
  endpoint: "Price quote" | "Market signal";
  amount: number;
  status: "Settled" | "Blocked" | "Stale data" | "No coverage";
  detail: string;
  txId?: string;
};

export type GuardVerdict = { allowed: boolean; reason: string };

type Store = {
  perQueryLimit: number;
  perSessionLimit: number;
  sessionSpend: number;
  setLimits: (perQuery: number, perSession: number) => void;
  checkBudget: (amount: number, endpoint: string) => GuardVerdict;
  recordSpend: (amount: number) => void;
  decisions: GuardDecision[];
  activity: ActivityRow[];
  logActivity: (row: Omit<ActivityRow, "id" | "at">) => void;
  resetSession: () => void;
};

const StoreContext = createContext<Store | null>(null);

const money = (n: number) => `$${n.toFixed(3).replace(/0$/, "")}`;
const uid = () => Math.random().toString(36).slice(2, 10);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [perQueryLimit, setPerQueryLimit] = useState(0.03);
  const [perSessionLimit, setPerSessionLimit] = useState(0.2);
  const [sessionSpend, setSessionSpend] = useState(0);
  const [decisions, setDecisions] = useState<GuardDecision[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  const setLimits = useCallback((perQuery: number, perSession: number) => {
    setPerQueryLimit(perQuery);
    setPerSessionLimit(perSession);
  }, []);

  const checkBudget = useCallback(
    (amount: number, endpoint: string): GuardVerdict => {
      const remaining = perSessionLimit - sessionSpend;
      let verdict: GuardVerdict;
      if (amount > perQueryLimit) {
        verdict = {
          allowed: false,
          reason: `Exceeds per-query limit by ${money(amount - perQueryLimit)} (query costs ${money(amount)}, limit ${money(perQueryLimit)}).`,
        };
      } else if (amount > remaining) {
        verdict = {
          allowed: false,
          reason: `Exceeds session limit by ${money(amount - remaining)} (${money(remaining)} of ${money(perSessionLimit)} remaining).`,
        };
      } else {
        verdict = {
          allowed: true,
          reason: `Within limits — ${money(amount)} of ${money(remaining)} session budget remaining.`,
        };
      }
      setDecisions((prev) =>
        [
          {
            id: uid(),
            at: new Date().toISOString(),
            endpoint,
            amount,
            allowed: verdict.allowed,
            reason: verdict.reason,
          },
          ...prev,
        ].slice(0, 20),
      );
      return verdict;
    },
    [perQueryLimit, perSessionLimit, sessionSpend],
  );

  const recordSpend = useCallback((amount: number) => {
    setSessionSpend((s) => Math.round((s + amount) * 1000) / 1000);
  }, []);

  const logActivity = useCallback((row: Omit<ActivityRow, "id" | "at">) => {
    setActivity((prev) => [{ ...row, id: uid(), at: new Date().toISOString() }, ...prev].slice(0, 40));
  }, []);

  const resetSession = useCallback(() => {
    setSessionSpend(0);
    setDecisions([]);
  }, []);

  const value = useMemo(
    () => ({
      perQueryLimit,
      perSessionLimit,
      sessionSpend,
      setLimits,
      checkBudget,
      recordSpend,
      decisions,
      activity,
      logActivity,
      resetSession,
    }),
    [
      perQueryLimit,
      perSessionLimit,
      sessionSpend,
      setLimits,
      checkBudget,
      recordSpend,
      decisions,
      activity,
      logActivity,
      resetSession,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}

export const formatMoney = money;