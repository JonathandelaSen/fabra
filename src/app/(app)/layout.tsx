import type { ReactNode } from "react";
import AppShell from "@/components/shell/app-shell";

export default function AppGroupLayout({
  children: _children,
}: {
  children: ReactNode;
}) {
  return <AppShell />;
}
