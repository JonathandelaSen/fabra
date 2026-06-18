import React from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface EducationalBannerProps {
  title: React.ReactNode;
  description: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBgColor?: string;
  bgColor?: string;
  borderColor?: string;
  shadowColor?: string;
  onClose?: () => void;
  cta?: React.ReactNode;
}

export default function EducationalBanner({
  title,
  description,
  icon: Icon,
  iconColor = "text-action-text",
  iconBgColor = "bg-action/10",
  bgColor = "bg-action/[0.03]",
  borderColor = "border-action-border/10",
  shadowColor = "shadow-[var(--ui-action-glow-shadow)]",
  onClose,
  cta,
}: EducationalBannerProps) {
  const t = useTranslations("common.actions");

  return (
    <div
      className={`shrink-0 w-full p-4 rounded-2xl ${bgColor} border ${borderColor} ${shadowColor} backdrop-blur-sm flex gap-3 relative group`}
    >
      {Icon && (
        <div className={`w-8 h-8 rounded-lg ${iconBgColor} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      )}
      <div className="flex-1 min-w-0 pr-6">
        <h3 className="text-sm font-semibold text-text-soft">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
          {description}
        </p>
        {cta && <div className="mt-3">{cta}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-text-muted opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-panel-subtle hover:text-text-soft transition-all duration-200"
          aria-label={t("close")}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
