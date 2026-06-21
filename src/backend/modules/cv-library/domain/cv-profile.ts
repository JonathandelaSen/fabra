import { createHash } from "crypto";
import type { CVProfilePrimitives } from "./value-objects/cv-profile.value-object";
import type { CVBasicsPrimitives } from "./value-objects/cv-basics.value-object";
import type { CVDateRangePrimitives } from "./value-objects/cv-date-range.value-object";
import type { CVEducationPrimitives } from "./value-objects/cv-education.value-object";
import type { CVExperiencePrimitives } from "./value-objects/cv-experience.value-object";
import type { CVLanguagePrimitives } from "./value-objects/cv-language.value-object";
import type { CVLinkPrimitives } from "./value-objects/cv-link.value-object";
import type { CVNamedItemPrimitives } from "./value-objects/cv-named-item.value-object";
import type { CVPresentationPrimitives } from "./value-objects/cv-presentation.value-object";
import type { CVSkillGroupPrimitives } from "./value-objects/cv-skill-group.value-object";

export const CV_PROFILE_SCHEMA_VERSION = "cv-profile.v1";

const markdownLinkPattern = /^\[([^\]]+)\]\(([^)]+)\)$/;

function parseMarkdownLink(
  value: string,
): { label: string; url: string } | null {
  const match = value.trim().match(markdownLinkPattern);
  if (!match) return null;
  return { label: match[1].trim(), url: match[2].trim() };
}

export function normalizeContactEmail(
  value: string | undefined,
): string | undefined {
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

export function buildExternalLinkHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
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
  values: Array<string | undefined>,
) {
  const cleaned = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  if (cleaned.length === 0) return;
  lines.push(title, ...cleaned, "");
}

export function profileToPlainText(
  profile: CVProfilePrimitives | null,
): string | null {
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
    ]),
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
    ]),
  );

  pushSection(lines, "Habilidades", [
    ...(profile.skills ?? []).flatMap((group) => [
      joinParts([group.name, ...(group.items ?? [])]),
    ]),
    ...(profile.technicalSkills ?? []),
  ]);

  pushSection(
    lines,
    "Idiomas",
    (profile.languages ?? []).map((item) => joinParts([item.name, item.level])),
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
      ]),
    );
  }

  const text = lines.join("\n").trim();
  return text || null;
}

export function getCVSourceTextHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
