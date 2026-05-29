import { type ComponentProps } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DeleteButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
  strong?: boolean;
}

export function DeleteButton({
  className,
  children,
  loading = false,
  strong = false,
  disabled,
  ...props
}: DeleteButtonProps) {
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={disabled || loading}
      className={cn(
        "h-9",
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
