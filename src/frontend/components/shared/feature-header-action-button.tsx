"use client";

import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/utils/utils";

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
  "bg-primary-2 text-primary-foreground font-semibold hover:brightness-110 transition-all";

const defaultActiveClassName =
  "bg-panel-hover text-text-main hover:bg-panel-active font-semibold transition-colors";

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
