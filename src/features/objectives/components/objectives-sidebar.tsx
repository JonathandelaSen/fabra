import { ChevronRight } from "lucide-react";
import type {
  ObjectiveContext,
  ObjectiveStatus,
  ObjectiveWithRelations,
} from "../api/objectives-api";
import type { ObjectivesFilter } from "../hooks/use-objectives-route-state";
import { ObjectivesSidebarSkeleton } from "./objectives-skeleton";
import { statusClass } from "./objectives-ui";

interface ObjectivesSidebarProps {
  contexts: ObjectiveContext[];
  commitments: ObjectiveWithRelations[];
  filter: ObjectivesFilter;
  hasLoadedWorkspace: boolean;
  selectedId: string | null;
  onFilterChange: (filter: ObjectivesFilter) => void;
  onSelect: (id: string) => void;
  statusLabel: (status: ObjectiveStatus) => string;
  t: (key: string, values?: Record<string, number>) => string;
}

export function ObjectivesSidebar({
  contexts,
  commitments,
  filter,
  hasLoadedWorkspace,
  selectedId,
  onFilterChange,
  onSelect,
  statusLabel,
  t,
}: ObjectivesSidebarProps) {
  const contextIds = new Set(contexts.map((context) => context.id));
  const orphanedCommitments = commitments.filter(
    (commitment) => !contextIds.has(commitment.contextId)
  );
  const groups = [
    ...contexts.map((context) => ({
      id: context.id,
      name: context.name,
      commitments: commitments.filter(
        (commitment) => commitment.contextId === context.id
      ),
    })),
    ...(orphanedCommitments.length > 0
      ? [
          {
            id: "missing-context",
            name: t("fallbackContext"),
            commitments: orphanedCommitments,
          },
        ]
      : []),
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/[0.06] bg-[#0d0d14]/80 lg:w-[340px] lg:border-b-0 lg:border-r">
      <div className="border-b border-white/[0.06] p-4">
        <div className="flex rounded-lg bg-white/[0.04] p-1">
          {(["open", "closed", "all"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onFilterChange(item)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === item
                  ? "bg-white/[0.10] text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t(`filters.${item}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {!hasLoadedWorkspace ? (
          <ObjectivesSidebarSkeleton />
        ) : (
          groups.map((group) => {
            if (group.commitments.length === 0) return null;
            return (
              <section key={group.id} className="mb-4">
                <div className="mb-1 flex items-center justify-between px-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  <span>{group.name}</span>
                  <span>{group.commitments.length}</span>
                </div>
                <div>
                  {group.commitments.map((commitment) => {
                    const active = commitment.id === selectedId;
                    const done = commitment.items.filter(
                      (item) => item.status === "done"
                    ).length;
                    return (
                      <button
                        key={commitment.id}
                        onClick={() => onSelect(commitment.id)}
                        className={`mb-1 w-full rounded-lg px-3 py-3 text-left transition-colors ${
                          active
                            ? "bg-white/[0.08] text-zinc-100"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-semibold text-zinc-100">
                            {commitment.title}
                          </p>
                          <ChevronRight
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              active ? "text-zinc-300" : "text-zinc-700"
                            }`}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
                          <span className={statusClass(commitment.status)}>
                            {statusLabel(commitment.status)}
                          </span>
                          <span>
                            {t("doneCount", {
                              done,
                              total: commitment.items.length,
                            })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </aside>
  );
}
