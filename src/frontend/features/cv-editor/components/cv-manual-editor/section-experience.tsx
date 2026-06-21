"use client";

import type { CVExperiencePrimitives } from "@/lib/cv-profile";
import { ArraySectionWrapper } from "./array-section-wrapper";
import { EditableBulletList } from "./editable-bullet-list";
import { useTranslations } from "next-intl";

const inputClass = "w-full rounded-xl border border-line bg-panel-hover px-3 py-2 text-sm text-text-main placeholder:text-text-faint focus:border-accent-teal-border focus:outline-none";
const labelClass = "text-[11px] font-medium text-text-muted uppercase tracking-wider";
const ROLE_PLACEHOLDER = "Software Engineer";
const COMPANY_PLACEHOLDER = "Edpuzzle";

interface Props {
  items: CVExperiencePrimitives[];
  onChange: (items: CVExperiencePrimitives[]) => void;
}

function ExperienceFields({ item, update }: { item: CVExperiencePrimitives; update: (v: CVExperiencePrimitives) => void }) {
  const t = useTranslations("cvEditor.manual.experience");
  const set = (key: string, value: unknown) => update({ ...item, [key]: value });
  const setDate = (key: string, value: unknown) => update({ ...item, dates: { ...item.dates, [key]: value } });

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>{t("role")}</label><input type="text" value={item.role ?? ""} onChange={(e) => set("role", e.target.value)} placeholder={ROLE_PLACEHOLDER} className={inputClass} /></div>
        <div><label className={labelClass}>{t("company")}</label><input type="text" value={item.company ?? ""} onChange={(e) => set("company", e.target.value)} placeholder={COMPANY_PLACEHOLDER} className={inputClass} /></div>
      </div>
      <div><label className={labelClass}>{t("location")}</label><input type="text" value={item.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder={t("locationPlaceholder")} className={inputClass} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>{t("start")}</label><input type="text" value={item.dates?.start ?? ""} onChange={(e) => setDate("start", e.target.value)} placeholder={t("startPlaceholder")} className={inputClass} /></div>
        <div>
          <label className={labelClass}>{t("end")}</label>
          <input type="text" value={item.dates?.current ? t("current") : (item.dates?.end ?? "")} onChange={(e) => { const v = e.target.value; if (v.toLowerCase() === t("current").toLowerCase()) { setDate("current", true); } else { update({ ...item, dates: { ...item.dates, end: v, current: false } }); } }} placeholder={t("endPlaceholder")} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>{t("achievements")}</label>
        <EditableBulletList items={item.bullets ?? []} onChange={(bullets) => set("bullets", bullets)} placeholder={t("achievementPlaceholder")} />
      </div>
    </>
  );
}

export function SectionExperience({ items, onChange }: Props) {
  const t = useTranslations("cvEditor.manual.sections");
  return (
    <ArraySectionWrapper
      items={items}
      onChange={onChange}
      createEmpty={() => ({ role: "", company: "", bullets: [] })}
      getPreview={(item) => [item.role, item.company].filter(Boolean).join(" @ ")}
      label={t("experience")}
      renderItem={(item, _, update) => <ExperienceFields item={item} update={update} />}
    />
  );
}
