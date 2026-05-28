import type {
  ObjectiveContext,
  ObjectiveStatus,
  ObjectiveWithRelations,
} from "../api/objectives-api";
import type { ObjectivesFilter } from "../hooks/use-objectives-route-state";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { SectionGroupHeader } from "@/components/shared/section-group-header";
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
        <SegmentedControl
          options={(["open", "closed", "all"] as const).map((item) => ({
            value: item,
            label: t(`filters.${item}`),
          }))}
          value={filter}
          onChange={onFilterChange}
        />
      }
    >
      {!hasLoadedWorkspace ? (
        <ObjectivesSidebarSkeleton />
      ) : (
        groups.map((group) => {
          if (group.commitments.length === 0) return null;
          return (
            <section key={group.id} className="mb-5 last:mb-0">
              <SectionGroupHeader label={group.name} count={group.commitments.length} />
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
