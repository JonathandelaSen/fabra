import { type ComponentProps, type ElementType } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ICON_TEXT_BUTTON_TONES = {
  DEFAULT: "default",
  PRIMARY: "primary",
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
  INFO: "info",
} as const;

export type IconTextButtonTone =
  (typeof ICON_TEXT_BUTTON_TONES)[keyof typeof ICON_TEXT_BUTTON_TONES];

export interface IconTextButtonProps extends Omit<ComponentProps<typeof Button>, "variant"> {
  icon: ElementType<{ className?: string }>;
  tone?: IconTextButtonTone;
}

const TONE_CLASS_NAMES = {
  [ICON_TEXT_BUTTON_TONES.DEFAULT]:
    "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
  [ICON_TEXT_BUTTON_TONES.PRIMARY]: "border-transparent bg-action text-primary-foreground hover:bg-action-hover",
  [ICON_TEXT_BUTTON_TONES.SUCCESS]: "border-success-border bg-success-soft text-success-text hover:bg-success-soft",
  [ICON_TEXT_BUTTON_TONES.WARNING]: "border-warning-border bg-warning-soft text-warning-text hover:bg-warning-soft",
  [ICON_TEXT_BUTTON_TONES.DANGER]: "border-danger-border bg-danger-soft text-danger-text hover:bg-danger-soft",
  [ICON_TEXT_BUTTON_TONES.INFO]: "border-info-border bg-info-soft text-info-text hover:bg-info-soft",
} satisfies Record<IconTextButtonTone, string>;

export function IconTextButton({
  className,
  children,
  icon: Icon,
  tone = ICON_TEXT_BUTTON_TONES.DEFAULT,
  type = "button",
  ...props
}: IconTextButtonProps) {
  return (
    <Button
      type={type}
      variant="ghost"
      size="sm"
      className={cn("h-9 px-3 gap-1.5", TONE_CLASS_NAMES[tone], className)}
      {...props}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
}
