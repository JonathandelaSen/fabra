import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/testing/render";
import { useSelfAssessmentCopyPaste } from "./use-self-assessment-copy-paste";

describe("useSelfAssessmentCopyPaste", () => {
  it("prepares only once when callback identities change", async () => {
    const prepare = vi.fn().mockResolvedValue({
      workflowId: "self-assessment",
      schemaVersion: "1",
      prompt: "prompt",
      privacyNotice: "notice",
    });
    const { rerender } = renderHookWithProviders(
      () =>
        useSelfAssessmentCopyPaste({
          onPrepare: () => prepare(),
          onApply: vi.fn(),
          onClose: vi.fn(),
        }),
    );

    rerender();
    rerender();

    await waitFor(() => expect(prepare).toHaveBeenCalledOnce());
  });
});
