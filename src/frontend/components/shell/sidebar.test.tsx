import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { I18nProvider } from "@/frontend/components/shared/i18n-provider";
import Sidebar from "./sidebar";

const messages = getMessages("en");

function renderSidebar(onOpenCVAnalyses = vi.fn()) {
  return renderWithProviders(
    <I18nProvider initialLocale="en">
      <Sidebar
        activeView="home"
        onOpenHome={vi.fn()}
        onOpenCVAnalyses={onOpenCVAnalyses}
        onOpenJobAnalyses={vi.fn()}
        onOpenCVs={vi.fn()}
        onOpenTemplates={vi.fn()}
        onOpenEditor={vi.fn()}
        onOpenQuestions={vi.fn()}
        onOpenJournal={vi.fn()}
        onOpenObjectives={vi.fn()}
        onOpenReceivedFeedback={vi.fn()}
        onOpenReviews={vi.fn()}
        onOpenFeedbackNotes={vi.fn()}
        onOpenSettings={vi.fn()}
        onOpenAdmin={vi.fn()}
        userEmail="agent-test@example.com"
      />
    </I18nProvider>,
  );
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
}

describe("Sidebar", () => {
  afterEach(() => {
    setViewportWidth(1024);
  });

  it("closes the mobile menu after selecting a navigation item", async () => {
    setViewportWidth(390);
    const onOpenCVAnalyses = vi.fn();
    const { user } = renderSidebar(onOpenCVAnalyses);

    const collapsedLogo = await screen.findByTitle(messages.common.appName);
    await user.click(collapsedLogo);
    await user.click(
      screen.getByRole("button", { name: messages.navigation.cvAnalyses }),
    );

    expect(onOpenCVAnalyses).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: messages.common.actions.close,
        }),
      ).not.toBeInTheDocument();
    });
  });
});
