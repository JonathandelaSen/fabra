import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { CopyPasteWorkflowModalHeader, CopyPasteWorkflowError } from "./copy-paste-workflow-modal-parts";

const messages = getMessages("en");
const CLOSE_LABEL = messages.common.actions.close;
const CORRECTION_COPIED = messages.analysisFlow.copyPaste.correctionCopied;
const COPY_CORRECTION = messages.analysisFlow.copyPaste.copyCorrection;

const TITLE_TEXT = messages.performanceReview.copyPaste.title;

describe("CopyPasteWorkflowModalHeader", () => {
  it("renders correctly with title and intro", () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <CopyPasteWorkflowModalHeader
        title={TITLE_TEXT}
        intro="Custom Workflow Intro"
        onClose={handleClose}
      />
    );

    expect(screen.getByRole("heading", { level: 2, name: TITLE_TEXT })).toBeInTheDocument();
    expect(screen.getByText("Custom Workflow Intro")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const handleClose = vi.fn();
    const { user } = renderWithProviders(
      <CopyPasteWorkflowModalHeader
        title={TITLE_TEXT}
        intro="Intro"
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: CLOSE_LABEL });
    expect(closeBtn).toBeInTheDocument();

    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe("CopyPasteWorkflowError", () => {
  it("renders the error message", () => {
    renderWithProviders(
      <CopyPasteWorkflowError
        error="Some error message"
        step="copy"
        copiedCorrection={false}
        onCopyCorrection={vi.fn()}
      />
    );

    expect(screen.getByText("Some error message")).toBeInTheDocument();
    // Copy correction button is only shown when step is 'paste'
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders copy correction button when step is paste", async () => {
    const handleCopyCorrection = vi.fn();
    const { user } = renderWithProviders(
      <CopyPasteWorkflowError
        error="Some error message"
        step="paste"
        copiedCorrection={false}
        onCopyCorrection={handleCopyCorrection}
      />
    );

    const button = screen.getByRole("button", { name: COPY_CORRECTION });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleCopyCorrection).toHaveBeenCalledTimes(1);
  });

  it("renders correction copied label when copiedCorrection is true", () => {
    renderWithProviders(
      <CopyPasteWorkflowError
        error="Some error message"
        step="paste"
        copiedCorrection={true}
        onCopyCorrection={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: CORRECTION_COPIED })).toBeInTheDocument();
  });
});
