import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { ExternalAIQuickActions } from "./external-ai-quick-actions";

const quickActionsMessages =
  getMessages("en").analysisFlow.copyPaste.externalQuickActions;

const PROVIDERS = [
  { name: "ChatGPT", url: "https://chatgpt.com/" },
  { name: "Gemini", url: "https://gemini.google.com/app" },
  { name: "Claude", url: "https://claude.ai/" },
] as const;

function providerButtonName(provider: string) {
  return quickActionsMessages.openProvider.replace("{provider}", provider);
}

describe("ExternalAIQuickActions", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the static copy and one button per external provider", () => {
    renderWithProviders(
      <ExternalAIQuickActions prompt="Analyze my CV" onCopyPrompt={vi.fn()} />,
    );

    expect(screen.getByText(quickActionsMessages.title)).toBeInTheDocument();
    expect(
      screen.getByText(quickActionsMessages.description),
    ).toBeInTheDocument();
    expect(screen.getByText(quickActionsMessages.commonBadge)).toBeInTheDocument();

    for (const { name } of PROVIDERS) {
      expect(
        screen.getByRole("button", { name: providerButtonName(name) }),
      ).toBeEnabled();
    }
  });

  it("copies the prompt before opening the provider in a new tab", async () => {
    const onCopyPrompt = vi.fn().mockResolvedValue(undefined);
    const { user } = renderWithProviders(
      <ExternalAIQuickActions prompt="Analyze my CV" onCopyPrompt={onCopyPrompt} />,
    );

    await user.click(
      screen.getByRole("button", { name: providerButtonName("Claude") }),
    );

    expect(onCopyPrompt).toHaveBeenCalledOnce();
    expect(openSpy).toHaveBeenCalledWith(
      "https://claude.ai/",
      "_blank",
      "noopener,noreferrer",
    );

    const copyOrder = onCopyPrompt.mock.invocationCallOrder[0];
    const openOrder = openSpy.mock.invocationCallOrder[0];
    expect(copyOrder).toBeLessThan(openOrder);
  });

  it("opens the matching url for each provider", async () => {
    const { user } = renderWithProviders(
      <ExternalAIQuickActions prompt="Analyze my CV" onCopyPrompt={vi.fn()} />,
    );

    for (const { name, url } of PROVIDERS) {
      await user.click(
        screen.getByRole("button", { name: providerButtonName(name) }),
      );
      expect(openSpy).toHaveBeenLastCalledWith(
        url,
        "_blank",
        "noopener,noreferrer",
      );
    }
  });

  it("disables every action and does nothing when the prompt is empty", async () => {
    const onCopyPrompt = vi.fn();
    const { user } = renderWithProviders(
      <ExternalAIQuickActions prompt="" onCopyPrompt={onCopyPrompt} />,
    );

    const claudeButton = screen.getByRole("button", {
      name: providerButtonName("Claude"),
    });
    expect(claudeButton).toBeDisabled();

    await user.click(claudeButton);

    expect(onCopyPrompt).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("disables every action when explicitly disabled even with a prompt", async () => {
    const onCopyPrompt = vi.fn();
    const { user } = renderWithProviders(
      <ExternalAIQuickActions
        prompt="Analyze my CV"
        disabled
        onCopyPrompt={onCopyPrompt}
      />,
    );

    const geminiButton = screen.getByRole("button", {
      name: providerButtonName("Gemini"),
    });
    expect(geminiButton).toBeDisabled();

    await user.click(geminiButton);

    expect(onCopyPrompt).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });
});
