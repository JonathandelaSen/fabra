import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { featureSurfaces } from "./feature-visual-system";

type BasicPanelRadius = "lg" | "xl";

const radiusClassNames: Record<BasicPanelRadius, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
};

type BasicPanelProps<TElement extends ElementType = "div"> = {
  as?: TElement;
  children: ReactNode;
  className?: string;
  radius?: BasicPanelRadius;
} & Omit<ComponentPropsWithoutRef<TElement>, "as" | "children" | "className">;

export function BasicPanel<TElement extends ElementType = "div">({
  as,
  children,
  className,
  radius = "xl",
  ...props
}: BasicPanelProps<TElement>) {
  const Component = as || "div";

  return (
    <Component
      className={cn(radiusClassNames[radius], featureSurfaces.panel, className)}
      {...props}
    >
      {children}
    </Component>
  );
}
