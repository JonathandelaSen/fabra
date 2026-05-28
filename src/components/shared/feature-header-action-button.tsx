"use client";

import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureHeaderActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  cancelLabel?: string;
  className?: string;
  activeClassName?: string;
}

const defaultClassName =
  "bg-indigo-300 text-indigo-950 font-semibold hover:bg-indigo-200 transition-colors shadow-[0_0_30px_rgba(129,140,248,0.15)]";

const defaultActiveClassName =
  "bg-white/10 text-white hover:bg-white/20 font-semibold transition-colors";

export function FeatureHeaderActionButton({
  label,
  onClick,
  disabled,
  isActive,
  cancelLabel,
  className,
  activeClassName,
}: FeatureHeaderActionButtonProps) {
  const t = useTranslations("common");
  const resolvedCancelLabel = cancelLabel ?? t("actions.cancel");

  const buttonClassName = isActive
    ? (activeClassName ?? defaultActiveClassName)
    : (className ?? defaultClassName);

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonClassName)}
    >
      {isActive ? (
        <>
          <X className="mr-1.5 h-4 w-4" />
          {resolvedCancelLabel}
        </>
      ) : (
        <>
          <Plus className="mr-1.5 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
