import type { CVProfilePrimitives } from "../value-objects/cv-profile.value-object";
import type { CVExperiencePrimitives } from "../value-objects/cv-experience.value-object";
import type { CVEducationPrimitives } from "../value-objects/cv-education.value-object";
import type { CVSkillGroupPrimitives } from "../value-objects/cv-skill-group.value-object";
import type { CVLanguagePrimitives } from "../value-objects/cv-language.value-object";
import type { CVNamedItemPrimitives } from "../value-objects/cv-named-item.value-object";
import type { CVLinkPrimitives } from "../value-objects/cv-link.value-object";
import { JsonResumeValidationError } from "../errors/json-resume-validation.error";

export interface JsonResumeMapperResult {
  profile: CVProfilePrimitives;
  warnings: string[];
}

export function mapJsonResumeToProfile(raw: unknown): JsonResumeMapperResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new JsonResumeValidationError("input must be a JSON object");
  }

  const data = raw as Record<string, unknown>;
  const basics = asRecord(data.basics);
  const name = asString(basics.name);

  if (!name) {
    throw new JsonResumeValidationError("basics.name is required");
  }

  const warnings: string[] = [];
  const work = asArray(data.work);
  const education = asArray(data.education);
  const skills = asArray(data.skills);

  if (work.length === 0) warnings.push("No work experience found");
  if (education.length === 0) warnings.push("No education found");
  if (skills.length === 0) warnings.push("No skills found");

  const profile: CVProfilePrimitives = {
    basics: mapBasics(basics),
    summary: asString(basics.summary) ?? undefined,
    experience: work.map(mapWork),
    education: education.map(mapEducation),
    skills: skills.map(mapSkill),
    languages: asArray(data.languages).map(mapLanguage),
    certifications: asArray(data.certificates).map(mapCertificate),
    projects: asArray(data.projects).map(mapProject),
    volunteering: asArray(data.volunteer).map(mapVolunteer),
    awards: asArray(data.awards).map(mapAward),
    publications: asArray(data.publications).map(mapPublication),
  };

  return { profile: mapJsonResumeProfileToPrimitives(profile), warnings };
}

function mapJsonResumeProfileToPrimitives(
  profile: CVProfilePrimitives,
): CVProfilePrimitives {
  return profile;
}

function mapBasics(basics: Record<string, unknown>) {
  const location = asRecord(basics.location);
  const locationParts = [
    asString(location.city),
    asString(location.region),
    asString(location.countryCode),
  ].filter(Boolean);

  const links: CVLinkPrimitives[] = [];
  const url = asString(basics.url);
  if (url) links.push({ url, label: "Website" });

  for (const p of asArray(basics.profiles)) {
    const profile = asRecord(p);
    const profileUrl = asString(profile.url);
    if (profileUrl) {
      links.push({ url: profileUrl, label: asString(profile.network) });
    }
  }

  return {
    name: asString(basics.name),
    headline: asString(basics.label),
    email: asString(basics.email),
    phone: asString(basics.phone),
    location: locationParts.length > 0 ? locationParts.join(", ") : undefined,
    links: links.length > 0 ? links : undefined,
  };
}

function mapWork(item: unknown): CVExperiencePrimitives {
  const w = asRecord(item);
  return {
    company: asString(w.name),
    role: asString(w.position),
    location: asString(w.location),
    dates: mapDates(asString(w.startDate), asString(w.endDate)),
    bullets: asStringArray(w.highlights),
  };
}

function mapEducation(item: unknown): CVEducationPrimitives {
  const e = asRecord(item);
  return {
    institution: asString(e.institution),
    degree: asString(e.studyType),
    field: asString(e.area),
    location: asString(e.location),
    dates: mapDates(asString(e.startDate), asString(e.endDate)),
    details: asStringArray(e.courses),
  };
}

function mapSkill(item: unknown): CVSkillGroupPrimitives {
  const s = asRecord(item);
  return {
    name: asString(s.name),
    items: asStringArray(s.keywords),
  };
}

function mapLanguage(item: unknown): CVLanguagePrimitives {
  const l = asRecord(item);
  return {
    name: asString(l.language),
    level: asString(l.fluency),
  };
}

function mapCertificate(item: unknown): CVNamedItemPrimitives {
  const c = asRecord(item);
  return {
    name: asString(c.name),
    issuer: asString(c.issuer),
    date: asString(c.date),
    url: asString(c.url),
  };
}

function mapProject(item: unknown): CVNamedItemPrimitives {
  const p = asRecord(item);
  return {
    name: asString(p.name),
    description: asString(p.description),
    bullets: asStringArray(p.highlights),
    url: asString(p.url),
    date: asString(p.startDate),
  };
}

function mapVolunteer(item: unknown): CVNamedItemPrimitives {
  const v = asRecord(item);
  return {
    name: asString(v.position),
    organization: asString(v.organization),
    description: asString(v.summary),
    bullets: asStringArray(v.highlights),
    date: asString(v.startDate),
  };
}

function mapAward(item: unknown): CVNamedItemPrimitives {
  const a = asRecord(item);
  return {
    name: asString(a.title),
    issuer: asString(a.awarder),
    date: asString(a.date),
    description: asString(a.summary),
  };
}

function mapPublication(item: unknown): CVNamedItemPrimitives {
  const p = asRecord(item);
  return {
    name: asString(p.name),
    issuer: asString(p.publisher),
    date: asString(p.releaseDate),
    url: asString(p.url),
    description: asString(p.summary),
  };
}

function mapDates(start?: string, end?: string) {
  if (!start && !end) return undefined;
  return {
    start,
    end,
    current: !end ? true : undefined,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: unknown): string[] {
  return asArray(value).filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}
