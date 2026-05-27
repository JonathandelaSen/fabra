import { ChevronRight } from "lucide-react";
import type {
  ObjectiveStatus,
  ObjectiveWithRelations,
} from "../api/objectives-api";
import { statusClass } from "./objectives-ui";

interface ObjectiveListItemProps {
  commitment: ObjectiveWithRelations;
  active: boolean;
  onSelect: (id: string) => void;
  statusLabel: (status: ObjectiveStatus) => string;
  t: (key: string, values?: Record<string, number>) => string;
}

export function ObjectiveListItem({
  commitment,
  active,
  onSelect,
  statusLabel,
  t,
}: ObjectiveListItemProps) {
  const done = commitment.items.filter(
    (item) => item.status === "done"
  ).length;

  return (
    <button
      onClick={() => onSelect(commitment.id)}
      className={`group relative mb-2 w-full rounded-xl border p-3.5 text-left transition-all duration-200 ${
        active
          ? "bg-[#181825] border-indigo-500/20 text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-2 text-sm font-semibold text-zinc-100 transition-colors group-hover:text-zinc-50">
          {commitment.title}
        </p>
        <ChevronRight
          className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
            active ? "text-indigo-400" : "text-zinc-700 group-hover:text-zinc-500"
          }`}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
        <span className={statusClass(commitment.status)}>
          {statusLabel(commitment.status)}
        </span>
        <span className="text-zinc-500 font-medium">
          {t("doneCount", {
            done,
            total: commitment.items.length,
          })}
        </span>
      </div>
    </button>
  );
}
