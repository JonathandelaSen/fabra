import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";

export function ObjectiveItemsHeader({ completion, doneCount, totalItems, t }: { completion: number; doneCount: number; totalItems: number; t: (key: string, values?: Record<string, number | string>) => string }) {
  return (
    <div className="border-b border-line/[0.06] px-5 py-4 flex flex-wrap items-center justify-between gap-3 bg-panel/[0.01]">
      <div>
        <h3 className="text-sm font-bold text-text-soft uppercase tracking-wider">{t("items.title")}</h3>
        <p className="text-xs text-text-muted mt-0.5">{t("items.progress", { done: doneCount, total: totalItems, completion })}</p>
      </div>
      <div className="w-32 bg-panel/[0.04] h-2 rounded-full overflow-hidden border border-line/[0.02] shrink-0">
        <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${completion}%` }} />
      </div>
    </div>
  );
}

export function ObjectiveItemAddBar({ isEmpty, newItemTitle, saving, onCreateItem, onItemTitleChange, t }: { isEmpty: boolean; newItemTitle: string; saving: boolean; onCreateItem: () => void; onItemTitleChange: (title: string) => void; t: (key: string) => string }) {
  return (
    <div className="mt-2 flex gap-2 border-t border-line/[0.04] pt-4">
      <Input
        placeholder={t("items.addPlaceholder")}
        value={newItemTitle}
        onChange={(e) => onItemTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void onCreateItem();
        }}
        disabled={isEmpty}
        className="bg-field-code border-line/[0.06] text-sm h-9 focus-visible:ring-success-border"
      />
      <IconTextButton icon={Plus} tone={ICON_TEXT_BUTTON_TONES.SUCCESS} onClick={onCreateItem} disabled={saving || isEmpty}>
        {t("actions.add")}
      </IconTextButton>
    </div>
  );
}
