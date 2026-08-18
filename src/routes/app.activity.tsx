import { createFileRoute } from "@tanstack/react-router";
import { FoundationChips } from "@/components/foundation-chips";
import { Button, MicroLabel, StateBlock } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/activity")({
  head: () => ({
    meta: [
      { title: "Activity — MandiPulse" },
      {
        name: "description",
        content:
          "Live demo dashboard of recent MandiPulse x402 transactions across the metered quote, spend guard and premium market signal endpoints.",
      },
      { property: "og:title", content: "Activity — MandiPulse" },
      {
        property: "og:description",
        content: "Recent pay-per-query transactions across all MandiPulse endpoints.",
      },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { activity, sessionSpend } = useAppStore();

  return (
    <div className="flex flex-col gap-[48px]">
      <header className="flex flex-col gap-[16px]">
        <MicroLabel>Dashboard</MicroLabel>
        <h1 className="display-md max-w-[600px] text-ink">Activity</h1>
        <p className="max-w-[600px] text-[17px] text-ink-soft">
          Every simulated call across all three endpoints, newest first. Session spend so far:{" "}
          <span className="num text-ink">${sessionSpend.toFixed(3)}</span>.
        </p>
        <FoundationChips />
      </header>

      {activity.length === 0 ? (
        <StateBlock
          title="No transactions yet"
          body="Request a price quote or a premium market signal and the settled, blocked and stale-data outcomes will appear here."
          action={
            <Link to="/app/quote">
              <Button variant="solid">Run a price quote</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hair">
                  <th className="micro py-[12px] text-ink-soft">Time</th>
                  <th className="micro py-[12px] text-ink-soft">Endpoint</th>
                  <th className="micro py-[12px] text-ink-soft">Amount</th>
                  <th className="micro py-[12px] text-ink-soft">Status</th>
                  <th className="micro py-[12px] text-ink-soft">Detail</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={row.id} className="border-b border-hair align-top">
                    <td className="num py-[16px] text-[14px] text-ink-soft">
                      {new Date(row.at).toLocaleTimeString()}
                    </td>
                    <td className="py-[16px] text-[15px] text-ink">{row.endpoint}</td>
                    <td className="num py-[16px] text-[15px] text-ink">
                      ${row.amount.toFixed(3)}
                    </td>
                    <td className="py-[16px] text-[14px] text-ink-soft">{row.status}</td>
                    <td className="max-w-[320px] truncate py-[16px] text-[14px] text-ink-soft">
                      {row.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-[24px] md:hidden">
            {activity.map((row) => (
              <li
                key={row.id}
                className="rounded-[var(--radius-md)] border border-hair bg-page p-[24px]"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-[16px]">
                  <p className="truncate text-[15px] text-ink">{row.endpoint}</p>
                  <p className="num text-[15px] text-ink">${row.amount.toFixed(3)}</p>
                </div>
                <p className="mt-[8px] text-[14px] text-ink-soft">{row.status}</p>
                <p className="mt-[8px] text-[14px] text-ink-soft">{row.detail}</p>
                <p className="num mt-[8px] text-[13px] text-ink-soft">
                  {new Date(row.at).toLocaleTimeString()}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}