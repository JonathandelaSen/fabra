import type {
  ObjectiveContext,
  ObjectiveItem,
  ObjectiveItemStatus,
  ObjectiveOutcome,
  ObjectiveOutcomeStatus,
  ObjectiveOutcomeType,
  ObjectivePriority,
  ObjectiveSource,
  ObjectiveWithRelations,
} from "../../api/objectives-api";
import {
  type ItemEditForm,
  type OutcomeEditForm,
} from "../objectives-ui";
import { ObjectiveItems } from "./objective-items-section";
import { ObjectiveOutcomes } from "./objective-outcomes-section";
import { ObjectiveSummaryPanel } from "./objective-summary-panel";

interface ObjectiveDetailProps {
  editingItemId: string | null;
  editingOutcomeId: string | null;
  isEmpty: boolean;
  itemForm: ItemEditForm | null;
  newItemTitle: string;
  newOutcomeTitle: string;
  newOutcomeType: ObjectiveOutcomeType;
  outcomeForm: OutcomeEditForm | null;
  saving: boolean;
  selected: ObjectiveWithRelations;
  selectedContext: ObjectiveContext | null;
  onCreateItem: () => void;
  onCreateOutcome: () => void;
  onDeleteItem: (item: ObjectiveItem) => void;
  onDeleteObjective: () => void;
  onDeleteOutcome: (outcome: ObjectiveOutcome) => void;
  onEditItem: (item: ObjectiveItem) => void;
  onEditObjective: (objective: ObjectiveWithRelations) => void;
  onEditOutcome: (outcome: ObjectiveOutcome) => void;
  onItemFormChange: (form: ItemEditForm | null) => void;
  onItemTitleChange: (title: string) => void;
  onNewOutcomeTitleChange: (title: string) => void;
  onNewOutcomeTypeChange: (type: ObjectiveOutcomeType) => void;
  onOutcomeFormChange: (form: OutcomeEditForm | null) => void;
  onSaveItem: () => void;
  onSaveOutcome: () => void;
  onUpdateItemStatus: (item: ObjectiveItem, status: ObjectiveItemStatus) => void;
  onUpdateOutcomeStatus: (
    outcome: ObjectiveOutcome,
    status: ObjectiveOutcomeStatus
  ) => void;
  onStopEditingItem: () => void;
  onStopEditingOutcome: () => void;
  itemStatusLabel: (status: ObjectiveItemStatus) => string;
  outcomeLabel: (type: ObjectiveOutcomeType) => string;
  outcomeStatusLabel: (status: ObjectiveOutcomeStatus) => string;
  priorityLabel: (priority: ObjectivePriority) => string;
  sourceLabel: (source: ObjectiveSource) => string;
  t: (key: string, values?: Record<string, number | string>) => string;
}

export function ObjectiveDetail({
  editingItemId,
  editingOutcomeId,
  isEmpty,
  itemForm,
  newItemTitle,
  newOutcomeTitle,
  newOutcomeType,
  outcomeForm,
  saving,
  selected,
  selectedContext,
  onCreateItem,
  onCreateOutcome,
  onDeleteItem,
  onDeleteObjective,
  onDeleteOutcome,
  onEditItem,
  onEditObjective,
  onEditOutcome,
  onItemFormChange,
  onItemTitleChange,
  onNewOutcomeTitleChange,
  onNewOutcomeTypeChange,
  onOutcomeFormChange,
  onSaveItem,
  onSaveOutcome,
  onUpdateItemStatus,
  onUpdateOutcomeStatus,
  onStopEditingItem,
  onStopEditingOutcome,
  itemStatusLabel,
  outcomeLabel,
  outcomeStatusLabel,
  priorityLabel,
  sourceLabel,
  t,
}: ObjectiveDetailProps) {
  const doneCount = selected.items.filter((item) => item.status === "done").length;
  const totalItems = selected.items.length;
  const completion =
    totalItems === 0 ? 0 : Math.round((doneCount / totalItems) * 100);

  return (
    <div className="flex w-full flex-col gap-6">
      <ObjectiveSummaryPanel
        selected={selected}
        selectedContext={selectedContext}
        isEmpty={isEmpty}
        doneCount={doneCount}
        totalItems={totalItems}
        completion={completion}
        onEditObjective={onEditObjective}
        onDeleteObjective={onDeleteObjective}
        priorityLabel={priorityLabel}
        sourceLabel={sourceLabel}
        t={t}
      />

      <ObjectiveItems
        completion={completion}
        doneCount={doneCount}
        editingItemId={editingItemId}
        isEmpty={isEmpty}
        itemForm={itemForm}
        items={selected.items}
        newItemTitle={newItemTitle}
        saving={saving}
        totalItems={totalItems}
        onCreateItem={onCreateItem}
        onDeleteItem={onDeleteItem}
        onEditItem={onEditItem}
        onItemFormChange={onItemFormChange}
        onItemTitleChange={onItemTitleChange}
        onSaveItem={onSaveItem}
        onStopEditingItem={onStopEditingItem}
        onUpdateItemStatus={onUpdateItemStatus}
        itemStatusLabel={itemStatusLabel}
        t={t}
      />

      <ObjectiveOutcomes
        editingOutcomeId={editingOutcomeId}
        isEmpty={isEmpty}
        newOutcomeTitle={newOutcomeTitle}
        newOutcomeType={newOutcomeType}
        outcomeForm={outcomeForm}
        outcomes={selected.outcomes}
        saving={saving}
        onCreateOutcome={onCreateOutcome}
        onDeleteOutcome={onDeleteOutcome}
        onEditOutcome={onEditOutcome}
        onNewOutcomeTitleChange={onNewOutcomeTitleChange}
        onNewOutcomeTypeChange={onNewOutcomeTypeChange}
        onOutcomeFormChange={onOutcomeFormChange}
        onSaveOutcome={onSaveOutcome}
        onStopEditingOutcome={onStopEditingOutcome}
        onUpdateOutcomeStatus={onUpdateOutcomeStatus}
        outcomeLabel={outcomeLabel}
        outcomeStatusLabel={outcomeStatusLabel}
        t={t}
      />
    </div>
  );
}
