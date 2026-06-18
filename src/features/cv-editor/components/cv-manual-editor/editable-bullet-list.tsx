"use client";

import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface EditableBulletListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function EditableBulletList({ items, onChange, placeholder }: EditableBulletListProps) {
  const t = useTranslations("cvEditor.manual");
  const inputPlaceholder = placeholder ?? t("bulletPlaceholder");
  const update = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => onChange([...items, ""]);

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[nextIndex];
    next[nextIndex] = temp;
    onChange(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === items.length - 1) {
        add();
        setTimeout(() => {
          const inputs = e.currentTarget.parentElement?.parentElement?.querySelectorAll("input");
          inputs?.[inputs.length - 1]?.focus();
        }, 0);
      }
    }
    if (e.key === "Backspace" && items[index] === "" && items.length > 1) {
      e.preventDefault();
      remove(index);
    }
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="group flex items-center gap-2">
          <span className="text-[10px] text-text-faint w-3 shrink-0">{i + 1}.</span>
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            placeholder={inputPlaceholder}
            className="flex-1 rounded-xl border border-line/5 bg-panel/5 px-3 py-2 text-sm text-text-main placeholder:text-text-faint focus:border-accent-teal-border focus:outline-none"
          />
          <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="text-text-faint hover:text-accent-teal-text disabled:opacity-20 disabled:pointer-events-none p-1 transition-colors rounded hover:bg-panel/5"
              title={t("moveUp")}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="text-text-faint hover:text-accent-teal-text disabled:opacity-20 disabled:pointer-events-none p-1 transition-colors rounded hover:bg-panel/5"
              title={t("moveDown")}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-text-faint hover:text-danger-text p-1 transition-colors rounded hover:bg-panel/5"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-[11px] text-accent-teal-text hover:text-accent-teal-text pt-1">
        <Plus className="h-3 w-3" />
        {t("addBullet")}
      </button>
    </div>
  );
}
