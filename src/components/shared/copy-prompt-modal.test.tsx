import { screen, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { CopyPromptModal } from "./copy-prompt-modal";
import { copyToClipboard } from "@/lib/clipboard";

const messages = getMessages("en");
const TITLE = messages.workJournal.copyPaste.promptCopied;
const MESSAGE = messages.performanceReview.copyPaste.intro;
const COPY_BTN_TEXT = messages.workJournal.copyPaste.copyPrompt;

vi.mock("@/lib/clipboard", () => ({
  copyToClipboard: vi.fn(),
}));

describe("CopyPromptModal", () => {
  it("renders when isOpen is true", () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <CopyPromptModal
        isOpen={true}
        onClose={handleClose}
        title={TITLE}
        message={MESSAGE}
        promptContent="Test Prompt"
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: TITLE })).toBeInTheDocument();
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
    expect(screen.getByText("Test Prompt")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <CopyPromptModal
        isOpen={false}
        onClose={handleClose}
        title={TITLE}
        message={MESSAGE}
        promptContent="Test Prompt"
      />
    );

    expect(screen.queryByRole("heading", { level: 3, name: TITLE })).not.toBeInTheDocument();
  });

  it("calls copyToClipboard and onClose when Copy is clicked", async () => {
    const handleClose = vi.fn();
    const { user } = renderWithProviders(
      <CopyPromptModal
        isOpen={true}
        onClose={handleClose}
        title={TITLE}
        message={MESSAGE}
        promptContent="Test Prompt"
      />
    );

    const copyBtn = screen.getByRole("button", { name: "Copy" });
    expect(copyBtn).toBeInTheDocument();

    await user.click(copyBtn);

    expect(copyToClipboard).toHaveBeenCalledWith("Test Prompt");
    
    // Wait for the setTimeout (750ms) to trigger onClose
    await new Promise((resolve) => setTimeout(resolve, 850));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
