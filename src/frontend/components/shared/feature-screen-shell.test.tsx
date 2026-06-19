import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { FeatureScreenShell } from "./feature-screen-shell";

const messages = getMessages("en");
const FEATURE_TITLE = messages.receivedFeedback.title;
const NEW_ACTION_LABEL = messages.receivedFeedback.newFeedback;
const FEATURE_CONTENT = messages.receivedFeedback.sections.feedbackContent;
const CUSTOM_TITLE = messages.settings.title;
const DETAIL_TITLE = messages.receivedFeedback.editFeedback;

describe("FeatureScreenShell", () => {
  it("renders a string title as the page heading with actions and content", () => {
    renderWithProviders(
      <FeatureScreenShell
        title={FEATURE_TITLE}
        actions={<button type="button">{NEW_ACTION_LABEL}</button>}
      >
        <p>{FEATURE_CONTENT}</p>
      </FeatureScreenShell>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: FEATURE_TITLE }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: NEW_ACTION_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getByText(FEATURE_CONTENT)).toBeInTheDocument();
  });

  it("renders a custom title without adding a competing heading", () => {
    renderWithProviders(
      <FeatureScreenShell
        title={<h2>{CUSTOM_TITLE}</h2>}
      >
        {FEATURE_CONTENT}
      </FeatureScreenShell>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: CUSTOM_TITLE }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("exposes and invokes the translated mobile back action", async () => {
    const onMobileBack = vi.fn();
    const backToList = getMessages("es").common.listDetail.backToList;
    const { user } = renderWithProviders(
      <FeatureScreenShell
        title={DETAIL_TITLE}
        mobileBackActive
        onMobileBack={onMobileBack}
      >
        {FEATURE_CONTENT}
      </FeatureScreenShell>,
      { locale: "es" },
    );

    await user.click(
      screen.getByRole("button", { name: backToList }),
    );

    expect(onMobileBack).toHaveBeenCalledOnce();
  });
});
