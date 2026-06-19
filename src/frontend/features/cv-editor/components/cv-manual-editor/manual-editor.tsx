"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Accordion } from "@/components/ui/accordion";
import { Briefcase, Code, GraduationCap, Languages, User, FileText, Wrench, Award, FolderOpen, Heart, Trophy, BookOpen } from "lucide-react";
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
import { ManualEditorBasicsItem } from "./manual-editor-basics-item";
import { ManualEditorHeader } from "./manual-editor-header";
import type { CVSaveState } from "../../types";
interface ManualEditorProps { profile: StandardCVProfile; templateId: CVTemplateId; locale: CVTemplateLocale; saveState: CVSaveState; onChange: (updater: (prev: StandardCVProfile) => StandardCVProfile) => void; onSave: () => void; }

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
  const sectionOrderKey = sectionOrder.join("|");
  const stableSectionOrder = useMemo(() => sectionOrder, [sectionOrderKey]);
  const [visualSectionOrder, setVisualSectionOrder] = useState<CVRenderableSectionId[]>(sectionOrder);
  const [draggedSection, setDraggedSection] = useState<CVRenderableSectionId | null>(null);
  const [originalSectionOrder, setOriginalSectionOrder] = useState<CVRenderableSectionId[] | null>(null);

  useEffect(() => {
    if (!draggedSection) {
      setVisualSectionOrder(stableSectionOrder);
    }
  }, [stableSectionOrder, draggedSection]);

  const startDrag = (sectionId: CVRenderableSectionId) => {
    setDraggedSection(sectionId);
    setOriginalSectionOrder(visualSectionOrder);
  };

  const dragOverItem = (targetIndex: number) => {
    if (!draggedSection) return;
    const currentIndex = visualSectionOrder.indexOf(draggedSection);
    if (currentIndex < 0 || currentIndex === targetIndex) return;

    const nextOrder = [...visualSectionOrder];
    nextOrder.splice(currentIndex, 1);
    nextOrder.splice(targetIndex, 0, draggedSection);
    setVisualSectionOrder(nextOrder);
  };

  const changeProfile = useCallback((updater: (prev: StandardCVProfile) => StandardCVProfile) => {
    onChange(updater);
  }, [onChange]);

  const applyPresentation = useCallback((updater: (prev: NonNullable<StandardCVProfile["presentation"]>) => StandardCVProfile["presentation"]) => {
    changeProfile((prev) => {
      const nextPresentation = updater(prev.presentation ?? {});
      return { ...prev, presentation: nextPresentation };
    });
  }, [changeProfile]);

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
    applyPresentation((presentation) => ({
      ...presentation,
      sectionOrder: nextOrder,
    }));
  };

  const setSectionTitle = (section: CVRenderableSectionId, title: string) => {
    applyPresentation((presentation) => {
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
    applyPresentation((presentation) => {
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

  const setAccentColor = (accentColor: string) => {
    applyPresentation((presentation) => ({
      ...presentation,
      accentColor,
    }));
  };

  const setTagsColor = (tagsColor: string) => {
    applyPresentation((presentation) => ({
      ...presentation,
      tagsColor,
    }));
  };

  const dropSection = () => {
    if (!draggedSection) return;
    applyPresentation((presentation) => ({
      ...presentation,
      sectionOrder: visualSectionOrder,
    }));
    setDraggedSection(null);
    setOriginalSectionOrder(null);
  };

  const endDrag = () => {
    if (originalSectionOrder) {
      setVisualSectionOrder(originalSectionOrder);
    }
    setDraggedSection(null);
    setOriginalSectionOrder(null);
  };

  const resetPresentation = () => {
    changeProfile((prev) => {
      const next = { ...prev };
      delete next.presentation;
      return next;
    });
  };

  const sections = [
    { id: "basics", label: t("sections.basics"), icon: User, content: <SectionBasics basics={profile.basics ?? {}} onChange={(basics) => changeProfile((p) => ({ ...p, basics }))} /> },
    { id: "summary", label: t("sections.summary"), icon: FileText, content: <SectionSummary summary={profile.summary ?? ""} onChange={(summary) => changeProfile((p) => ({ ...p, summary }))} /> },
    { id: "experience", label: t("sections.experience"), icon: Briefcase, count: profile.experience?.length, content: <SectionExperience items={profile.experience ?? []} onChange={(experience) => changeProfile((p) => ({ ...p, experience }))} /> },
    { id: "education", label: t("sections.education"), icon: GraduationCap, count: profile.education?.length, content: <SectionEducation items={profile.education ?? []} onChange={(education) => changeProfile((p) => ({ ...p, education }))} /> },
    { id: "skills", label: t("sections.skills"), icon: Wrench, count: profile.skills?.length, content: <SectionSkills items={profile.skills ?? []} onChange={(skills) => changeProfile((p) => ({ ...p, skills }))} /> },
    { id: "technicalSkills", label: t("sections.technicalSkills"), icon: Code, count: profile.technicalSkills?.length, content: <EditableBulletList items={profile.technicalSkills ?? []} onChange={(technicalSkills) => changeProfile((p) => ({ ...p, technicalSkills }))} placeholder={t("technicalSkillsPlaceholder")} /> },
    { id: "languages", label: t("sections.languages"), icon: Languages, count: profile.languages?.length, content: <SectionLanguages items={profile.languages ?? []} onChange={(languages) => changeProfile((p) => ({ ...p, languages }))} /> },
    { id: "certifications", label: t("sections.certifications"), icon: Award, count: profile.certifications?.length, content: <SectionNamedItems items={profile.certifications ?? []} onChange={(certifications) => changeProfile((p) => ({ ...p, certifications }))} sectionLabel={t("singular.certification")} /> },
    { id: "projects", label: t("sections.projects"), icon: FolderOpen, count: profile.projects?.length, content: <SectionNamedItems items={profile.projects ?? []} onChange={(projects) => changeProfile((p) => ({ ...p, projects }))} sectionLabel={t("singular.project")} /> },
    { id: "awards", label: t("sections.awards"), icon: Trophy, count: profile.awards?.length, content: <SectionNamedItems items={profile.awards ?? []} onChange={(awards) => changeProfile((p) => ({ ...p, awards }))} sectionLabel={t("singular.award")} /> },
    { id: "publications", label: t("sections.publications"), icon: BookOpen, count: profile.publications?.length, content: <SectionNamedItems items={profile.publications ?? []} onChange={(publications) => changeProfile((p) => ({ ...p, publications }))} sectionLabel={t("singular.publication")} /> },
    { id: "volunteering", label: t("sections.volunteering"), icon: Heart, count: profile.volunteering?.length, content: <SectionNamedItems items={profile.volunteering ?? []} onChange={(volunteering) => changeProfile((p) => ({ ...p, volunteering }))} sectionLabel={t("singular.volunteering")} /> },
  ];

  const basicsSection = sections.find((s) => s.id === "basics")!;
  const dynamicSections = visualSectionOrder
    .map((id) => sections.find((s) => s.id === id))
    .filter(Boolean) as Array<typeof sections[0]>;

  return (
    <div className="space-y-4">
      <ManualEditorHeader saveState={saveState} onSave={onSave} t={t} />

      <ManualEditorPresentation
        accentColor={accentColor}
        tagsColor={tagsColor}
        onAccentColorChange={setAccentColor}
        onTagsColorChange={setTagsColor}
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
          dropSection();
        }}
      >
        <ManualEditorBasicsItem section={basicsSection} />

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
              onDragStart={startDrag}
              onDragOverItem={(targetIndex, sectionId) => {
                if (draggedSection && draggedSection !== sectionId) {
                  dragOverItem(targetIndex);
                }
              }}
              onDropSection={dropSection}
              onDragEnd={endDrag}
              onMoveSection={moveSection}
              onUpdateSectionTitle={setSectionTitle}
              onToggleVisibility={toggleSectionVisibility}
              locale={locale}
            />
          );
        })}
      </Accordion>
    </div>
  );
}
