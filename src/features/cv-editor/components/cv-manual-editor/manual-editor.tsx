"use client";

import { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Briefcase, Code, GraduationCap, Languages, Save, User, FileText, Wrench, Award, FolderOpen, Heart, Trophy, BookOpen } from "lucide-react";
import type { StandardCVProfile } from "@/lib/cv-profile";
import {
  getOrderedRenderableSections,
  getTemplateAccentColor,
  type CVRenderableSectionId,
  type CVTemplateId,
  type CVTemplateLocale,
} from "@/lib/cv-templates";
import { SectionBasics } from "./section-basics";
import { SectionSummary } from "./section-summary";
import { SectionExperience } from "./section-experience";
import { SectionEducation } from "./section-education";
import { SectionSkills } from "./section-skills";
import { SectionLanguages } from "./section-languages";
import { SectionNamedItems } from "./section-named-items";
import { EditableBulletList } from "./editable-bullet-list";
import { ManualEditorPresentation } from "./manual-editor-presentation";
import { ManualEditorSectionItem } from "./manual-editor-section-item";

interface ManualEditorProps {
  profile: StandardCVProfile;
  templateId: CVTemplateId;
  locale: CVTemplateLocale;
  saveState: "idle" | "saving" | "saved";
  onChange: (updater: (prev: StandardCVProfile) => StandardCVProfile) => void;
  onSave: () => void;
}

export function ManualEditor({
  profile,
  templateId,
  locale,
  saveState,
  onChange,
  onSave,
}: ManualEditorProps) {
  const t = useTranslations("cvEditor.manual");
  const sectionOrder = getOrderedRenderableSections(profile);
  const [visualSectionOrder, setVisualSectionOrder] = useState<CVRenderableSectionId[]>(sectionOrder);
  const [draggedSection, setDraggedSection] = useState<CVRenderableSectionId | null>(null);
  const [originalSectionOrder, setOriginalSectionOrder] = useState<CVRenderableSectionId[] | null>(null);

  useEffect(() => {
    if (!draggedSection) {
      setVisualSectionOrder(sectionOrder);
    }
  }, [sectionOrder, draggedSection]);

  const handleDragStart = (sectionId: CVRenderableSectionId) => {
    setDraggedSection(sectionId);
    setOriginalSectionOrder(visualSectionOrder);
  };

  const handleDragOverItem = (targetIndex: number) => {
    if (!draggedSection) return;
    const currentIndex = visualSectionOrder.indexOf(draggedSection);
    if (currentIndex < 0 || currentIndex === targetIndex) return;

    const nextOrder = [...visualSectionOrder];
    nextOrder.splice(currentIndex, 1);
    nextOrder.splice(targetIndex, 0, draggedSection);
    setVisualSectionOrder(nextOrder);
  };

  const handleChange = useCallback((updater: (prev: StandardCVProfile) => StandardCVProfile) => {
    onChange(updater);
  }, [onChange]);

  const updatePresentation = useCallback((
    updater: (prev: NonNullable<StandardCVProfile["presentation"]>) => StandardCVProfile["presentation"]
  ) => {
    handleChange((prev) => {
      const nextPresentation = updater(prev.presentation ?? {});
      return { ...prev, presentation: nextPresentation };
    });
  }, [handleChange]);

  const sectionTitles = profile.presentation?.sectionTitles ?? {};
  const hiddenSections = profile.presentation?.hiddenSections ?? [];
  const accentColor = profile.presentation?.accentColor ?? getTemplateAccentColor(templateId);
  const tagsColor = profile.presentation?.tagsColor ?? "#f4f4f5";

  const moveSection = (section: CVRenderableSectionId, direction: -1 | 1) => {
    const index = sectionOrder.indexOf(section);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    moveSectionToIndex(section, targetIndex);
  };

  const moveSectionToIndex = (section: CVRenderableSectionId, targetIndex: number) => {
    const index = sectionOrder.indexOf(section);
    if (index < 0 || targetIndex < 0 || targetIndex >= sectionOrder.length || index === targetIndex) {
      return;
    }

    const nextOrder = [...sectionOrder];
    nextOrder.splice(index, 1);
    nextOrder.splice(targetIndex, 0, section);
    updatePresentation((presentation) => ({
      ...presentation,
      sectionOrder: nextOrder,
    }));
  };

  const updateSectionTitle = (section: CVRenderableSectionId, title: string) => {
    updatePresentation((presentation) => {
      const nextTitles = { ...(presentation.sectionTitles ?? {}) };
      const trimmedTitle = title.trim();
      if (trimmedTitle) {
        nextTitles[section] = title;
      } else {
        delete nextTitles[section];
      }
      return {
        ...presentation,
        sectionTitles: Object.keys(nextTitles).length > 0 ? nextTitles : undefined,
      };
    });
  };

  const toggleSectionVisibility = (sectionId: CVRenderableSectionId) => {
    updatePresentation((presentation) => {
      const currentHidden = presentation.hiddenSections ?? [];
      const nextHidden = currentHidden.includes(sectionId)
        ? currentHidden.filter((id) => id !== sectionId)
        : [...currentHidden, sectionId];
      return {
        ...presentation,
        hiddenSections: nextHidden.length > 0 ? nextHidden : undefined,
      };
    });
  };

  const updateAccentColor = (accentColor: string) => {
    updatePresentation((presentation) => ({
      ...presentation,
      accentColor,
    }));
  };

  const updateTagsColor = (tagsColor: string) => {
    updatePresentation((presentation) => ({
      ...presentation,
      tagsColor,
    }));
  };

  const handleDropSection = () => {
    if (!draggedSection) return;
    updatePresentation((presentation) => ({
      ...presentation,
      sectionOrder: visualSectionOrder,
    }));
    setDraggedSection(null);
    setOriginalSectionOrder(null);
  };

  const handleDragEnd = () => {
    if (originalSectionOrder) {
      setVisualSectionOrder(originalSectionOrder);
    }
    setDraggedSection(null);
    setOriginalSectionOrder(null);
  };

  const resetPresentation = () => {
    handleChange((prev) => {
      const next = { ...prev };
      delete next.presentation;
      return next;
    });
  };

  const sections = [
    { id: "basics", label: t("sections.basics"), icon: User, content: <SectionBasics basics={profile.basics ?? {}} onChange={(basics) => handleChange((p) => ({ ...p, basics }))} /> },
    { id: "summary", label: t("sections.summary"), icon: FileText, content: <SectionSummary summary={profile.summary ?? ""} onChange={(summary) => handleChange((p) => ({ ...p, summary }))} /> },
    { id: "experience", label: t("sections.experience"), icon: Briefcase, count: profile.experience?.length, content: <SectionExperience items={profile.experience ?? []} onChange={(experience) => handleChange((p) => ({ ...p, experience }))} /> },
    { id: "education", label: t("sections.education"), icon: GraduationCap, count: profile.education?.length, content: <SectionEducation items={profile.education ?? []} onChange={(education) => handleChange((p) => ({ ...p, education }))} /> },
    { id: "skills", label: t("sections.skills"), icon: Wrench, count: profile.skills?.length, content: <SectionSkills items={profile.skills ?? []} onChange={(skills) => handleChange((p) => ({ ...p, skills }))} /> },
    { id: "technicalSkills", label: t("sections.technicalSkills"), icon: Code, count: profile.technicalSkills?.length, content: <EditableBulletList items={profile.technicalSkills ?? []} onChange={(technicalSkills) => handleChange((p) => ({ ...p, technicalSkills }))} placeholder={t("technicalSkillsPlaceholder")} /> },
    { id: "languages", label: t("sections.languages"), icon: Languages, count: profile.languages?.length, content: <SectionLanguages items={profile.languages ?? []} onChange={(languages) => handleChange((p) => ({ ...p, languages }))} /> },
    { id: "certifications", label: t("sections.certifications"), icon: Award, count: profile.certifications?.length, content: <SectionNamedItems items={profile.certifications ?? []} onChange={(certifications) => handleChange((p) => ({ ...p, certifications }))} sectionLabel={t("singular.certification")} /> },
    { id: "projects", label: t("sections.projects"), icon: FolderOpen, count: profile.projects?.length, content: <SectionNamedItems items={profile.projects ?? []} onChange={(projects) => handleChange((p) => ({ ...p, projects }))} sectionLabel={t("singular.project")} /> },
    { id: "awards", label: t("sections.awards"), icon: Trophy, count: profile.awards?.length, content: <SectionNamedItems items={profile.awards ?? []} onChange={(awards) => handleChange((p) => ({ ...p, awards }))} sectionLabel={t("singular.award")} /> },
    { id: "publications", label: t("sections.publications"), icon: BookOpen, count: profile.publications?.length, content: <SectionNamedItems items={profile.publications ?? []} onChange={(publications) => handleChange((p) => ({ ...p, publications }))} sectionLabel={t("singular.publication")} /> },
    { id: "volunteering", label: t("sections.volunteering"), icon: Heart, count: profile.volunteering?.length, content: <SectionNamedItems items={profile.volunteering ?? []} onChange={(volunteering) => handleChange((p) => ({ ...p, volunteering }))} sectionLabel={t("singular.volunteering")} /> },
  ];

  const basicsSection = sections.find((s) => s.id === "basics")!;
  const dynamicSections = visualSectionOrder
    .map((id) => sections.find((s) => s.id === id))
    .filter(Boolean) as Array<typeof sections[0]>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
        <div className="flex items-center gap-2">
          {saveState === "saving" && <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] text-teal-400 animate-pulse">{t("saving")}</span>}
          {saveState === "saved" && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">{t("saved")}</span>}
          <button
            onClick={onSave}
            className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/5 px-2 py-1 text-[11px] text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <Save className="h-3 w-3" />
          </button>
        </div>
      </div>

      <ManualEditorPresentation
        accentColor={accentColor}
        tagsColor={tagsColor}
        onAccentColorChange={updateAccentColor}
        onTagsColorChange={updateTagsColor}
        onReset={resetPresentation}
      />

      <Accordion
        defaultValue={["basics"]}
        className="space-y-1 animate-in fade-in duration-300"
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          handleDropSection();
        }}
      >
        {/* Personal Details (Basics) Section - Fixed at the top, not reorderable, always visible */}
        <AccordionItem value="basics" className="border border-transparent rounded-xl group/accordion-item">
          <AccordionTrigger className="rounded-xl px-3 py-2.5 hover:bg-white/[0.03] hover:no-underline data-[state=open]:bg-white/[0.03] [&>svg]:text-zinc-600">
            <div className="flex items-center gap-2">
              <basicsSection.icon className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-300">{basicsSection.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-1 pt-2 pb-1">
            {basicsSection.content}
          </AccordionContent>
        </AccordionItem>

        {dynamicSections.map((section, index) => {
          const isHidden = hiddenSections.includes(section.id as CVRenderableSectionId);
          const isBeingDragged = draggedSection === section.id;

          return (
            <ManualEditorSectionItem
              key={section.id}
              section={section}
              index={index}
              sectionOrderLength={sectionOrder.length}
              isHidden={isHidden}
              isBeingDragged={isBeingDragged}
              sectionTitle={sectionTitles[section.id as CVRenderableSectionId] ?? ""}
              onDragStart={handleDragStart}
              onDragOverItem={(targetIndex, sectionId) => {
                if (draggedSection && draggedSection !== sectionId) {
                  handleDragOverItem(targetIndex);
                }
              }}
              onDropSection={handleDropSection}
              onDragEnd={handleDragEnd}
              onMoveSection={moveSection}
              onUpdateSectionTitle={updateSectionTitle}
              onToggleVisibility={toggleSectionVisibility}
              locale={locale}
            />
          );
        })}
      </Accordion>
    </div>
  );
}
