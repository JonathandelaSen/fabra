"use client";

import type { CVLanguagePrimitives } from "@/lib/cv-profile";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

const inputClass = "w-full rounded-xl border border-line bg-panel-hover px-3 py-2 text-sm text-text-main placeholder:text-text-faint focus:border-accent-teal-border focus:outline-none";

interface Props {
  items: CVLanguagePrimitives[];
  onChange: (items: CVLanguagePrimitives[]) => void;
}

export function SectionLanguages({ items, onChange }: Props) {
  const t = useTranslations("cvEditor.manual.languages");
  const update = (index: number, lang: CVLanguagePrimitives) => {
    const next = [...items];
    next[index] = lang;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((lang, i) => (
        <div key={i} className="group flex items-center gap-2">
          <input type="text" value={lang.name ?? ""} onChange={(e) => update(i, { ...lang, name: e.target.value })} placeholder={t("language")} className={`${inputClass} flex-1`} />
          <input type="text" value={lang.level ?? ""} onChange={(e) => update(i, { ...lang, level: e.target.value })} placeholder={t("level")} className={`${inputClass} w-1/3`} />
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-text-faint hover:text-danger-text transition-opacity">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, { name: "", level: "" }])} className="flex items-center gap-1.5 text-[11px] text-accent-teal-text hover:text-accent-teal-text pt-1">
        <Plus className="h-3 w-3" />
        {t("addLanguage")}
      </button>
    </div>
  );
}
