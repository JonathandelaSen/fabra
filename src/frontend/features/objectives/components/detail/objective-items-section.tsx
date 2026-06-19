import { Calendar, Check, Circle, Pencil, Save, Trash2, X } from "lucide-react";
import { useLocale } from "next-intl";
import type { ObjectiveItem, ObjectiveItemStatus } from "../../types";
import { formatDate, itemStatusLabels, type ItemEditForm } from "../objectives-ui";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_SIZES,
  ACTION_ICON_BUTTON_TONES,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/frontend/components/shared/action-buttons";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Select } from "@/frontend/components/ui/select";
import { BasicPanel } from "@/frontend/components/shared/basic-panel";
import { ObjectiveItemAddBar, ObjectiveItemsHeader } from "./objective-items-section-parts";

interface ObjectiveItemsProps {
  completion: number;
  doneCount: number;
  editingItemId: string | null;
  isEmpty: boolean;
  itemForm: ItemEditForm | null;
  items: ObjectiveItem[];
  newItemTitle: string;
  saving: boolean;
  totalItems: number;
  onCreateItem: () => void;
  onDeleteItem: (item: ObjectiveItem) => void;
  onEditItem: (item: ObjectiveItem) => void;
  onItemFormChange: (form: ItemEditForm | null) => void;
  onItemTitleChange: (title: string) => void;
  onSaveItem: () => void;
  onStopEditingItem: () => void;
  onUpdateItemStatus: (item: ObjectiveItem, status: ObjectiveItemStatus) => void;
  itemStatusLabel: (status: ObjectiveItemStatus) => string;
  t: (key: string, values?: Record<string, number | string>) => string;
}

export function ObjectiveItems({
  completion,
  doneCount,
  editingItemId,
  isEmpty,
  itemForm,
  items,
  newItemTitle,
  saving,
  totalItems,
  onCreateItem,
  onDeleteItem,
  onEditItem,
  onItemFormChange,
  onItemTitleChange,
  onSaveItem,
  onStopEditingItem,
  onUpdateItemStatus,
  itemStatusLabel,
  t,
}: ObjectiveItemsProps) {
  const locale = useLocale();

  return (
    <BasicPanel className="flex flex-col overflow-hidden">
      <ObjectiveItemsHeader completion={completion} doneCount={doneCount} totalItems={totalItems} t={t} />

      <div className="p-3 sm:p-5 flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-faint italic">
            {t("items.empty")}
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => {
              const isEditing = editingItemId === item.id && itemForm;
              return (
                <div
                  key={item.id}
                  className="group rounded-xl border border-line bg-panel-subtle hover:bg-panel-control transition-colors duration-150 overflow-hidden"
                >
                  {isEditing && itemForm ? (
                    <div className="space-y-3 p-4 bg-panel-elevated">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-action-text uppercase tracking-wider">
                          {t("items.edit")}
                        </span>
                        <ActionIconButton
                          icon={X}
                          buttonSize={ACTION_ICON_BUTTON_SIZES.XS}
                          tone={ACTION_ICON_BUTTON_TONES.MUTED}
                          onClick={onStopEditingItem}
                        />
                      </div>
                      <Input
                        value={itemForm.title}
                        onChange={(e) =>
                          onItemFormChange({ ...itemForm, title: e.target.value })
                        }
                        placeholder={t("fields.title")}
                        className="bg-field-code border-line focus-visible:ring-success-border"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {t("fields.status")}
                          </span>
                          <Select
                            value={itemForm.status}
                          onChange={(e) => onItemFormChange({ ...itemForm, status: e.target.value as ObjectiveItemStatus })}
                          >
                            {Object.keys(itemStatusLabels).map((key) => (
                              <option key={key} value={key} className="bg-panel-elevated text-text-on-bright">
                                {itemStatusLabel(key as ObjectiveItemStatus)}
                              </option>
                            ))}
                          </Select>
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {t("fields.dueDate")}
                          </span>
                          <Input
                            type="date"
                            value={itemForm.dueDate}
                            onChange={(e) => onItemFormChange({ ...itemForm, dueDate: e.target.value })}
                            className="bg-field-code border-line focus-visible:ring-success-border py-1.5 h-auto text-xs"
                          />
                        </label>
                      </div>
                      <label className="block space-y-1">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          {t("fields.notes")}
                        </span>
                        <Textarea
                          rows={2}
                          value={itemForm.notes}
                          onChange={(e) => onItemFormChange({ ...itemForm, notes: e.target.value })}
                          placeholder={t("placeholders.itemNotes")}
                          className="bg-field-code border-line text-xs focus-visible:ring-success-border min-h-0 py-2"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          {t("fields.evidence")}
                        </span>
                        <Textarea
                          rows={2}
                          value={itemForm.evidenceNotes}
                          onChange={(e) => onItemFormChange({ ...itemForm, evidenceNotes: e.target.value })}
                          placeholder={t("placeholders.evidence")}
                          className="bg-field-code border-line text-xs focus-visible:ring-success-border min-h-0 py-2"
                        />
                      </label>
                      <div className="flex justify-end gap-2 pt-1 border-t border-line">
                        <IconTextButton
                          icon={X}
                          onClick={onStopEditingItem}
                          className="h-8"
                        >
                          {t("actions.cancel")}
                        </IconTextButton>
                        <IconTextButton
                          icon={Save}
                          loading={saving}
                          tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
                          onClick={onSaveItem}
                          disabled={saving}
                        >
                          {t("actions.save")}
                        </IconTextButton>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-3.5">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <ActionIconButton
                          icon={item.status === "done" ? Check : Circle}
                          buttonSize={ACTION_ICON_BUTTON_SIZES.XS}
                          tone={ACTION_ICON_BUTTON_TONES.SUCCESS}
                          onClick={() =>
                            onUpdateItemStatus(
                              item,
                              item.status === "done" ? "todo" : "done"
                            )
                          }
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold transition-all ${
                              item.status === "done"
                                ? "text-text-muted line-through font-normal"
                                : "text-text-main"
                            }`}
                          >
                            {item.title}
                          </p>
                          {(item.notes || item.evidenceNotes || item.dueDate) && (
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted font-medium">
                              {item.dueDate && (
                                <span className="inline-flex items-center gap-1 text-warning-text/70">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(item.dueDate, locale)}</span>
                                </span>
                              )}
                              {item.notes && (
                                <span className="text-text-muted whitespace-pre-wrap leading-relaxed">
                                  {item.notes}
                                </span>
                              )}
                            </div>
                          )}
                          {item.evidenceNotes && (
                            <div className="mt-2 rounded bg-panel-control border border-line p-2 text-xs italic text-text-muted leading-relaxed">
                              <span className="font-bold text-[9px] uppercase tracking-wider text-text-faint block not-italic mb-0.5">
                                {t("fields.evidence")}
                              </span>
                              {item.evidenceNotes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 w-full sm:w-auto justify-end mt-2 pt-2 border-t border-line sm:mt-0 sm:pt-0 sm:border-t-0 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <ActionIconButton
                          icon={Pencil}
                          tone={ACTION_ICON_BUTTON_TONES.MUTED}
                          onClick={() => onEditItem(item)}
                        />
                        <ActionIconButton
                          icon={Trash2}
                          tone={ACTION_ICON_BUTTON_TONES.DANGER}
                          onClick={() => onDeleteItem(item)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <ObjectiveItemAddBar isEmpty={isEmpty} newItemTitle={newItemTitle} saving={saving} onCreateItem={onCreateItem} onItemTitleChange={onItemTitleChange} t={t} />
      </div>
    </BasicPanel>
  );
}
