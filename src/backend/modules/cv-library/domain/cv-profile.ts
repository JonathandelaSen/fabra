import { createHash } from "crypto";
import {
  normalizeAccentColor,
  normalizeSectionOrder,
  normalizeSectionTitles,
  type CVRenderableSectionId,
  isRenderableSectionId,
} from "./cv-templates";

export const CV_PROFILE_SCHEMA_VERSION = "cv-profile.v1";

export interface StandardCVLink {
  label?: string;
  url: string;
}

export interface StandardCVBasics {
  name?: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: StandardCVLink[];
}

export interface StandardCVDateRange {
  start?: string;
  end?: string;
  current?: boolean;
}

export interface StandardCVExperience {
  id?: string;
  company?: string;
  role?: string;
  location?: string;
  dates?: StandardCVDateRange;
  bullets?: string[];
  bulletIds?: string[];
}

export interface StandardCVEducation {
  id?: string;
  institution?: string;
  degree?: string;
  field?: string;
  location?: string;
  dates?: StandardCVDateRange;
  details?: string[];
  detailIds?: string[];
}

export interface StandardCVSkillGroup {
  id?: string;
  name?: string;
  items?: string[];
}

export interface StandardCVLanguage {
  id?: string;
  name?: string;
  level?: string;
}

export interface StandardCVNamedItem {
  id?: string;
  name?: string;
  issuer?: string;
  organization?: string;
  date?: string;
  url?: string;
  description?: string;
  bullets?: string[];
  bulletIds?: string[];
}

export interface StandardCVPresentation {
  sectionTitles?: Partial<Record<CVRenderableSectionId, string>>;
  sectionOrder?: CVRenderableSectionId[];
  accentColor?: string;
  tagsColor?: string;
  hiddenSections?: CVRenderableSectionId[];
}

export interface StandardCVProfile {
  basics?: StandardCVBasics;
  summary?: string;
  experience?: StandardCVExperience[];
  education?: StandardCVEducation[];
  skills?: StandardCVSkillGroup[];
  languages?: StandardCVLanguage[];
  certifications?: StandardCVNamedItem[];
  projects?: StandardCVNamedItem[];
  awards?: StandardCVNamedItem[];
  publications?: StandardCVNamedItem[];
  technicalSkills?: string[];
  volunteering?: StandardCVNamedItem[];
  presentation?: StandardCVPresentation;
  [key: string]: unknown;
}

export type StandardCVProfilePrimitives = StandardCVProfile;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const markdownLinkPattern = /^\[([^\]]+)\]\(([^)]+)\)$/;

function parseMarkdownLink(value: string): { label: string; url: string } | null {
  const match = value.trim().match(markdownLinkPattern);
  if (!match) return null;
  return { label: match[1].trim(), url: match[2].trim() };
}

export function normalizeContactEmail(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const markdownLink = parseMarkdownLink(value);
  const candidate = markdownLink?.url ?? value.trim();
  const withoutMailto = candidate.replace(/^mailto:/i, "").trim();
  const emailMatch = withoutMailto.match(/[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+/);
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

export function buildExternalLinkHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter(
          (item): item is string =>
            typeof item === "string" && Boolean(item.trim())
        )
        .map((item) => item.trim())
    : [];

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

const withDefined = <T extends Record<string, unknown>>(value: T): T => {
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

function normalizeDateRange(value: unknown): StandardCVDateRange | undefined {
  const raw = asRecord(value);
  const dates = withDefined({
    start: asString(raw.start),
    end: asString(raw.end),
    current: asBoolean(raw.current),
  });
  return Object.keys(dates).length > 0 ? dates : undefined;
}

function normalizeBasics(value: unknown): StandardCVBasics {
  const raw = asRecord(value);
  const links = Array.isArray(raw.links)
    ? raw.links
        .map((item): StandardCVLink | null => {
          const link = asRecord(item);
          const url = normalizeLinkUrl(asString(link.url));
          if (!url) return null;
          const label = normalizeLinkText(asString(link.label));
          return label ? { label, url } : { url };
        })
        .filter((item): item is StandardCVLink => item !== null)
    : [];

  return withDefined({
    name: asString(raw.name),
    headline: asString(raw.headline),
    email: normalizeContactEmail(asString(raw.email)),
    phone: asString(raw.phone),
    location: asString(raw.location),
    links,
  });
}

function normalizeExperience(value: unknown, index = 0): StandardCVExperience {
  const raw = asRecord(value);
  const bullets = asStringArray(raw.bullets);
  return withDefined({
    id: normalizeId(raw.id, { raw, index }),
    company: asString(raw.company),
    role: asString(raw.role),
    location: asString(raw.location),
    dates: normalizeDateRange(raw.dates),
    bullets,
    bulletIds: normalizeTextIds(bullets, raw.bulletIds),
  });
}

function normalizeEducation(value: unknown, index = 0): StandardCVEducation {
  const raw = asRecord(value);
  const details = asStringArray(raw.details);
  return withDefined({
    id: normalizeId(raw.id, { raw, index }),
    institution: asString(raw.institution),
    degree: asString(raw.degree),
    field: asString(raw.field),
    location: asString(raw.location),
    dates: normalizeDateRange(raw.dates),
    details,
    detailIds: normalizeTextIds(details, raw.detailIds),
  });
}

function normalizeSkillGroup(value: unknown, index = 0): StandardCVSkillGroup {
  const raw = asRecord(value);
  return withDefined({
    id: normalizeId(raw.id, { raw, index }),
    name: asString(raw.name),
    items: asStringArray(raw.items),
  });
}

function normalizeLanguage(value: unknown, index = 0): StandardCVLanguage {
  const raw = asRecord(value);
  return withDefined({
    id: normalizeId(raw.id, { raw, index }),
    name: asString(raw.name),
    level: asString(raw.level),
  });
}

function normalizeNamedItem(value: unknown, index = 0): StandardCVNamedItem {
  const raw = asRecord(value);
  const bullets = asStringArray(raw.bullets);
  return withDefined({
    id: normalizeId(raw.id, { raw, index }),
    name: asString(raw.name),
    issuer: asString(raw.issuer),
    organization: asString(raw.organization),
    date: asString(raw.date),
    url: normalizeLinkUrl(asString(raw.url)),
    description: asString(raw.description),
    bullets,
    bulletIds: normalizeTextIds(bullets, raw.bulletIds),
  });
}

function normalizeHiddenSections(value: unknown): CVRenderableSectionId[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections = value.filter(isRenderableSectionId);
  return sections.length > 0 ? sections : undefined;
}

function normalizePresentation(value: unknown): StandardCVPresentation | undefined {
  const raw = asRecord(value);
  const presentation = withDefined({
    sectionTitles: normalizeSectionTitles(raw.sectionTitles),
    sectionOrder:
      raw.sectionOrder === undefined
        ? undefined
        : normalizeSectionOrder(raw.sectionOrder),
    accentColor: normalizeAccentColor(raw.accentColor),
    tagsColor: normalizeAccentColor(raw.tagsColor),
    hiddenSections: normalizeHiddenSections(raw.hiddenSections),
  });
  return Object.keys(presentation).length > 0 ? presentation : undefined;
}

function normalizeArray<T>(
  value: unknown,
  normalize: (item: unknown, index: number) => T
): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalize)
    .filter((item) => Object.keys(item as Record<string, unknown>).length > 0);
}

export function normalizeStandardCVProfile(
  value: unknown
): StandardCVProfile {
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

export function getBestCVText(input: {
  text_python?: string | null;
  text_pdfjs?: string | null;
  text_node?: string | null;
}): string | null {
  return input.text_python || input.text_pdfjs || input.text_node || null;
}

export function getBestCVPrimitiveText(input: {
  textPython?: string | null;
  textPdfjs?: string | null;
  textNode?: string | null;
}): string | null {
  return (
    input.textPython?.trim() ||
    input.textPdfjs?.trim() ||
    input.textNode?.trim() ||
    null
  );
}

function joinParts(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" | ");
}

function pushSection(
  lines: string[],
  title: string,
  values: Array<string | undefined>
) {
  const cleaned = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  if (cleaned.length === 0) return;
  lines.push(title, ...cleaned, "");
}

export function profileToPlainText(profile: StandardCVProfile | null): string | null {
  if (!profile) return null;

  const lines: string[] = [];
  const basics = profile.basics;
  pushSection(lines, "Datos personales", [
    basics?.name,
    basics?.headline,
    basics?.email,
    basics?.phone,
    basics?.location,
    ...(basics?.links ?? []).map((link) => joinParts([link.label, link.url])),
  ]);

  pushSection(lines, "Resumen", [profile.summary]);

  pushSection(
    lines,
    "Experiencia",
    (profile.experience ?? []).flatMap((item) => [
      joinParts([
        item.role,
        item.company,
        item.location,
        item.dates?.start || item.dates?.end
          ? `${item.dates?.start ?? ""} - ${
              item.dates?.current ? "Actualidad" : (item.dates?.end ?? "")
            }`
          : undefined,
      ]),
      ...(item.bullets ?? []),
    ])
  );

  pushSection(
    lines,
    "Educacion",
    (profile.education ?? []).flatMap((item) => [
      joinParts([
        item.degree,
        item.field,
        item.institution,
        item.location,
        item.dates?.start || item.dates?.end
          ? `${item.dates?.start ?? ""} - ${
              item.dates?.current ? "Actualidad" : (item.dates?.end ?? "")
            }`
          : undefined,
      ]),
      ...(item.details ?? []),
    ])
  );

  pushSection(
    lines,
    "Habilidades",
    [
      ...(profile.skills ?? []).flatMap((group) => [
        joinParts([group.name, ...(group.items ?? [])]),
      ]),
      ...(profile.technicalSkills ?? []),
    ]
  );

  pushSection(
    lines,
    "Idiomas",
    (profile.languages ?? []).map((item) => joinParts([item.name, item.level]))
  );

  for (const [title, items] of [
    ["Certificaciones", profile.certifications],
    ["Proyectos", profile.projects],
    ["Premios", profile.awards],
    ["Publicaciones", profile.publications],
    ["Voluntariado", profile.volunteering],
  ] as const) {
    pushSection(
      lines,
      title,
      (items ?? []).flatMap((item) => [
        joinParts([
          item.name,
          item.issuer,
          item.organization,
          item.date,
          item.url,
        ]),
        item.description,
        ...(item.bullets ?? []),
      ])
    );
  }

  const text = lines.join("\n").trim();
  return text || null;
}

export function getCVSourceTextHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
