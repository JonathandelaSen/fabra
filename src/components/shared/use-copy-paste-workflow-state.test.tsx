import { act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { useCopyPasteWorkflowState } from "./use-copy-paste-workflow-state";

const messages = getMessages("en");
const PROMPT = messages.analysisFlow.copyPaste.intro;
const PRIVACY_NOTICE = messages.analysisFlow.copyPaste.privacyNotice;
const PREPARE_ERROR = messages.receivedFeedback.errors.loadFeedback;
const PREVIEW_ERROR = messages.receivedFeedback.errors.saveFeedback;
const APPLY_ERROR = messages.receivedFeedback.errors.deleteFeedback;

function createOptions() {
  return {
    open: true,
    prepare: vi.fn().mockResolvedValue({
      prompt: PROMPT,
      privacyNotice: PRIVACY_NOTICE,
    }),
    preview: vi.fn().mockResolvedValue({ score: 82 }),
    apply: vi.fn().mockResolvedValue({ id: "result-1" }),
    getCorrectionInstructions: vi.fn().mockReturnValue(PREVIEW_ERROR),
    onApplied: vi.fn(),
    onClose: vi.fn(),
  };
}

describe("useCopyPasteWorkflowState", () => {
  it("prepares a newly opened workflow", async () => {
    const options = createOptions();
    const { result } = renderHookWithProviders(() =>
      useCopyPasteWorkflowState(options),
    );

    expect(result.current.isPreparing).toBe(true);

    await waitFor(() => {
      expect(result.current.isPreparing).toBe(false);
    });

    expect(options.prepare).toHaveBeenCalledOnce();
    expect(result.current.step).toBe("copy");
    expect(result.current.prompt).toBe(PROMPT);
    expect(result.current.privacyNotice).toBe(PRIVACY_NOTICE);
    expect(result.current.error).toBeNull();
  });

  it("surfaces preparation errors without leaving the workflow loading", async () => {
    const options = createOptions();
    options.prepare.mockRejectedValue(new Error(PREPARE_ERROR));

    const { result } = renderHookWithProviders(() =>
      useCopyPasteWorkflowState(options),
    );

    await waitFor(() => {
      expect(result.current.isPreparing).toBe(false);
    });

    expect(result.current.prepareData).toBeNull();
    expect(result.current.error).toBe(PREPARE_ERROR);
  });

  it("validates the pasted response and advances to review", async () => {
    const options = createOptions();
    const { result } = renderHookWithProviders(() =>
      useCopyPasteWorkflowState(options),
    );
    await waitFor(() => expect(result.current.isPreparing).toBe(false));

    act(() => {
      result.current.setStep("paste");
      result.current.setRawResponse('{"score":82}');
    });
    await act(async () => {
      await result.current.validateResponse();
    });

    expect(options.preview).toHaveBeenCalledWith('{"score":82}');
    expect(result.current.previewData).toEqual({ score: 82 });
    expect(result.current.step).toBe("review");
    expect(result.current.error).toBeNull();
  });

  it("keeps the pasted response available when validation fails", async () => {
    const options = createOptions();
    options.preview.mockRejectedValue(new Error(PREVIEW_ERROR));
    const { result } = renderHookWithProviders(() =>
      useCopyPasteWorkflowState(options),
    );
    await waitFor(() => expect(result.current.isPreparing).toBe(false));

    act(() => {
      result.current.setStep("paste");
      result.current.setRawResponse("invalid response");
    });
    await act(async () => {
      await result.current.validateResponse();
    });

    expect(result.current.step).toBe("paste");
    expect(result.current.rawResponse).toBe("invalid response");
    expect(result.current.previewData).toBeNull();
    expect(result.current.error).toBe(PREVIEW_ERROR);
  });

  it("applies reviewed data, reports the result, and closes", async () => {
    const options = createOptions();
    const { result } = renderHookWithProviders(() =>
      useCopyPasteWorkflowState(options),
    );
    await waitFor(() => expect(result.current.isPreparing).toBe(false));

    act(() => {
      result.current.setRawResponse('{"score":82}');
    });
    await act(async () => {
      await result.current.validateResponse();
    });
    await waitFor(() => {
      expect(result.current.previewData).toEqual({ score: 82 });
    });
    await act(async () => {
      await result.current.applyResult();
    });

    expect(options.apply).toHaveBeenCalledWith({ score: 82 });
    expect(options.onApplied).toHaveBeenCalledWith({ id: "result-1" });
    expect(options.onClose).toHaveBeenCalledOnce();
    expect(result.current.error).toBeNull();
  });

  it("surfaces apply errors and leaves the workflow open", async () => {
    const options = createOptions();
    options.apply.mockRejectedValue(new Error(APPLY_ERROR));
    const { result } = renderHookWithProviders(() =>
      useCopyPasteWorkflowState(options),
    );
    await waitFor(() => expect(result.current.isPreparing).toBe(false));

    act(() => {
      result.current.setRawResponse('{"score":82}');
    });
    await act(async () => {
      await result.current.validateResponse();
    });
    await waitFor(() => {
      expect(result.current.previewData).toEqual({ score: 82 });
    });
    await act(async () => {
      await result.current.applyResult();
    });

    expect(options.onApplied).not.toHaveBeenCalled();
    expect(options.onClose).not.toHaveBeenCalled();
    expect(result.current.error).toBe(APPLY_ERROR);
  });
});
