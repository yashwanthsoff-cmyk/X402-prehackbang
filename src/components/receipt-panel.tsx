import type { Receipt } from "@/lib/mock-api";
import { CopyValue, MicroLabel } from "./kit";

export function ReceiptPanel({ receipt }: { receipt: Receipt }) {
  return (
    <div className="enter rounded-[var(--radius-md)] border border-hair bg-page-alt p-[24px]">
      <MicroLabel>Transaction receipt (mock)</MicroLabel>
      <dl className="mt-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-[13px] text-ink-soft">Transaction ID</dt>
          <dd className="mt-[4px] min-w-0">
            <CopyValue value={receipt.txId} display={`${receipt.txId.slice(0, 10)}…${receipt.txId.slice(-6)}`} />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[13px] text-ink-soft">Amount paid</dt>
          <dd className="num mt-[4px] text-[14px] text-ink">${receipt.amount.toFixed(3)} USDC</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[13px] text-ink-soft">payTo</dt>
          <dd className="mt-[4px] min-w-0">
            <CopyValue value={receipt.payTo} display={`${receipt.payTo.slice(0, 8)}…${receipt.payTo.slice(-6)}`} />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[13px] text-ink-soft">Settled</dt>
          <dd className="num mt-[4px] text-[14px] text-ink">
            {new Date(receipt.timestamp).toLocaleTimeString()} · {receipt.network}
          </dd>
        </div>
      </dl>
    </div>
  );
}