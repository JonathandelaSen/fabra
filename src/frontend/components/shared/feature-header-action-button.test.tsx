import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { FeatureHeaderActionButton } from "./feature-header-action-button";

const messages = getMessages("en");
const ACTION_LABEL = messages.receivedFeedback.newFeedback;
const CANCEL_LABEL = messages.common.actions.cancel;

describe("FeatureHeaderActionButton", () => {
  it("shows the feature action and calls the consumer", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <FeatureHeaderActionButton label={ACTION_LABEL} onClick={onClick} />,
    );

    await user.click(screen.getByRole("button", { name: ACTION_LABEL }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("switches to the translated cancel action while active", () => {
    renderWithProviders(
      <FeatureHeaderActionButton
        label={ACTION_LABEL}
        isActive
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: CANCEL_LABEL })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: ACTION_LABEL }),
    ).not.toBeInTheDocument();
  });

  it("prevents interaction while disabled", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <FeatureHeaderActionButton
        label={ACTION_LABEL}
        disabled
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button", { name: ACTION_LABEL });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
