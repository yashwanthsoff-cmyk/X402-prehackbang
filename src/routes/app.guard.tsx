import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BudgetMeter } from "@/components/budget-meter";
import { Button, Field, MicroLabel, NumberInput, Panel, StateBlock } from "@/components/kit";
import { formatMoney, useAppStore } from "@/lib/app-store";
import { PRICE_PER_COMPARE, PRICE_PER_QUERY } from "@/lib/mock-api";

export const Route = createFileRoute("/app/guard")({
  head: () => ({
    meta: [
      { title: "Spend Policy Guard — MandiPulse" },
      {
        name: "description",
        content:
          "Per-query and per-session budget limits for AI agents, checked before any x402 payment is attempted, with a visible decision log.",
      },
      { property: "og:title", content: "Spend Policy Guard — MandiPulse" },
      {
        property: "og:description",
        content: "Budget enforcement that blocks agent overspend before payment.",
      },
    ],
  }),
  component: GuardPage,
});

function GuardPage() {
  const {
    perQueryLimit,
    perSessionLimit,
    setLimits,
    decisions,
    checkBudget,
    resetSession,
  } = useAppStore();

  const [queryDraft, setQueryDraft] = useState(String(perQueryLimit));
  const [sessionDraft, setSessionDraft] = useState(String(perSessionLimit));
  const [errors, setErrors] = useState<{ q?: string; s?: string }>({});
  const [saved, setSaved] = useState(false);

  function validate() {
    const q = Number(queryDraft);
    const s = Number(sessionDraft);
    const next: { q?: string; s?: string } = {};
    if (!queryDraft || Number.isNaN(q) || q <= 0) next.q = "Enter an amount greater than 0.";
    if (!sessionDraft || Number.isNaN(s) || s <= 0) next.s = "Enter an amount greater than 0.";
    if (!next.q && !next.s && q > s)
      next.q = "Per-query cap cannot exceed the per-session cap.";
    setErrors(next);
    return Object.keys(next).length === 0 ? { q, s } : null;
  }

  function save() {
    const ok = validate();
    if (!ok) return;
    setLimits(ok.q, ok.s);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-[48px]">
      <header className="flex flex-col gap-[16px]">
        <MicroLabel>Endpoint 02 · control layer</MicroLabel>
        <h1 className="display-md max-w-[600px] text-ink">Spend policy guard</h1>
        <p className="max-w-[600px] text-[17px] text-ink-soft">
          Every paid call passes the guard before a payment is signed. Retries re-run the check —
          they never skip straight to settlement.
        </p>
      </header>

      <BudgetMeter />

      <Panel>
        <MicroLabel>Policy limits (mock USDC)</MicroLabel>
        <div className="mt-[24px] grid grid-cols-1 gap-[24px] sm:grid-cols-2">
          <Field label="Max spend per query" error={errors.q}>
            <NumberInput
              step="0.01"
              min="0"
              value={queryDraft}
              onChange={(e) => setQueryDraft(e.target.value)}
              onBlur={validate}
            />
          </Field>
          <Field label="Max spend per session" error={errors.s}>
            <NumberInput
              step="0.01"
              min="0"
              value={sessionDraft}
              onChange={(e) => setSessionDraft(e.target.value)}
              onBlur={validate}
            />
          </Field>
        </div>
        <div className="mt-[32px] flex flex-wrap items-center gap-[24px]">
          <Button variant="solid" onClick={save}>
            {saved ? "Limits saved" : "Save limits"}
          </Button>
          <Button variant="secondary" onClick={resetSession}>
            Reset session spend →
          </Button>
        </div>
        <p className="mt-[16px] text-[13px] text-ink-soft">
          Price quote costs {formatMoney(PRICE_PER_QUERY)} · market signal costs{" "}
          {formatMoney(PRICE_PER_COMPARE)}.
        </p>
      </Panel>

      <Panel tone="grey">
        <MicroLabel>Dry run the guard</MicroLabel>
        <p className="mt-[12px] max-w-[600px] text-[15px] text-ink-soft">
          Evaluate a request against the current policy without paying anything.
        </p>
        <div className="mt-[24px] flex flex-wrap gap-[16px]">
          <Button onClick={() => checkBudget(PRICE_PER_QUERY, "Price quote (dry run)")}>
            Check price quote
          </Button>
          <Button onClick={() => checkBudget(PRICE_PER_COMPARE, "Market signal (dry run)")}>
            Check market signal
          </Button>
        </div>
      </Panel>

      <section className="flex flex-col gap-[24px]">
        <MicroLabel>Decision log</MicroLabel>
        {decisions.length === 0 ? (
          <StateBlock
            title="No decisions yet"
            body="Run a dry check above or request a quote — every allow and block lands here with the specific limit that applied."
          />
        ) : (
          <ul className="flex flex-col">
            {decisions.map((d) => (
              <li
                key={d.id}
                className="grid grid-cols-1 gap-[8px] border-b border-hair py-[16px] sm:grid-cols-[120px_minmax(0,1fr)_auto]"
              >
                <span
                  className={
                    d.allowed
                      ? "micro text-[color:var(--color-success)]"
                      : "micro text-[color:var(--color-danger)]"
                  }
                >
                  {d.allowed ? "Allowed" : "Blocked"}
                </span>
                <span className="min-w-0 text-[15px] text-ink">
                  {d.endpoint} — <span className="text-ink-soft">{d.reason}</span>
                </span>
                <span className="num text-[13px] text-ink-soft">
                  {new Date(d.at).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}