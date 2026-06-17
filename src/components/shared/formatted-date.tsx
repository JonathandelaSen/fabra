"use client";

import { Clock, type LucideIcon } from "lucide-react";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import {
  formatDisplayDate,
  getDisplayDateLocale,
  type DateDisplayVariant,
} from "@/lib/date-format";
import { cn } from "@/lib/utils";

interface FormatDisplayDateOptions {
  locale?: string;
  variant?: DateDisplayVariant;
}

interface FormattedDateProps extends FormatDisplayDateOptions {
  value: string | null | undefined;
  icon?: LucideIcon | null;
  className?: string;
  iconClassName?: string;
}

export function FormattedDate({
  value,
  locale,
  variant = "date",
  icon: Icon = Clock,
  className,
  iconClassName,
}: FormattedDateProps) {
  const { locale: interfaceLocale } = useInterfaceLanguage();
  const dateLocale = locale ?? getDisplayDateLocale(interfaceLocale);
  const formattedDate = formatDisplayDate(value, {
    locale: dateLocale,
    variant,
  });

  if (!formattedDate) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] text-text-muted",
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn("h-3 w-3 shrink-0", iconClassName)}
          aria-hidden="true"
        />
      )}
      <time dateTime={value ?? undefined}>{formattedDate}</time>
    </span>
  );
}
