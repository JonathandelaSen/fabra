import { cn } from "@/lib/utils";
import type React from "react";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-panel-control", className)}
      {...props}
    />
  );
}

export { Skeleton };
