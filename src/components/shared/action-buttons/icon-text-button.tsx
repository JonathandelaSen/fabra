import { type ComponentProps, type ElementType } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface IconTextButtonProps extends ComponentProps<typeof Button> {
  icon: ElementType<{ className?: string }>;
}

export function IconTextButton({
  className,
  children,
  icon: Icon,
  ...props
}: IconTextButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-9 px-3 gap-1.5", className)}
      {...props}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
}
