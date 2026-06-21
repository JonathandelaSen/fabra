import { createHash } from "crypto";
import { LongText, StringList, ValueObject } from "@/backend/modules/shared";
import {
  isRenderableSectionId,
  normalizeAccentColor,
  normalizeSectionOrder,
  normalizeSectionTitles,
} from "../cv-templates";
import { CVBasics, type CVBasicsPrimitives } from "./cv-basics.value-object";
import {
  CVDateRange,
  type CVDateRangePrimitives,
} from "./cv-date-range.value-object";
import {
  CVEducation,
  type CVEducationPrimitives,
} from "./cv-education.value-object";
import {
  CVExperience,
  type CVExperiencePrimitives,
} from "./cv-experience.value-object";
import {
  CVLanguage,
  type CVLanguagePrimitives,
} from "./cv-language.value-object";
import {
  CVLink,
  type CVLinkPrimitives,
} from "./cv-link.value-object";
import {
  CVNamedItem,
  type CVNamedItemPrimitives,
} from "./cv-named-item.value-object";
import {
  CVPresentation,
  type CVPresentationPrimitives,
} from "./cv-presentation.value-object";
import {
  CVSkillGroup,
  type CVSkillGroupPrimitives,
} from "./cv-skill-group.value-object";

export interface CVProfilePrimitives {
  basics?: CVBasicsPrimitives;
  summary?: string;
  experience?: CVExperiencePrimitives[];
  education?: CVEducationPrimitives[];
  skills?: CVSkillGroupPrimitives[];
  languages?: CVLanguagePrimitives[];
  certifications?: CVNamedItemPrimitives[];
  projects?: CVNamedItemPrimitives[];
  awards?: CVNamedItemPrimitives[];
  publications?: CVNamedItemPrimitives[];
  technicalSkills?: string[];
  volunteering?: CVNamedItemPrimitives[];
  presentation?: CVPresentationPrimitives;
  [key: string]: unknown;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter(
          (item): item is string =>
            typeof item === "string" && Boolean(item.trim()),
        )
        .map((item) => item.trim())
    : [];

const dropEmpty = <T extends Record<string, unknown>>(value: T): T => {
  for (const key of Object.keys(value)) {
    if (
      value[key] === undefined ||
      (Array.isArray(value[key]) && value[key].length === 0)
    ) {
      delete value[key];
    }
  }
  return value;
};

const markdownLinkPattern = /^\[([^\]]+)\]\(([^)]+)\)$/;

function parseMarkdownLink(
  value: string,
): { label: string; url: string } | null {
  const match = value.trim().match(markdownLinkPattern);
  if (!match) return null;
  return { label: match[1].trim(), url: match[2].trim() };
}

function normalizeContactEmail(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const markdownLink = parseMarkdownLink(value);
  const candidate = markdownLink?.url ?? value.trim();
  const withoutMailto = candidate.replace(/^mailto:/i, "").trim();
  const emailMatch = withoutMailto.match(
    /[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+/,
  );
  if (emailMatch) return emailMatch[0];
  return withoutMailto || undefined;
}

function normalizeLinkText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const markdownLink = parseMarkdownLink(value);
  return (markdownLink?.label ?? value).trim() || undefined;
}

function normalizeLinkUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const markdownLink = parseMarkdownLink(value);
  return (markdownLink?.url ?? value).trim() || undefined;
}

function generatedShortId(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value))
    .digest("base64url")
    .slice(0, 8);
}

function normalizeId(value: unknown, fallback: unknown): string {
  return asString(value) ?? generatedShortId(fallback);
}

function normalizeTextIds(texts: string[], value: unknown): string[] {
  const ids = Array.isArray(value) ? value : [];
  return texts.map((text, index) => normalizeId(ids[index], { text, index }));
}

function normalizeDateRange(value: unknown): CVDateRangePrimitives | undefined {
  const raw = asRecord(value);
  const dates = dropEmpty({
    start: asString(raw.start),
    end: asString(raw.end),
    current: asBoolean(raw.current),
  });
  return Object.keys(dates).length > 0
    ? CVDateRange.fromPrimitives(dates).toPrimitives()
    : undefined;
}

function normalizeBasics(value: unknown): CVBasicsPrimitives {
  const raw = asRecord(value);
  const links = Array.isArray(raw.links)
    ? raw.links
        .map((item): CVLinkPrimitives | null => {
          const link = asRecord(item);
          const url = normalizeLinkUrl(asString(link.url));
          if (!url) return null;
          const label = normalizeLinkText(asString(link.label));
          return CVLink.fromPrimitives(
            label ? { label, url } : { url },
          ).toPrimitives();
        })
        .filter((item): item is CVLinkPrimitives => item !== null)
    : [];

  return CVBasics.fromPrimitives(
    dropEmpty({
      name: asString(raw.name),
      headline: asString(raw.headline),
      email: normalizeContactEmail(asString(raw.email)),
      phone: asString(raw.phone),
      location: asString(raw.location),
      links,
    }),
  ).toPrimitives();
}

function normalizeExperience(
  value: unknown,
  index = 0,
): CVExperiencePrimitives {
  const raw = asRecord(value);
  const bullets = asStringArray(raw.bullets);
  return CVExperience.fromPrimitives(
    dropEmpty({
      id: normalizeId(raw.id, { raw, index }),
      company: asString(raw.company),
      role: asString(raw.role),
      location: asString(raw.location),
      dates: normalizeDateRange(raw.dates),
      bullets,
      bulletIds: normalizeTextIds(bullets, raw.bulletIds),
    }),
  ).toPrimitives();
}

function normalizeEducation(value: unknown, index = 0): CVEducationPrimitives {
  const raw = asRecord(value);
  const details = asStringArray(raw.details);
  return CVEducation.fromPrimitives(
    dropEmpty({
      id: normalizeId(raw.id, { raw, index }),
      institution: asString(raw.institution),
      degree: asString(raw.degree),
      field: asString(raw.field),
      location: asString(raw.location),
      dates: normalizeDateRange(raw.dates),
      details,
      detailIds: normalizeTextIds(details, raw.detailIds),
    }),
  ).toPrimitives();
}

function normalizeSkillGroup(
  value: unknown,
  index = 0,
): CVSkillGroupPrimitives {
  const raw = asRecord(value);
  return CVSkillGroup.fromPrimitives(
    dropEmpty({
      id: normalizeId(raw.id, { raw, index }),
      name: asString(raw.name),
      items: asStringArray(raw.items),
    }),
  ).toPrimitives();
}

function normalizeLanguage(value: unknown, index = 0): CVLanguagePrimitives {
  const raw = asRecord(value);
  return CVLanguage.fromPrimitives(
    dropEmpty({
      id: normalizeId(raw.id, { raw, index }),
      name: asString(raw.name),
      level: asString(raw.level),
    }),
  ).toPrimitives();
}

function normalizeNamedItem(value: unknown, index = 0): CVNamedItemPrimitives {
  const raw = asRecord(value);
  const bullets = asStringArray(raw.bullets);
  return CVNamedItem.fromPrimitives(
    dropEmpty({
      id: normalizeId(raw.id, { raw, index }),
      name: asString(raw.name),
      issuer: asString(raw.issuer),
      organization: asString(raw.organization),
      date: asString(raw.date),
      url: normalizeLinkUrl(asString(raw.url)),
      description: asString(raw.description),
      bullets,
      bulletIds: normalizeTextIds(bullets, raw.bulletIds),
    }),
  ).toPrimitives();
}

function normalizeHiddenSections(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections = value.filter(isRenderableSectionId);
  return sections.length > 0 ? sections : undefined;
}

function normalizePresentation(
  value: unknown,
): CVPresentationPrimitives | undefined {
  const raw = asRecord(value);
  const presentation = dropEmpty({
    sectionTitles: normalizeSectionTitles(raw.sectionTitles),
    sectionOrder:
      raw.sectionOrder === undefined
        ? undefined
        : normalizeSectionOrder(raw.sectionOrder),
    accentColor: normalizeAccentColor(raw.accentColor),
    tagsColor: normalizeAccentColor(raw.tagsColor),
    hiddenSections: normalizeHiddenSections(raw.hiddenSections),
  });
  return Object.keys(presentation).length > 0
    ? CVPresentation.fromPrimitives(presentation).toPrimitives()
    : undefined;
}

function normalizeArray<T>(
  value: unknown,
  normalize: (item: unknown, index: number) => T,
): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalize)
    .filter((item) => Object.keys(item as Record<string, unknown>).length > 0);
}

function normalizeCVProfile(value: unknown): CVProfilePrimitives {
  const raw = asRecord(value);
  return {
    basics: normalizeBasics(raw.basics),
    summary: asString(raw.summary),
    experience: normalizeArray(raw.experience, normalizeExperience),
    education: normalizeArray(raw.education, normalizeEducation),
    skills: normalizeArray(raw.skills, normalizeSkillGroup),
    languages: normalizeArray(raw.languages, normalizeLanguage),
    certifications: normalizeArray(raw.certifications, normalizeNamedItem),
    projects: normalizeArray(raw.projects, normalizeNamedItem),
    awards: normalizeArray(raw.awards, normalizeNamedItem),
    publications: normalizeArray(raw.publications, normalizeNamedItem),
    technicalSkills: asStringArray(raw.technicalSkills),
    volunteering: normalizeArray(raw.volunteering, normalizeNamedItem),
    presentation: normalizePresentation(raw.presentation),
  };
}

export class CVProfile extends ValueObject<CVProfilePrimitives> {
  private constructor(
    private readonly basics: CVBasics,
    private readonly experience: CVExperience[],
    private readonly education: CVEducation[],
    private readonly skills: CVSkillGroup[],
    private readonly languages: CVLanguage[],
    private readonly certifications: CVNamedItem[],
    private readonly projects: CVNamedItem[],
    private readonly awards: CVNamedItem[],
    private readonly publications: CVNamedItem[],
    private readonly volunteering: CVNamedItem[],
    private readonly technicalSkills: StringList,
    private readonly summary?: LongText,
    private readonly presentation?: CVPresentation,
  ) {
    super();
  }

  static fromPrimitives(raw: CVProfilePrimitives): CVProfile {
    const profile = normalizeCVProfile(raw);
    const named = (items: typeof profile.certifications) =>
      (items ?? []).map((item) => CVNamedItem.fromPrimitives(item));
    return new CVProfile(
      CVBasics.fromPrimitives(profile.basics ?? {}),
      (profile.experience ?? []).map((item) =>
        CVExperience.fromPrimitives(item),
      ),
      (profile.education ?? []).map((item) => CVEducation.fromPrimitives(item)),
      (profile.skills ?? []).map((item) => CVSkillGroup.fromPrimitives(item)),
      (profile.languages ?? []).map((item) => CVLanguage.fromPrimitives(item)),
      named(profile.certifications),
      named(profile.projects),
      named(profile.awards),
      named(profile.publications),
      named(profile.volunteering),
      StringList.fromPrimitives(profile.technicalSkills ?? []),
      profile.summary === undefined
        ? undefined
        : LongText.fromPrimitives(profile.summary),
      profile.presentation === undefined
        ? undefined
        : CVPresentation.fromPrimitives(profile.presentation),
    );
  }

  toPrimitives(): CVProfilePrimitives {
    return {
      basics: this.basics.toPrimitives(),
      summary: this.summary?.toPrimitives(),
      experience: this.experience.map((item) => item.toPrimitives()),
      education: this.education.map((item) => item.toPrimitives()),
      skills: this.skills.map((item) => item.toPrimitives()),
      languages: this.languages.map((item) => item.toPrimitives()),
      certifications: this.certifications.map((item) => item.toPrimitives()),
      projects: this.projects.map((item) => item.toPrimitives()),
      awards: this.awards.map((item) => item.toPrimitives()),
      publications: this.publications.map((item) => item.toPrimitives()),
      technicalSkills: this.technicalSkills.toPrimitives(),
      volunteering: this.volunteering.map((item) => item.toPrimitives()),
      presentation: this.presentation?.toPrimitives(),
    };
  }
}
