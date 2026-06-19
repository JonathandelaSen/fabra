import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { SidebarEmptyState } from "./sidebar-empty-state";
import type { LucideIcon } from "lucide-react";

const messages = getMessages("en");
const EMPTY_MESSAGE = messages.performanceReview.empty.sidebar;

const TestIcon = (({ className }: { className?: string }) => {
  return <svg data-testid="test-icon" className={className} />;
}) as unknown as LucideIcon;

describe("SidebarEmptyState", () => {
  it("renders the icon and message correctly", () => {
    renderWithProviders(
      <SidebarEmptyState icon={TestIcon} message={EMPTY_MESSAGE} />
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <SidebarEmptyState icon={TestIcon} message={EMPTY_MESSAGE} className="custom-sidebar-empty-class" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
