import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { CopyPastePromptStep } from "./copy-paste-prompt-step";

function renderStep(
  overrides: Partial<React.ComponentProps<typeof CopyPastePromptStep>> = {},
) {
  const props: React.ComponentProps<typeof CopyPastePromptStep> = {
    prompt: "Analyze my CV",
    copyLabel: "Copy prompt",
    copiedLabel: "Copied",
    onCopyPrompt: vi.fn(),
    copiedPrompt: false,
    ...overrides,
  };
  return { props, ...renderWithProviders(<CopyPastePromptStep {...props} />) };
}

describe("CopyPastePromptStep", () => {
  it("shows the prompt in a read-only textarea", () => {
    renderStep({ prompt: "Analyze my CV" });

    const textarea = screen.getByDisplayValue("Analyze my CV");
    expect(textarea).toHaveAttribute("readonly");
  });

  it("shows the copy label and triggers the copy handler when clicked", async () => {
    const { props, user } = renderStep({ copiedPrompt: false });

    const copyButton = screen.getByRole("button", { name: "Copy prompt" });
    expect(copyButton).toBeEnabled();

    await user.click(copyButton);

    expect(props.onCopyPrompt).toHaveBeenCalledOnce();
  });

  it("swaps to the copied label once the prompt has been copied", () => {
    renderStep({ copiedPrompt: true });

    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Copy prompt" }),
    ).not.toBeInTheDocument();
  });

  it("disables the copy button when the prompt is empty", () => {
    renderStep({ prompt: "" });

    expect(screen.getByRole("button", { name: "Copy prompt" })).toBeDisabled();
  });

  it("disables the copy button while preparing", () => {
    renderStep({ isPreparing: true });

    expect(screen.getByRole("button", { name: "Copy prompt" })).toBeDisabled();
  });
});
