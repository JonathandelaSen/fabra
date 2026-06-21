"use client";

import type { CVBasicsPrimitives, CVLinkPrimitives } from "@/lib/cv-profile";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface SectionBasicsProps {
  basics: CVBasicsPrimitives;
  onChange: (basics: CVBasicsPrimitives) => void;
}

const inputBaseClass = "rounded-xl border border-line bg-panel-hover px-3 py-2 text-sm text-text-main placeholder:text-text-faint focus:border-accent-teal-border focus:outline-none";
const inputClass = `w-full ${inputBaseClass}`;
const labelClass = "text-[11px] font-medium text-text-muted uppercase tracking-wider";
const EMAIL_PLACEHOLDER = "tu@email.com";
const URL_PLACEHOLDER = "https://...";

export function SectionBasics({ basics, onChange }: SectionBasicsProps) {
  const t = useTranslations("cvEditor.manual.basics");
  const set = (key: keyof CVBasicsPrimitives, value: string) => onChange({ ...basics, [key]: value });

  const updateLink = (index: number, field: keyof CVLinkPrimitives, value: string) => {
    const links = [...(basics.links ?? [])];
    links[index] = { ...links[index], [field]: value };
    onChange({ ...basics, links });
  };

  const addLink = () => onChange({ ...basics, links: [...(basics.links ?? []), { label: "", url: "" }] });
  const removeLink = (i: number) => onChange({ ...basics, links: (basics.links ?? []).filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>{t("name")}</label>
        <input type="text" value={basics.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder={t("namePlaceholder")} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("headline")}</label>
        <input type="text" value={basics.headline ?? ""} onChange={(e) => set("headline", e.target.value)} placeholder={t("headlinePlaceholder")} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t("email")}</label>
          <input type="email" value={basics.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder={EMAIL_PLACEHOLDER} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("phone")}</label>
          <input type="tel" value={basics.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+34 600..." className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>{t("location")}</label>
        <input type="text" value={basics.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder={t("locationPlaceholder")} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("links")}</label>
        <div className="space-y-2 mt-1">
          {(basics.links ?? []).map((link, i) => (
            <div key={i} className="group flex items-start gap-2">
              <div className="flex-1 min-w-0 space-y-1.5">
                <input type="text" value={link.label ?? ""} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder={t("linkLabel")} className={inputClass} />
                <input type="url" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder={URL_PLACEHOLDER} className={inputClass} />
              </div>
              <button onClick={() => removeLink(i)} className="shrink-0 mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-text-faint hover:text-danger-text transition-opacity">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button onClick={addLink} className="flex items-center gap-1.5 text-[11px] text-accent-teal-text hover:text-accent-teal-text">
            <Plus className="h-3 w-3" />
            {t("addLink")}
          </button>
        </div>
      </div>
    </div>
  );
}
