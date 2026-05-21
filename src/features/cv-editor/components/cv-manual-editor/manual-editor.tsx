"use client";

import { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowDown, ArrowUp, Briefcase, Code, GraduationCap, GripVertical, Languages, Palette, RotateCcw, Save, User, FileText, Wrench, Award, FolderOpen, Heart, Trophy, BookOpen, Eye, EyeOff } from "lucide-react";
import type { StandardCVProfile } from "@/lib/cv-profile";
import {
  DEFAULT_SECTION_ORDER,
  getOrderedRenderableSections,
  getSectionTitle,
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

      <section className="mb-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.02]">
          <div className="flex items-center gap-2">
            <Palette className="h-3.5 w-3.5 text-teal-400" />
            <h4 className="text-xs font-semibold text-white tracking-wide">{t("presentation")}</h4>
          </div>
          <button
            onClick={resetPresentation}
            className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5"
            title={t("resetPresentation")}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-1">
          <label className="flex items-center justify-between gap-2 cursor-pointer group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] rounded-lg p-2 transition-all">
            <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">{t("accent")}</span>
            <div className="relative flex items-center gap-1.5">
              <div 
                className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-inner" 
                style={{ backgroundColor: accentColor }} 
              />
              <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400">{accentColor}</span>
              <input
                type="color"
                value={accentColor}
                onChange={(event) => updateAccentColor(event.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label={t("accentColor")}
              />
            </div>
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] rounded-lg p-2 transition-all">
            <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">{t("tags")}</span>
            <div className="relative flex items-center gap-1.5">
              <div 
                className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-inner" 
                style={{ backgroundColor: tagsColor }} 
              />
              <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400">{tagsColor}</span>
              <input
                type="color"
                value={tagsColor}
                onChange={(event) => updateTagsColor(event.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label={t("tagsColor")}
              />
            </div>
          </label>
        </div>
      </section>

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

        {/* Dynamic Reorderable and Hideable Sections */}
        {dynamicSections.map((section, index) => {
          const isHidden = hiddenSections.includes(section.id as CVRenderableSectionId);
          const isBeingDragged = draggedSection === section.id;

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className={`border rounded-xl transition-all duration-300 group/accordion-item overflow-hidden ${
                isBeingDragged
                  ? "opacity-20 scale-[0.96] border-dashed border-zinc-700 bg-zinc-950/50 shadow-inner"
                  : isHidden
                  ? "opacity-60 bg-zinc-950/20 border-dashed border-zinc-800/40"
                  : "border-transparent"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                if (draggedSection && draggedSection !== section.id) {
                  const targetIndex = visualSectionOrder.indexOf(section.id as CVRenderableSectionId);
                  if (targetIndex >= 0) {
                    handleDragOverItem(targetIndex);
                  }
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDropSection();
              }}
            >
              <AccordionTrigger className={`rounded-xl px-3 py-2 hover:bg-white/[0.03] hover:no-underline data-[state=open]:bg-white/[0.03] [&>svg]:text-zinc-600 ${
                isHidden ? "bg-zinc-950/10 hover:bg-zinc-950/20" : ""
              }`}>
                <div className="flex items-center justify-between w-full pr-2">
                  {/* Left side: Drag grip, Section Icon, Title Input, Count Badge */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Drag Handle button */}
                    <button
                      draggable
                      onDragStart={(event) => {
                        event.stopPropagation();
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", section.id);
                        handleDragStart(section.id as CVRenderableSectionId);
                      }}
                      onDragEnd={(event) => {
                        event.stopPropagation();
                        handleDragEnd();
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-6 w-5 cursor-grab items-center justify-center text-zinc-600 hover:text-zinc-300 active:cursor-grabbing opacity-40 hover:opacity-100 transition-opacity"
                      title={t("dragSection")}
                      type="button"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>

                    {/* Section Icon */}
                    <section.icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                      isHidden ? "text-zinc-600 opacity-40" : "text-zinc-500"
                    }`} />

                    {/* Section Title Input */}
                    <input
                      value={sectionTitles[section.id as CVRenderableSectionId] ?? ""}
                      onChange={(event) => updateSectionTitle(section.id as CVRenderableSectionId, event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                      placeholder={getSectionTitle(section.id as CVRenderableSectionId, locale)}
                      className={`h-6 w-full min-w-[100px] max-w-[180px] bg-transparent px-1 text-xs font-medium placeholder:text-zinc-600 focus:text-white focus:outline-none transition-colors border-b border-transparent focus:border-teal-500/30 ${
                        isHidden ? "text-zinc-500 opacity-50" : "text-zinc-300"
                      }`}
                    />

                    {/* Count badge */}
                    {section.count !== undefined && section.count > 0 && (
                      <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-zinc-500 shrink-0">
                        {section.count}
                      </span>
                    )}
                  </div>

                  {/* Right side: Reordering arrows & Visibility button */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(event) => event.stopPropagation()}>
                    {/* Move Up/Down buttons (visible on hover of AccordionItem) */}
                    <div className="flex items-center opacity-0 group-hover/accordion-item:opacity-100 transition-opacity">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          moveSection(section.id as CVRenderableSectionId, -1);
                        }}
                        disabled={index === 0}
                        className="inline-flex h-6 w-6 items-center justify-center text-zinc-500 hover:text-white disabled:pointer-events-none disabled:opacity-20"
                        title={t("moveUp")}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          moveSection(section.id as CVRenderableSectionId, 1);
                        }}
                        disabled={index === sectionOrder.length - 1}
                        className="inline-flex h-6 w-6 items-center justify-center text-zinc-500 hover:text-white disabled:pointer-events-none disabled:opacity-20"
                        title={t("moveDown")}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Show/Hide button */}
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSectionVisibility(section.id as CVRenderableSectionId);
                      }}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                        isHidden 
                          ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20" 
                          : "text-zinc-500 hover:text-white hover:bg-white/5"
                      }`}
                      title={isHidden ? t("showSection") : t("hideSection")}
                    >
                      {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-1 pt-2 pb-1">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
