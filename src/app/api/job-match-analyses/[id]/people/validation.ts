import {
  OPPORTUNITY_PERSON_ROLES,
  type OpportunityPersonRoleValue,
} from "@/backend/modules/selection-process";

type Result<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; error: { message: string; status: 400 } };

export interface OpportunityPersonHttpInput {
  name: string;
  role: OpportunityPersonRoleValue;
  jobTitle: string | null;
  organization: string | null;
  email: string | null;
  phone: string | null;
  links: Array<{ url: string; label: string | null }>;
  notes: string | null;
}

function validationError(message: string): Result<never> {
  return { ok: false, error: { message, status: 400 } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return undefined;
  return value.trim() || null;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = value.trim();

  const hasScheme = /^[a-zA-Z0-9+.-]+:/.test(normalized);
  if (hasScheme) {
    try {
      const url = new URL(normalized);
      return url.protocol === "http:" || url.protocol === "https:"
        ? normalized
        : null;
    } catch {
      return null;
    }
  } else {
    if (!normalized.includes(".") || normalized.startsWith(".") || normalized.endsWith(".")) {
      return null;
    }
    try {
      new URL(`https://${normalized}`);
      return normalized;
    } catch {
      return null;
    }
  }
}

function parseLinks(
  value: unknown,
): Array<{ url: string; label: string | null }> | null {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;
  const links: Array<{ url: string; label: string | null }> = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    const url = normalizeHttpUrl(item.url);
    const label = optionalText(item.label);
    if (!url || label === undefined) return null;
    links.push({ url, label });
  }
  return links;
}

export function parseOpportunityPersonRequest(
  body: unknown,
): Result<OpportunityPersonHttpInput> {
  if (!isRecord(body)) {
    return validationError("Request body must be a JSON object");
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return validationError("Person name is required");
  if (
    typeof body.role !== "string" ||
    !OPPORTUNITY_PERSON_ROLES.includes(
      body.role as OpportunityPersonRoleValue,
    )
  ) {
    return validationError("Invalid person role");
  }

  const jobTitle = optionalText(body.jobTitle);
  const organization = optionalText(body.organization);
  const email = optionalText(body.email);
  const phone = optionalText(body.phone);
  const notes = optionalText(body.notes);
  const links = parseLinks(body.links);
  if (
    jobTitle === undefined ||
    organization === undefined ||
    email === undefined ||
    phone === undefined ||
    notes === undefined ||
    links === null
  ) {
    return validationError("Invalid person profile");
  }
  if (email !== null && !isEmail(email)) {
    return validationError("Invalid person email");
  }

  return {
    ok: true,
    value: {
      name,
      role: body.role as OpportunityPersonRoleValue,
      jobTitle,
      organization,
      email,
      phone,
      links,
      notes,
    },
  };
}
