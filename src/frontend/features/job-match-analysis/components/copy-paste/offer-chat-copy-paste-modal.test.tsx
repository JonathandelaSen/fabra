import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { OfferChatCopyPasteModal } from "./offer-chat-copy-paste-modal";

const messages = getMessages("en").analysisDetail.chat.copyPaste;

const defaultProps = {
  isOpen: true,
  isApplying: false,
  prompt: "Offer chat prompt",
  privacyNotice: messages.privacyNotice,
  onClose: vi.fn(),
  onApplyText: vi.fn(),
};

describe("OfferChatCopyPasteModal", () => {
  it("uses the unified copy-paste dialog when open", () => {
    renderWithProviders(<OfferChatCopyPasteModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: messages.title })
    ).toBeInTheDocument();
    expect(screen.getByText(messages.panelTitle)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderWithProviders(
      <OfferChatCopyPasteModal {...defaultProps} isOpen={false} />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes from the unified dialog close button", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <OfferChatCopyPasteModal {...defaultProps} onClose={onClose} />
    );

    await user.click(screen.getByRole("button", { name: messages.close }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
