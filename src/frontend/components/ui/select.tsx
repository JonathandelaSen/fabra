import React, { forwardRef } from "react";
import { cn } from "@/frontend/utils/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-9 w-full cursor-pointer rounded-lg border border-line bg-field px-3 py-1.5 text-sm text-text-main outline-none transition-all duration-150 hover:bg-panel-hover hover:border-line-default focus:bg-panel-elevated focus:border-ring/50 focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select };
