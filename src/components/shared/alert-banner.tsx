import React from "react";
import { cn } from "@/lib/utils";

const TONES = {
  warning: {
    container: "border-warning-border bg-warning-soft",
    icon: "text-warning-text",
    title: "text-warning-text",
    body: "text-warning-text/75",
  },
  danger: {
    container: "border-danger-border bg-danger-soft",
    icon: "text-danger-text",
    title: "text-danger-text",
    body: "text-danger-text/75",
  },
  info: {
    container: "border-info-border bg-info-soft",
    icon: "text-info-text",
    title: "text-info-text",
    body: "text-info-text/75",
  },
  success: {
    container: "border-success-border bg-success-soft",
    icon: "text-success-text",
    title: "text-success-text",
    body: "text-success-text/75",
  },
} as const;

export const ALERT_BANNER_TONES = {
  WARNING: "warning",
  DANGER: "danger",
  INFO: "info",
  SUCCESS: "success",
} as const;

export type AlertBannerTone =
  (typeof ALERT_BANNER_TONES)[keyof typeof ALERT_BANNER_TONES];

interface AlertBannerProps {
  tone: AlertBannerTone;
  icon?: React.ComponentType<{ className?: string }>;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AlertBanner({
  tone,
  icon: Icon,
  title,
  children,
  className,
}: AlertBannerProps) {
  const t = TONES[tone];

  return (
    <div
      className={cn(
        "rounded-xl border",
        "p-3 sm:p-4",
        t.container,
        className,
      )}
    >
      <div className="flex gap-3">
        {Icon && (
          <Icon
            className={cn(
              "shrink-0",
              "mt-0.5 h-5 w-5",
              t.icon,
            )}
          />
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <h3
              className={cn(
                "font-semibold",
                "text-sm",
                t.title,
              )}
            >
              {title}
            </h3>
          )}
          <div
            className={cn(
              "text-sm leading-6",
              title && "mt-1",
              t.body,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
