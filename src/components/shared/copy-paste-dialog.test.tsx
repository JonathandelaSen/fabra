import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { CopyPasteDialog } from "./copy-paste-dialog";

const messages = getMessages("en");
const DIALOG_TITLE = messages.performanceReview.copyPaste.title;
const CLOSE_LABEL = messages.common.actions.close;
const CONTENT_TEXT = messages.common.actions.save;

describe("CopyPasteDialog", () => {
  it("renders the title and children correctly", () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <CopyPasteDialog title={DIALOG_TITLE} onClose={handleClose}>
        <div data-testid="dialog-child">{CONTENT_TEXT}</div>
      </CopyPasteDialog>
    );

    expect(screen.getByRole("heading", { level: 2, name: DIALOG_TITLE })).toBeInTheDocument();
    expect(screen.getByTestId("dialog-child")).toBeInTheDocument();
    expect(screen.getByText(CONTENT_TEXT)).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const handleClose = vi.fn();
    const { user } = renderWithProviders(
      <CopyPasteDialog title={DIALOG_TITLE} onClose={handleClose} closeLabel={CLOSE_LABEL}>
        <div>{CONTENT_TEXT}</div>
      </CopyPasteDialog>
    );

    const closeBtn = screen.getByRole("button", { name: CLOSE_LABEL });
    expect(closeBtn).toBeInTheDocument();

    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("applies custom className and bodyClassName", () => {
    const handleClose = vi.fn();
    const { container } = renderWithProviders(
      <CopyPasteDialog
        title={DIALOG_TITLE}
        onClose={handleClose}
        className="custom-dialog-wrapper"
        bodyClassName="custom-body-wrapper"
      >
        <div>{CONTENT_TEXT}</div>
      </CopyPasteDialog>
    );

    // Search inside container for the element that has class custom-dialog-wrapper and custom-body-wrapper
    const dialogWrapper = container.querySelector(".custom-dialog-wrapper");
    expect(dialogWrapper).toBeInTheDocument();

    const bodyWrapper = container.querySelector(".custom-body-wrapper");
    expect(bodyWrapper).toBeInTheDocument();
  });
});
