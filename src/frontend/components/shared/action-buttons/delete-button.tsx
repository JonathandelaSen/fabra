import { type ComponentProps } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DeleteButtonProps extends ComponentProps<typeof Button> {
  fullWidth?: boolean;
  loading?: boolean;
  strong?: boolean;
}

export function DeleteButton({
  className,
  children,
  fullWidth = false,
  loading = false,
  strong = false,
  type = "button",
  disabled,
  ...props
}: DeleteButtonProps) {
  return (
    <Button
      type={type}
      variant="destructive"
      size="sm"
      disabled={disabled || loading}
      className={cn(
        "h-9",
        fullWidth && "w-full",
        children ? "px-3 gap-1.5" : "w-9 px-0",
        strong ? "font-semibold" : "font-medium",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {children}
    </Button>
  );
}
