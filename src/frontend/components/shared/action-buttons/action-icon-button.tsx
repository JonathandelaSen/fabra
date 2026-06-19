import { type ComponentProps, type ElementType } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/lib/utils";

export const ACTION_ICON_BUTTON_TONES = {
  DEFAULT: "default",
  PRIMARY: "primary",
  SUCCESS: "success",
  DANGER: "danger",
  MUTED: "muted",
} as const;

export type ActionIconButtonTone =
  (typeof ACTION_ICON_BUTTON_TONES)[keyof typeof ACTION_ICON_BUTTON_TONES];

export const ACTION_ICON_BUTTON_SIZES = {
  XS: "xs",
  SM: "sm",
  MD: "md",
  LG: "lg",
} as const;

export type ActionIconButtonSize =
  (typeof ACTION_ICON_BUTTON_SIZES)[keyof typeof ACTION_ICON_BUTTON_SIZES];

type ButtonOmittedProps = "variant" | "size";

export interface ActionIconButtonProps extends Omit<ComponentProps<typeof Button>, ButtonOmittedProps> {
  buttonSize?: ActionIconButtonSize;
  icon: ElementType<{ className?: string }>;
  loading?: boolean;
  tone?: ActionIconButtonTone;
}

const TONE_CLASS_NAMES = {
  [ACTION_ICON_BUTTON_TONES.DEFAULT]:
    "text-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
  [ACTION_ICON_BUTTON_TONES.PRIMARY]:
    "bg-action text-primary-foreground hover:bg-action-hover",
  [ACTION_ICON_BUTTON_TONES.SUCCESS]:
    "text-success-text hover:bg-success-soft hover:text-success-text",
  [ACTION_ICON_BUTTON_TONES.DANGER]:
    "text-danger-text hover:bg-danger-soft hover:text-danger-text",
  [ACTION_ICON_BUTTON_TONES.MUTED]:
    "text-muted-foreground hover:bg-muted hover:text-foreground",
} satisfies Record<ActionIconButtonTone, string>;

const SIZE_CLASS_NAMES = {
  [ACTION_ICON_BUTTON_SIZES.XS]: "h-5 w-5",
  [ACTION_ICON_BUTTON_SIZES.SM]: "h-7 w-7",
  [ACTION_ICON_BUTTON_SIZES.MD]: "h-8 w-8",
  [ACTION_ICON_BUTTON_SIZES.LG]: "h-10 w-10",
} satisfies Record<ActionIconButtonSize, string>;

export function ActionIconButton({
  buttonSize = ACTION_ICON_BUTTON_SIZES.SM,
  className,
  icon: Icon,
  loading = false,
  tone = ACTION_ICON_BUTTON_TONES.DEFAULT,
  type = "button",
  disabled,
  ...props
}: ActionIconButtonProps) {
  return (
    <Button
      type={type}
      variant="ghost"
      size="icon-sm"
      disabled={disabled || loading}
      className={cn(SIZE_CLASS_NAMES[buttonSize], TONE_CLASS_NAMES[tone], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
