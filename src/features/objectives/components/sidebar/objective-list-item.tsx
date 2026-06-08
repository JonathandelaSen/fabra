import type {
  ObjectiveWithRelations,
} from "../../api/objectives-api";
import { SidebarListItem } from "@/components/shared/sidebar-list-item";

interface ObjectiveListItemProps {
  commitment: ObjectiveWithRelations;
  active: boolean;
  onSelect: (id: string) => void;
  t: (key: string, values?: Record<string, number>) => string;
}

export function ObjectiveListItem({
  commitment,
  active,
  onSelect,
  t,
}: ObjectiveListItemProps) {
  const done = commitment.items.filter(
    (item) => item.status === "done"
  ).length;

  return (
    <SidebarListItem
      title={commitment.title}
      selected={active}
      onClick={() => onSelect(commitment.id)}
      titleClamp={2}
      footer={
        <>
          <span className="text-text-muted font-medium text-xs">
            {t("doneCount", {
              done,
              total: commitment.items.length,
            })}
          </span>
        </>
      }
    />
  );
}
