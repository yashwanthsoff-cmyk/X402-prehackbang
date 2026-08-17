import { FOUNDATION_CHIPS } from "@/lib/mock-api";
import { Chip } from "./kit";

export function FoundationChips() {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      {FOUNDATION_CHIPS.map((c) => (
        <Chip key={c.label} state={c.state}>
          {c.label}
        </Chip>
      ))}
    </div>
  );
}