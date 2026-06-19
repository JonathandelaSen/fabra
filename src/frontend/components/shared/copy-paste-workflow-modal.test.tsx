import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import CopyPasteWorkflowModal, {
  type CopyPasteWorkflowModalProps,
} from "./copy-paste-workflow-modal";

interface PreviewData {
  score: number;
}

const messages = getMessages("en");
const copyPasteMessages = messages.analysisFlow.copyPaste;
const APPLY_LABEL = messages.common.actions.save;
const PREVIEW_LABEL = messages.settings.apiKey.status;

function createProps(
  overrides: Partial<CopyPasteWorkflowModalProps<PreviewData>> = {},
): CopyPasteWorkflowModalProps<PreviewData> {
  return {
    open: true,
    onClose: vi.fn(),
    title: copyPasteMessages.title,
    intro: copyPasteMessages.intro,
    step: "copy",
    onStepChange: vi.fn(),
    isPreparing: false,
    prompt: messages.analysisFlow.forms.additionalContextPlaceholder,
    privacyNotice: "",
    copiedPrompt: false,
    onCopyPrompt: vi.fn(),
    rawResponse: "",
    onRawResponseChange: vi.fn(),
    isPreviewing: false,
    onValidateResponse: vi.fn(),
    previewData: null,
    renderPreview: (data) => <p>{PREVIEW_LABEL}: {data.score}</p>,
    getApplyLabel: () => APPLY_LABEL,
    isApplying: false,
    onApply: vi.fn(),
    error: null,
    copiedCorrection: false,
    onCopyCorrection: vi.fn(),
    ...overrides,
  };
}

describe("CopyPasteWorkflowModal", () => {
  it("does not expose dialog content while closed", () => {
    renderWithProviders(
      <CopyPasteWorkflowModal {...createProps({ open: false })} />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes the copy step and advances only through its action", async () => {
    const props = createProps();
    const { user } = renderWithProviders(
      <CopyPasteWorkflowModal {...props} />,
    );

    expect(
      screen.getByRole("dialog", { name: props.title }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(props.prompt)).toHaveAttribute("readonly");

    await user.click(screen.getByRole("button", { name: copyPasteMessages.continue }));

    expect(props.onStepChange).toHaveBeenCalledWith("paste");
  });

  it("disables paste validation until a non-empty response is available", async () => {
    const props = createProps({ step: "paste", rawResponse: "   " });
    const { rerender, user } = renderWithProviders(
      <CopyPasteWorkflowModal {...props} />,
    );

    expect(
      screen.getByRole("button", { name: copyPasteMessages.validateResponse }),
    ).toBeDisabled();

    const readyProps = createProps({
      step: "paste",
      rawResponse: '{"score":82}',
      onValidateResponse: props.onValidateResponse,
    });
    rerender(<CopyPasteWorkflowModal {...readyProps} />);

    await user.click(
      screen.getByRole("button", { name: copyPasteMessages.validateResponse }),
    );

    expect(props.onValidateResponse).toHaveBeenCalledOnce();
  });

  it("renders review data and applies it through the consumer action", async () => {
    const props = createProps({
      step: "review",
      previewData: { score: 82 },
    });
    const { user } = renderWithProviders(
      <CopyPasteWorkflowModal {...props} />,
    );

    expect(screen.getByText(`${PREVIEW_LABEL}: 82`)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: APPLY_LABEL }));

    expect(props.onApply).toHaveBeenCalledOnce();
  });

  it("keeps close available while an apply operation is pending", async () => {
    const props = createProps({
      step: "review",
      previewData: { score: 82 },
      isApplying: true,
    });
    const { user } = renderWithProviders(
      <CopyPasteWorkflowModal {...props} />,
    );

    expect(screen.getByRole("button", { name: APPLY_LABEL })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: copyPasteMessages.cancel }));

    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("shows the privacy warning only when the workflow provides one", () => {
    const privacyNotice = copyPasteMessages.privacyNotice;
    const { rerender } = renderWithProviders(
      <CopyPasteWorkflowModal
        {...createProps({ privacyNotice })}
      />,
    );

    expect(screen.getByText(privacyNotice)).toBeInTheDocument();

    rerender(<CopyPasteWorkflowModal {...createProps()} />);

    expect(screen.queryByText(privacyNotice)).not.toBeInTheDocument();
  });

  it("allows navigating steps by clicking their headers when permitted", async () => {
    const props = createProps({ previewData: { score: 82 } });
    const { user } = renderWithProviders(
      <CopyPasteWorkflowModal {...props} />,
    );

    await user.click(screen.getByRole("button", { name: copyPasteMessages.stepPaste }));
    expect(props.onStepChange).toHaveBeenCalledWith("paste");

    await user.click(screen.getByRole("button", { name: copyPasteMessages.stepReview }));
    expect(props.onStepChange).toHaveBeenCalledWith("review");
  });

  it("prevents clicking the review step header if review is not available", async () => {
    const props = createProps({ previewData: null });
    const { user } = renderWithProviders(
      <CopyPasteWorkflowModal {...props} />,
    );

    const reviewButton = screen.getByRole("button", { name: copyPasteMessages.stepReview });
    expect(reviewButton).toBeDisabled();

    await user.click(reviewButton);
    expect(props.onStepChange).not.toHaveBeenCalled();
  });
});

