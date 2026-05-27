import type {
  ObjectiveContext,
  ObjectiveStatus,
  ObjectiveWithRelations,
} from "../api/objectives-api";
import type { ObjectivesFilter } from "../hooks/use-objectives-route-state";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { ObjectivesSidebarSkeleton } from "./objectives-skeleton";
import { ObjectiveListItem } from "./objective-list-item";

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
    <FeatureSidebarPanel
      header={
        <div className="flex rounded-lg border border-white/[0.06] bg-[#101018]/40 p-1">
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
      }
    >
      {!hasLoadedWorkspace ? (
        <ObjectivesSidebarSkeleton />
      ) : (
        groups.map((group) => {
          if (group.commitments.length === 0) return null;
          return (
            <section key={group.id} className="mb-5 last:mb-0">
              <div className="mb-2.5 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                <span>{group.name}</span>
                <span className="rounded-full bg-white/[0.04] border border-white/[0.02] px-2 py-0.5 text-zinc-400">
                  {group.commitments.length}
                </span>
              </div>
              <div className="space-y-1">
                {group.commitments.map((commitment) => (
                  <ObjectiveListItem
                    key={commitment.id}
                    commitment={commitment}
                    active={commitment.id === selectedId}
                    onSelect={onSelect}
                    statusLabel={statusLabel}
                    t={t}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
    </FeatureSidebarPanel>
  );
}
