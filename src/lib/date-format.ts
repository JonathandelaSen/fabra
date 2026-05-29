export type DateDisplayVariant = "date" | "dateTime";

interface FormatDisplayDateOptions {
  locale?: string;
  variant?: DateDisplayVariant;
}

export function getDisplayDateLocale(locale: string) {
  return locale === "es" ? "es-ES" : "en-US";
}

export function formatDisplayDate(
  value: string | null | undefined,
  options: FormatDisplayDateOptions = {},
) {
  if (!value) return "";

  const { locale = "en-US", variant = "date" } = options;
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: variant === "dateTime" ? "long" : "short",
    year: "numeric",
    ...(variant === "dateTime"
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}
