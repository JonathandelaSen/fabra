"use client";

import type React from "react";
import { buildExternalLinkHref, type CVProfilePrimitives } from "@/lib/cv-profile";
import {
  getOrderedRenderableSections,
  getResolvedAccentColor,
  getSectionTitle,
  type CVRenderableSectionId,
  type CVTemplateId,
  type CVTemplateLocale,
} from "@/lib/cv-templates";
import { CVTemplatePreviewSection } from "./cv-template-preview-section";
import { CVTemplatePreviewExperienceItem } from "./cv-template-preview-experience-item";
import { CVTemplatePreviewEducationItem } from "./cv-template-preview-education-item";
import { CVTemplatePreviewNamedItem } from "./cv-template-preview-named-item";
import { CVInlineMarkdown } from "./cv-inline-markdown";

export type CVTemplatePreviewScale = "card" | "full";

interface CVTemplatePreviewProps {
  profile: CVProfilePrimitives;
  templateId: CVTemplateId;
  locale: CVTemplateLocale;
  scale?: CVTemplatePreviewScale;
}

export const hasItems = <T,>(items?: T[]) => Array.isArray(items) && items.length > 0;

export function dateRange(
  dates?: { start?: string; end?: string; current?: boolean }
) {
  if (!dates?.start && !dates?.end) return "";
  if (dates.current) return [dates.start, dates.end || "Present"].filter(Boolean).join(" - ");
  return [dates.start, dates.end].filter(Boolean).join(" - ");
}

const TEMPLATE_CLASS_MAP: Record<CVTemplateId, string> = {
  compact: "cvp-compact",
  classic: "cvp-classic",
  modern: "cvp-modern",
  filo: "cvp-filo",
};

export default function CVTemplatePreview({
  profile,
  templateId,
  locale,
  scale = "full",
}: CVTemplatePreviewProps) {
  const basics = profile.basics ?? {};
  const isModern = templateId === "modern";
  const isClassic = templateId === "classic";
  const isFilo = templateId === "filo";
  const skillSeparator = isModern || isFilo ? " / " : ", ";
  const accentColor = getResolvedAccentColor(profile, templateId);

  const renderSection = (section: CVRenderableSectionId) => {
    const title = getSectionTitle(section, locale, profile);

    if (section === "summary" && profile.summary) {
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          <p className="cvp-summary">
            <CVInlineMarkdown text={profile.summary} />
          </p>
        </CVTemplatePreviewSection>
      );
    }

    if (section === "skills" && hasItems(profile.skills)) {
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          {isClassic || isFilo ? (
            <p className="cvp-summary">
              {profile.skills?.flatMap((g) => g.items || []).join(", ")}
            </p>
          ) : (
            <div className="cvp-skills">
              {profile.skills?.map((group, index) => (
                <div key={index}>
                  {group.name && <h3>{group.name}</h3>}
                  <p>{group.items?.join(skillSeparator)}</p>
                </div>
              ))}
            </div>
          )}
        </CVTemplatePreviewSection>
      );
    }

    if (section === "technicalSkills" && hasItems(profile.technicalSkills)) {
      const tagsColor = profile.presentation?.tagsColor;
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          {isFilo ? (
            <p className="cvp-summary">
              {profile.technicalSkills?.join(skillSeparator)}
            </p>
          ) : (
            <div className="cvp-tags">
              {profile.technicalSkills?.map((skill, index) => (
                <span 
                  key={index} 
                  className="cvp-tag"
                  style={tagsColor ? { backgroundColor: tagsColor, color: "var(--ui-cv-tag-on-custom)" } : undefined}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </CVTemplatePreviewSection>
      );
    }

    if (section === "experience" && hasItems(profile.experience)) {
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          {profile.experience?.map((item, index) => (
            <CVTemplatePreviewExperienceItem key={index} item={item} companyFirst={isModern} />
          ))}
        </CVTemplatePreviewSection>
      );
    }

    if (section === "projects" && hasItems(profile.projects)) {
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          {profile.projects?.map((item, index) => (
            <CVTemplatePreviewNamedItem key={index} item={item} />
          ))}
        </CVTemplatePreviewSection>
      );
    }

    if (section === "education" && hasItems(profile.education)) {
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          {profile.education?.map((item, index) => (
            <CVTemplatePreviewEducationItem key={index} item={item} />
          ))}
        </CVTemplatePreviewSection>
      );
    }

    if (section === "languages" && hasItems(profile.languages)) {
      const tagsColor = profile.presentation?.tagsColor;
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          <div className="cvp-tags">
            {profile.languages?.map((language, index) => (
              <span 
                key={index}
                style={tagsColor ? { backgroundColor: tagsColor, color: "var(--ui-cv-tag-on-custom)" } : undefined}
              >
                {[language.name, language.level].filter(Boolean).join(" · ")}
              </span>
            ))}
          </div>
        </CVTemplatePreviewSection>
      );
    }

    if (section === "certifications" && hasItems(profile.certifications)) {
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          {profile.certifications?.map((item, index) => (
            <CVTemplatePreviewNamedItem key={index} item={item} />
          ))}
        </CVTemplatePreviewSection>
      );
    }

    if (section === "awards" && hasItems(profile.awards)) {
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          {profile.awards?.map((item, index) => (
            <CVTemplatePreviewNamedItem key={index} item={item} />
          ))}
        </CVTemplatePreviewSection>
      );
    }

    if (section === "publications" && hasItems(profile.publications)) {
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          {profile.publications?.map((item, index) => (
            <CVTemplatePreviewNamedItem key={index} item={item} />
          ))}
        </CVTemplatePreviewSection>
      );
    }

    if (section === "volunteering" && hasItems(profile.volunteering)) {
      return (
        <CVTemplatePreviewSection key={section} title={title} sectionId={section}>
          {profile.volunteering?.map((item, index) => (
            <CVTemplatePreviewNamedItem key={index} item={item} />
          ))}
        </CVTemplatePreviewSection>
      );
    }

    return null;
  };

  return (
    <div
      className={`cvp-shell ${TEMPLATE_CLASS_MAP[templateId]} ${
        scale === "card" ? "cvp-card-scale" : ""
      }`}
      style={{ "--cvp-accent": accentColor } as React.CSSProperties}
    >
      <header className="cvp-header">
        <div>
          <h1>{basics.name || "Untitled CV"}</h1>
          {basics.headline && <p className="cvp-headline">{basics.headline}</p>}
        </div>
        <div className="cvp-contact">
          {basics.email && (
            <a key={basics.email} href={`mailto:${basics.email}`}>{basics.email}</a>
          )}
          {[basics.phone, basics.location]
            .filter(Boolean)
            .map((item) => (
              <span key={item}>{item}</span>
            ))}
          {basics.links?.map((link) => (
            <a key={link.url} href={buildExternalLinkHref(link.url)} target="_blank" rel="noopener noreferrer">{link.label || link.url}</a>
          ))}
        </div>
      </header>

      <main className="cvp-body">
        {getOrderedRenderableSections(profile)
          .filter((section) => !profile.presentation?.hiddenSections?.includes(section))
          .map(renderSection)}
      </main>
    </div>
  );
}
