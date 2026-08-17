import { Check, Loader2 } from "lucide-react";
import { STEPS, type StepId } from "@/lib/mock-api";
import { cn } from "@/lib/utils";
import { MicroLabel } from "./kit";

export function PaymentStepper({
  current,
  done,
  failed,
  premium = false,
}: {
  current: StepId | null;
  done: boolean;
  failed?: boolean | undefined;
  premium?: boolean;
}) {
  const currentIndex = current ? STEPS.findIndex((s) => s.id === current) : -1;

  return (
    <div className="enter rounded-[var(--radius-md)] border border-hair bg-page-alt p-[24px]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[16px]">
        <MicroLabel>x402 payment loop</MicroLabel>
        {premium && (
          <span className="micro rounded-[var(--radius-pill)] border border-brand px-[12px] py-[4px] text-brand">
            Premium
          </span>
        )}
      </div>

      <ol className="mt-[24px] flex flex-col gap-[16px] md:flex-row md:items-start md:gap-0">
        {STEPS.map((step, i) => {
          const isDone = done ? true : i < currentIndex;
          const isActive = !done && i === currentIndex;
          const isFailedHere = failed && i === currentIndex;
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-start gap-[8px] md:flex-col">
              <div className="flex w-full items-center gap-[8px]">
                <span
                  className={cn(
                    "flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[var(--radius-pill)] border text-[11px] font-medium",
                    isFailedHere
                      ? "border-[color:var(--color-danger)] text-bad"
                      : isDone || isActive
                        ? "border-brand text-brand"
                        : "border-hair text-ink-muted",
                  )}
                >
                  {isDone ? (
                    <Check className="h-[14px] w-[14px]" strokeWidth={2} />
                  ) : isActive ? (
                    <Loader2 className="h-[14px] w-[14px] animate-spin" strokeWidth={2} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    "hidden h-px flex-1 md:block",
                    isDone ? "bg-brand" : "bg-[color:var(--color-border-light)]",
                    i === STEPS.length - 1 && "md:hidden",
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-[13px] leading-[1.4] md:pr-[16px]",
                  isDone || isActive ? "text-ink" : "text-ink-muted",
                )}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}