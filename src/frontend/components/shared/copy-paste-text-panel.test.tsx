import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { CopyPasteTextPanel } from "./copy-paste-text-panel";
import { copyToClipboard } from "@/lib/clipboard";

const messages = getMessages("en");
const TITLE = messages.workJournal.copyPaste.panelTitle;
const PRIVACY_NOTICE = messages.workJournal.copyPaste.privacyNotice;
const PROMPT = "Test Prompt Content";
const COPY_LABEL = messages.workJournal.copyPaste.copyPrompt;
const COPIED_LABEL = messages.workJournal.copyPaste.promptCopied;
const PASTED_TEXT_LABEL = messages.workJournal.copyPaste.pasteResponseLabel;
const PASTED_TEXT_PLACEHOLDER = messages.workJournal.copyPaste.pasteResponsePlaceholder;
const APPLY_LABEL = messages.workJournal.copyPaste.usePastedText;
const EMPTY_RESPONSE_ERROR = messages.workJournal.copyPaste.emptyResponse;

vi.mock("@/lib/clipboard", () => ({
  copyToClipboard: vi.fn(),
}));

describe("CopyPasteTextPanel", () => {
  it("renders correctly with provided props", () => {
    const handleApplyText = vi.fn();
    renderWithProviders(
      <CopyPasteTextPanel
        title={TITLE}
        privacyNotice={PRIVACY_NOTICE}
        prompt={PROMPT}
        copyLabel={COPY_LABEL}
        copiedLabel={COPIED_LABEL}
        pastedTextLabel={PASTED_TEXT_LABEL}
        pastedTextPlaceholder={PASTED_TEXT_PLACEHOLDER}
        applyLabel={APPLY_LABEL}
        emptyResponseError={EMPTY_RESPONSE_ERROR}
        onApplyText={handleApplyText}
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: TITLE })).toBeInTheDocument();
    expect(screen.getByText(PRIVACY_NOTICE)).toBeInTheDocument();
    expect(screen.getByText(PASTED_TEXT_LABEL)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PASTED_TEXT_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: APPLY_LABEL })).toBeInTheDocument();
  });

  it("calls copyToClipboard when Copy button is clicked", async () => {
    const handleApplyText = vi.fn();
    const { user } = renderWithProviders(
      <CopyPasteTextPanel
        title={TITLE}
        privacyNotice={PRIVACY_NOTICE}
        prompt={PROMPT}
        copyLabel={COPY_LABEL}
        copiedLabel={COPIED_LABEL}
        pastedTextLabel={PASTED_TEXT_LABEL}
        pastedTextPlaceholder={PASTED_TEXT_PLACEHOLDER}
        applyLabel={APPLY_LABEL}
        emptyResponseError={EMPTY_RESPONSE_ERROR}
        onApplyText={handleApplyText}
      />
    );

    const copyBtn = screen.getByRole("button", { name: COPY_LABEL });
    await user.click(copyBtn);

    expect(copyToClipboard).toHaveBeenCalledWith(PROMPT);
  });

  it("shows error and does not call onApplyText when applying empty text", async () => {
    const handleApplyText = vi.fn();
    const { user } = renderWithProviders(
      <CopyPasteTextPanel
        title={TITLE}
        privacyNotice={PRIVACY_NOTICE}
        prompt={PROMPT}
        copyLabel={COPY_LABEL}
        copiedLabel={COPIED_LABEL}
        pastedTextLabel={PASTED_TEXT_LABEL}
        pastedTextPlaceholder={PASTED_TEXT_PLACEHOLDER}
        applyLabel={APPLY_LABEL}
        emptyResponseError={EMPTY_RESPONSE_ERROR}
        onApplyText={handleApplyText}
      />
    );

    const applyBtn = screen.getByRole("button", { name: APPLY_LABEL });
    await user.click(applyBtn);

    expect(screen.getByText(EMPTY_RESPONSE_ERROR)).toBeInTheDocument();
    expect(handleApplyText).not.toHaveBeenCalled();
  });

  it("calls onApplyText when text is entered and apply button is clicked", async () => {
    const handleApplyText = vi.fn();
    const { user } = renderWithProviders(
      <CopyPasteTextPanel
        title={TITLE}
        privacyNotice={PRIVACY_NOTICE}
        prompt={PROMPT}
        copyLabel={COPY_LABEL}
        copiedLabel={COPIED_LABEL}
        pastedTextLabel={PASTED_TEXT_LABEL}
        pastedTextPlaceholder={PASTED_TEXT_PLACEHOLDER}
        applyLabel={APPLY_LABEL}
        emptyResponseError={EMPTY_RESPONSE_ERROR}
        onApplyText={handleApplyText}
      />
    );

    const textarea = screen.getByPlaceholderText(PASTED_TEXT_PLACEHOLDER);
    await user.type(textarea, "Pasted Response Text");

    const applyBtn = screen.getByRole("button", { name: APPLY_LABEL });
    await user.click(applyBtn);

    expect(handleApplyText).toHaveBeenCalledWith("Pasted Response Text");
    expect(screen.queryByText(EMPTY_RESPONSE_ERROR)).not.toBeInTheDocument();
  });
});
