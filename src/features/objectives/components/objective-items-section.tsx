import { Calendar, Check, Circle, Pencil, Save, Trash2, X, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import type { ObjectiveItem, ObjectiveItemStatus } from "../api/objectives-api";
import { formatDate, itemStatusLabels, type ItemEditForm } from "./objectives-ui";
import { Button } from "@/components/ui/button";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

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
    <div className="rounded-lg border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="border-b border-white/[0.06] px-5 py-4 flex flex-wrap items-center justify-between gap-3 bg-white/[0.01]">
        <div>
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            {t("items.title")}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t("items.progress", { done: doneCount, total: totalItems, completion })}
          </p>
        </div>
        <div className="w-32 bg-white/[0.04] h-2 rounded-full overflow-hidden border border-white/[0.02] shrink-0">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Panel Body */}
      <div className="p-5 flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-600 italic">
            No action items added yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => {
              const isEditing = editingItemId === item.id && itemForm;
              return (
                <div
                  key={item.id}
                  className="group rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-colors duration-150 overflow-hidden"
                >
                  {isEditing && itemForm ? (
                    <div className="space-y-3 p-4 bg-[#14141e]/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                          {t("items.edit")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={onStopEditingItem}
                          className="h-5 w-5 text-zinc-500 hover:text-zinc-200"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={itemForm.title}
                        onChange={(e) =>
                          onItemFormChange({ ...itemForm, title: e.target.value })
                        }
                        placeholder={t("fields.title")}
                        className="bg-zinc-950/50 border-white/[0.06] focus-visible:ring-emerald-500/20"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            {t("fields.status")}
                          </span>
                          <Select
                            value={itemForm.status}
                            onChange={(e) =>
                              onItemFormChange({
                                ...itemForm,
                                status: e.target.value as ObjectiveItemStatus,
                              })
                            }
                          >
                            {Object.keys(itemStatusLabels).map((key) => (
                              <option key={key} value={key} className="bg-[#101018] text-zinc-100">
                                {itemStatusLabel(key as ObjectiveItemStatus)}
                              </option>
                            ))}
                          </Select>
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            {t("fields.dueDate")}
                          </span>
                          <Input
                            type="date"
                            value={itemForm.dueDate}
                            onChange={(e) =>
                              onItemFormChange({ ...itemForm, dueDate: e.target.value })
                            }
                            className="bg-zinc-950/50 border-white/[0.06] focus-visible:ring-emerald-500/20 py-1.5 h-auto text-xs"
                          />
                        </label>
                      </div>
                      <label className="block space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {t("fields.notes")}
                        </span>
                        <Textarea
                          rows={2}
                          value={itemForm.notes}
                          onChange={(e) =>
                            onItemFormChange({ ...itemForm, notes: e.target.value })
                          }
                          placeholder={t("placeholders.itemNotes")}
                          className="bg-zinc-950/50 border-white/[0.06] text-xs focus-visible:ring-emerald-500/20 min-h-0 py-2"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {t("fields.evidence")}
                        </span>
                        <Textarea
                          rows={2}
                          value={itemForm.evidenceNotes}
                          onChange={(e) =>
                            onItemFormChange({
                              ...itemForm,
                              evidenceNotes: e.target.value,
                            })
                          }
                          placeholder={t("placeholders.evidence")}
                          className="bg-zinc-950/50 border-white/[0.06] text-xs focus-visible:ring-emerald-500/20 min-h-0 py-2"
                        />
                      </label>
                      <div className="flex justify-end gap-2 pt-1 border-t border-white/[0.04]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onStopEditingItem}
                          className="h-8 text-zinc-400 hover:bg-white/[0.04]"
                        >
                          {t("actions.cancel")}
                        </Button>
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
                    <div className="flex items-start gap-3 p-3.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onUpdateItemStatus(
                            item,
                            item.status === "done" ? "todo" : "done"
                          )
                        }
                        className="mt-0.5 h-5 w-5 rounded-full p-0 shrink-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 focus-visible:ring-emerald-500/20"
                      >
                        {item.status === "done" ? (
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 stroke-[2]" />
                        )}
                      </Button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold transition-all ${
                            item.status === "done"
                              ? "text-zinc-500 line-through font-normal"
                              : "text-zinc-100"
                          }`}
                        >
                          {item.title}
                        </p>
                        {(item.notes || item.evidenceNotes || item.dueDate) && (
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 font-medium">
                            {item.dueDate && (
                              <span className="inline-flex items-center gap-1 text-amber-500/70">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(item.dueDate, locale)}</span>
                              </span>
                            )}
                            {item.notes && (
                              <span className="text-zinc-400 whitespace-pre-wrap leading-relaxed">
                                {item.notes}
                              </span>
                            )}
                          </div>
                        )}
                        {item.evidenceNotes && (
                          <div className="mt-2 rounded bg-zinc-950/40 border border-white/[0.02] p-2 text-xs italic text-zinc-400 leading-relaxed">
                            <span className="font-bold text-[9px] uppercase tracking-wider text-zinc-600 block not-italic mb-0.5">
                              {t("fields.evidence")}
                            </span>
                            {item.evidenceNotes}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEditItem(item)}
                          className="h-7 w-7 text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onDeleteItem(item)}
                          className="h-7 w-7 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Action Item input bar */}
        <div className="mt-2 flex gap-2 border-t border-white/[0.04] pt-4">
          <Input
            placeholder={t("items.addPlaceholder")}
            value={newItemTitle}
            onChange={(e) => onItemTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onCreateItem();
            }}
            disabled={isEmpty}
            className="bg-zinc-950 border-white/[0.06] text-sm h-9 focus-visible:ring-emerald-500/20"
          />
          <IconTextButton
            icon={Plus}
            tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
            onClick={onCreateItem}
            disabled={saving || isEmpty}
          >
            {t("actions.add")}
          </IconTextButton>
        </div>
      </div>
    </div>
  );
}
