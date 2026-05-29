import { type ComponentProps } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DeleteButtonProps extends ComponentProps<typeof Button> {
  strong?: boolean;
}

export function DeleteButton({
  className,
  children,
  strong = false,
  ...props
}: DeleteButtonProps) {
  return (
    <Button
      variant="destructive"
      size="sm"
      className={cn(
        "h-9",
        children ? "px-3 gap-1.5" : "w-9 px-0",
        strong ? "font-semibold" : "font-medium",
        className,
      )}
      {...props}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
}
