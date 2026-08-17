import { formatMoney, useAppStore } from "@/lib/app-store";
import { MicroLabel } from "./kit";

export function BudgetMeter() {
  const { sessionSpend, perSessionLimit, perQueryLimit } = useAppStore();
  const pct = Math.min(100, Math.round((sessionSpend / perSessionLimit) * 100));
  const remaining = Math.max(0, perSessionLimit - sessionSpend);

  return (
    <div className="rounded-[var(--radius-md)] border border-hair bg-page p-[24px]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-[16px]">
        <MicroLabel>Session budget</MicroLabel>
        <p className="num text-[13px] text-ink-soft">
          {formatMoney(sessionSpend)} / {formatMoney(perSessionLimit)}
        </p>
      </div>
      <div className="mt-[12px] h-[6px] w-full overflow-hidden rounded-[var(--radius-pill)] bg-surface-1">
        <div
          className="h-full rounded-[var(--radius-pill)] bg-brand transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-[12px] text-[13px] text-ink-soft">
        <span className="num text-ink">{formatMoney(remaining)}</span> remaining · per-query cap{" "}
        <span className="num text-ink">{formatMoney(perQueryLimit)}</span>
      </p>
    </div>
  );
}