import { type ComponentProps } from "react";
import { Edit, Loader2 } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/lib/utils";

export interface EditButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
  strong?: boolean;
}

export function EditButton({
  className,
  children,
  loading = false,
  strong = false,
  type = "button",
  disabled,
  ...props
}: EditButtonProps) {
  return (
    <Button
      type={type}
      variant="outline"
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
        <Edit className="h-3.5 w-3.5" />
      )}
      {children}
    </Button>
  );
}
