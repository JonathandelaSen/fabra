import { cn } from "@/lib/utils";

export const featureSurfaces = {
  panel: "border border-line bg-panel",
  section: "border border-line bg-panel-subtle",
  row: "border border-transparent bg-transparent",
  selectedRow: "border-action-border bg-panel-selected shadow-[0_4px_12px_rgba(0,0,0,0.52)]",
  rowHover: "hover:border-line hover:bg-panel-row-hover",
  field: "border border-line-default bg-panel-subtle",
  modal: "border border-line-default bg-modal shadow-2xl",
  aiPanel: "border border-action-border bg-action-soft",
  tag: "border border-line bg-panel-subtle",
} as const;

export const featureStates = {
  selected: "text-text-main",
  idle: "text-text-muted",
  hover: "hover:text-text-soft",
  disabled: "cursor-not-allowed opacity-50",
  loading: "animate-pulse",
  success: "border-success-border bg-success-soft text-success-text",
  warning: "border-warning-border bg-warning-soft text-warning-text",
  danger: "border-danger-border bg-danger-soft text-danger-text",
  info: "border-info-border bg-info-soft text-info-text",
} as const;

export function featureListItemClassName(
  isSelected: boolean,
  className?: string,
) {
  return cn(
    "group relative w-full rounded-xl p-3.5 text-left border transition-all duration-200",
    isSelected
      ? [featureSurfaces.selectedRow, featureStates.selected]
      : [featureSurfaces.row, featureSurfaces.rowHover, featureStates.idle, featureStates.hover],
    className,
  );
}

export function featureListItemIconClassName(isSelected: boolean) {
  return cn(
    "mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
    isSelected ? "text-action-text" : "text-text-faint group-hover:text-text-muted",
  );
}

export const featureMetaPillClassName =
  "truncate rounded border border-line bg-panel-subtle px-1.5 py-0.5 font-medium text-text-muted";
