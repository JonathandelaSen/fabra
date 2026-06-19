import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { FeatureTwoPaneLayout } from "./feature-two-pane-layout";

const messages = getMessages("en");
const FIRST_ITEM = messages.navigation.receivedFeedback;
const SECOND_ITEM = messages.navigation.feedbackNotes;
const DETAIL_CONTENT = messages.receivedFeedback.emptySelection;

function TestLayout({ mobileDetailActive }: { mobileDetailActive?: boolean }) {
  return (
    <FeatureTwoPaneLayout
      mobileDetailActive={mobileDetailActive}
      sidebar={
        <>
          <button type="button">{FIRST_ITEM}</button>
          <button type="button">{SECOND_ITEM}</button>
        </>
      }
    >
      <h2>{DETAIL_CONTENT}</h2>
    </FeatureTwoPaneLayout>
  );
}

describe("FeatureTwoPaneLayout", () => {
  it("renders both panes without mobile visibility rules by default", () => {
    renderWithProviders(<TestLayout />);

    expect(screen.getByRole("button", { name: FIRST_ITEM })).toBeVisible();
    expect(screen.getByRole("main")).not.toHaveAttribute("tabindex");
    expect(screen.getByRole("heading", { name: DETAIL_CONTENT })).toBeVisible();
  });

  it("moves focus into the detail pane when mobile detail becomes active", async () => {
    const { rerender, user } = renderWithProviders(
      <TestLayout mobileDetailActive={false} />,
    );
    await user.click(screen.getByRole("button", { name: SECOND_ITEM }));

    rerender(<TestLayout mobileDetailActive />);

    expect(screen.getByRole("main")).toHaveFocus();
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });

  it("restores focus to the last sidebar control when returning to the list", async () => {
    const { rerender, user } = renderWithProviders(
      <TestLayout mobileDetailActive={false} />,
    );
    const secondItem = screen.getByRole("button", { name: SECOND_ITEM });
    await user.click(secondItem);

    rerender(<TestLayout mobileDetailActive />);
    rerender(<TestLayout mobileDetailActive={false} />);

    expect(secondItem).toHaveFocus();
  });
});
