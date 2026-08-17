import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Activity, GaugeCircle, Menu, Scale, X } from "lucide-react";
import { useState } from "react";
import { AppStoreProvider } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

const NAV = [
  { to: "/app/quote", label: "Price quote", icon: GaugeCircle },
  { to: "/app/guard", label: "Spend policy guard", icon: Scale },
  { to: "/app/compare", label: "Market signal", icon: Activity },
  { to: "/app/activity", label: "Activity", icon: Activity },
] as const;

function AppShell() {
  const [open, setOpen] = useState(false);

  return (
    <AppStoreProvider>
      <div className="min-h-screen bg-page">
        <header className="sticky top-0 z-[100] border-b border-hair bg-page/90 backdrop-blur">
          <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[16px] px-[20px] py-[16px] md:px-[64px]">
            <Link to="/" className="min-w-0 truncate font-display text-[17px] font-semibold tracking-[-0.02em] text-ink">
              MandiPulse
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-hair text-ink transition-colors duration-200 hover:bg-surface-1 md:hidden"
            >
              {open ? <X className="h-[20px] w-[20px]" strokeWidth={1.75} /> : <Menu className="h-[20px] w-[20px]" strokeWidth={1.75} />}
            </button>
          </div>
          {open && (
            <nav className="border-t border-hair bg-page px-[20px] py-[16px] md:hidden">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>
          )}
        </header>

        <div className="mx-auto flex max-w-[1400px] gap-[48px] px-[20px] py-[32px] md:px-[64px] md:py-[64px]">
          <aside className="hidden w-[240px] shrink-0 md:block">
            <nav className="sticky top-[120px]">
              <NavLinks />
            </nav>
          </aside>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </AppStoreProvider>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <ul className="flex flex-col gap-[4px]">
      {NAV.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            onClick={onNavigate}
            className="flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-sm)] px-[12px] text-[15px] text-ink-soft transition-colors duration-200 hover:bg-surface-1 hover:text-ink"
            activeProps={{ className: cn("bg-surface-1 text-brand font-medium") }}
          >
            <item.icon className="h-[20px] w-[20px] shrink-0" strokeWidth={1.75} />
            <span className="truncate">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}