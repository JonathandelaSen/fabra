import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import CopyPasteWorkflowSteps from "./copy-paste-workflow-steps";

const messages = getMessages("en");
const STEP_COPY = messages.analysisFlow.copyPaste.stepCopy;
const STEP_PASTE = messages.analysisFlow.copyPaste.stepPaste;
const STEP_REVIEW = messages.analysisFlow.copyPaste.stepReview;

describe("CopyPasteWorkflowSteps", () => {
  it("renders steps correctly", () => {
    renderWithProviders(<CopyPasteWorkflowSteps step="copy" />);

    expect(screen.getByRole("button", { name: STEP_COPY })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: STEP_PASTE })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: STEP_REVIEW })).toBeInTheDocument();
  });

  it("calls onStepChange when a clickable step is clicked", async () => {
    const handleStepChange = vi.fn();
    const { user } = renderWithProviders(
      <CopyPasteWorkflowSteps step="copy" onStepChange={handleStepChange} />
    );

    const pasteBtn = screen.getByRole("button", { name: STEP_PASTE });
    await user.click(pasteBtn);

    expect(handleStepChange).toHaveBeenCalledWith("paste");
  });

  it("does not allow clicking disabled steps or current active step", async () => {
    const handleStepChange = vi.fn();
    const { user } = renderWithProviders(
      <CopyPasteWorkflowSteps
        step="copy"
        onStepChange={handleStepChange}
        canReview={false}
      />
    );

    // Current step (copy) should be disabled from clicking
    const copyBtn = screen.getByRole("button", { name: STEP_COPY });
    expect(copyBtn).toBeDisabled();

    // Review step is not allowed since canReview is false
    const reviewBtn = screen.getByRole("button", { name: STEP_REVIEW });
    expect(reviewBtn).toBeDisabled();

    // Paste step is clickable
    const pasteBtn = screen.getByRole("button", { name: STEP_PASTE });
    expect(pasteBtn).not.toBeDisabled();
  });
});
