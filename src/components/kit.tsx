import { Check, ChevronDown, Copy, Loader2 } from "lucide-react";
import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/* ---------- Button (one style, all states) ---------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "solid" | "secondary" | "ghost";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-[24px] py-[12px] text-[15px] font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px]";
  const styles = {
    primary:
      "border border-brand text-brand bg-transparent hover:border-brand-hover hover:text-brand-hover active:text-brand-pressed active:border-brand-pressed",
    solid:
      "border border-brand bg-brand text-white hover:bg-brand-hover hover:border-brand-hover active:bg-brand-pressed active:border-brand-pressed",
    secondary: "px-0 text-brand hover:text-brand-hover active:text-brand-pressed",
    ghost: "text-ink-soft hover:text-ink",
  }[variant];

  return (
    <button
      className={cn(base, styles, className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && <Loader2 className="h-[16px] w-[16px] animate-spin" strokeWidth={1.75} />}
      {children}
    </button>
  );
}

/* ---------- Surfaces ---------- */

export function Panel({
  className,
  children,
  tone = "light",
}: {
  className?: string;
  children: ReactNode;
  tone?: "light" | "grey";
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-md)] border border-hair p-[24px] md:p-[32px]",
        tone === "grey" ? "bg-page-alt" : "bg-page",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function MicroLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return <p className={cn("micro text-ink-soft", className)}>{children}</p>;
}

export function Chip({
  children,
  state = "neutral",
}: {
  children: ReactNode;
  state?: "neutral" | "ok" | "warn" | "bad" | "accent";
}) {
  const dot = {
    neutral: "bg-ink-muted",
    ok: "bg-ok",
    warn: "bg-warn",
    bad: "bg-bad",
    accent: "bg-brand",
  }[state];
  return (
    <span className="inline-flex items-center gap-[8px] rounded-[var(--radius-pill)] border border-hair bg-page px-[12px] py-[6px] text-[12px] font-medium text-ink-soft">
      <span className={cn("h-[6px] w-[6px] shrink-0 rounded-[var(--radius-pill)]", dot)} />
      <span className="truncate">{children}</span>
    </span>
  );
}

/* ---------- Form primitives ---------- */

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-[8px]">
      <label className="micro text-ink-soft">{label}</label>
      {children}
      {error ? (
        <p className="text-[13px] text-bad">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

const controlClass =
  "h-[44px] w-full min-w-0 rounded-[var(--radius-sm)] border border-hair bg-page px-[12px] text-[15px] text-ink outline-none transition-colors duration-200 hover:border-[color:var(--color-text-secondary)] focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 disabled:bg-surface-1 disabled:text-ink-muted";

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(controlClass, "appearance-none pr-[36px]", className)} {...rest}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-[12px] h-[16px] w-[16px] -translate-y-1/2 text-ink-soft"
        strokeWidth={1.75}
      />
    </div>
  );
}

export function NumberInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" className={cn(controlClass, "num", className)} {...rest} />;
}

/* ---------- Copy button ---------- */

export function CopyValue({ value, display }: { value: string; display?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => setCopied(true));
      }}
      className="inline-flex min-w-0 items-center gap-[8px] text-[14px] text-ink transition-colors duration-200 hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      aria-label="Copy value"
    >
      <span className="num truncate">{display ?? value}</span>
      {copied ? (
        <Check className="h-[16px] w-[16px] shrink-0 text-ok" strokeWidth={1.75} />
      ) : (
        <Copy className="h-[16px] w-[16px] shrink-0 text-ink-soft" strokeWidth={1.75} />
      )}
    </button>
  );
}

/* ---------- Async states ---------- */

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[var(--radius-sm)] bg-surface-1", className)} />;
}

export function StateBlock({
  tone = "neutral",
  title,
  body,
  action,
  children,
}: {
  tone?: "neutral" | "warn" | "bad";
  title: string;
  body: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const accent = {
    neutral: "border-hair",
    warn: "border-[color:var(--color-warning)]",
    bad: "border-[color:var(--color-danger)]",
  }[tone];
  return (
    <div className={cn("enter rounded-[var(--radius-md)] border bg-page p-[24px]", accent)}>
      <MicroLabel
        className={tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : undefined}
      >
        {tone === "bad" ? "Error" : tone === "warn" ? "Data quality" : "Status"}
      </MicroLabel>
      <h3 className="display-sm mt-[12px] text-ink">{title}</h3>
      <p className="mt-[8px] max-w-[600px] text-[15px] text-ink-soft">{body}</p>
      {children ? <div className="mt-[16px]">{children}</div> : null}
      {action ? <div className="mt-[24px]">{action}</div> : null}
    </div>
  );
}