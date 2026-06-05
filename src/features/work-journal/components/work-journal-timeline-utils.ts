import type { LabelBadgeTone } from "@/components/shared/label-badge";
import type { WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";

export type TimelineGranularity = "month" | "week";

export interface TimelineEntryView {
  entry: WorkJournalEntry;
  rangeLabel: string;
  continuesAfter: boolean;
}

export interface TimelineGroup {
  key: string;
  periodStart: string;
  entries: TimelineEntryView[];
}

const CONTEXT_TONES: readonly LabelBadgeTone[] = [
  "info",
  "teal",
  "indigo",
  "success",
  "warning",
  "danger",
];

export function parseEntryDate(value: string): Date {
  return value.includes("T")
    ? new Date(value)
    : new Date(`${value}T00:00:00`);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const diff = (day + 6) % 7; // Monday as first day of week
  result.setDate(result.getDate() - diff);
  return result;
}

export function periodKey(date: Date, granularity: TimelineGranularity): string {
  if (granularity === "week") {
    return toIsoDate(startOfWeek(date));
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function periodStartIso(date: Date, granularity: TimelineGranularity): string {
  if (granularity === "week") {
    return toIsoDate(startOfWeek(date));
  }
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function getContextTone(contextId: string | null | undefined): LabelBadgeTone {
  if (!contextId) return "info";
  let hash = 0;
  for (let i = 0; i < contextId.length; i += 1) {
    hash = (hash * 31 + contextId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % CONTEXT_TONES.length;
  return CONTEXT_TONES[index];
}

export function formatRangeBadge(
  dateStart: string,
  dateEnd: string | null,
  locale: string,
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  });
  const start = parseEntryDate(dateStart);
  if (!dateEnd || dateEnd === dateStart) {
    return formatter.format(start);
  }
  const end = parseEntryDate(dateEnd);
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function groupEntriesByPeriod(
  entries: WorkJournalEntry[],
  granularity: TimelineGranularity,
  locale: string,
): TimelineGroup[] {
  const groups = new Map<string, TimelineGroup>();

  for (const entry of entries) {
    const start = parseEntryDate(entry.date_start);
    const key = periodKey(start, granularity);
    const continuesAfter =
      entry.date_end != null &&
      entry.date_end !== entry.date_start &&
      periodKey(parseEntryDate(entry.date_end), granularity) !== key;

    const entryView: TimelineEntryView = {
      entry,
      rangeLabel: formatRangeBadge(entry.date_start, entry.date_end, locale),
      continuesAfter,
    };

    const existing = groups.get(key);
    if (existing) {
      existing.entries.push(entryView);
    } else {
      groups.set(key, {
        key,
        periodStart: periodStartIso(start, granularity),
        entries: [entryView],
      });
    }
  }

  const ordered = Array.from(groups.values()).sort((a, b) =>
    b.periodStart.localeCompare(a.periodStart),
  );

  for (const group of ordered) {
    group.entries.sort(
      (a, b) =>
        parseEntryDate(b.entry.date_start).getTime() -
        parseEntryDate(a.entry.date_start).getTime(),
    );
  }

  return ordered;
}

export function formatPeriodLabel(
  periodStart: string,
  granularity: TimelineGranularity,
  locale: string,
): string {
  const date = parseEntryDate(periodStart);
  if (granularity === "week") {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}
