import { type ComponentProps } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EditButtonProps extends ComponentProps<typeof Button> {}

export function EditButton({ className, children, ...props }: EditButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-9", children ? "px-3 gap-1.5" : "w-9 px-0", className)}
      {...props}
    >
      <Edit className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
}
