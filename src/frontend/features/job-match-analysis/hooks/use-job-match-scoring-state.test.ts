import { act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useJobMatchScoringState } from "./use-job-match-scoring-state";
import { renderHookWithProviders } from "@/testing/render";

const MISSING_API_KEY_MESSAGE =
  "Configure your Gemini API key before launching analysis.";

describe("useJobMatchScoringState", () => {
  it("does not trigger the paid AI call when no API key is configured", async () => {
    const onScore = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHookWithProviders(() =>
      useJobMatchScoringState({ onScore, hasAIApiKey: false }),
    );

    await act(async () => {
      await result.current.handleJobMatchAnalysis(
        "Senior engineer",
        "https://jobs.example/1",
        "gemini",
        "gemini-3.5-flash",
      );
    });

    expect(onScore).not.toHaveBeenCalled();
    expect(result.current.aiError).toBe(MISSING_API_KEY_MESSAGE);
    expect(result.current.loadingAI).toBe(false);
  });

  it("forwards the offer input to onScore and clears any previous error on success", async () => {
    const onScore = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHookWithProviders(() =>
      useJobMatchScoringState({ onScore, hasAIApiKey: true }),
    );

    await act(async () => {
      await result.current.handleJobMatchAnalysis(
        "Senior engineer",
        "https://jobs.example/1",
        "gemini",
        "gemini-3.5-flash",
      );
    });

    expect(onScore).toHaveBeenCalledWith({
      jobDescription: "Senior engineer",
      jobUrl: "https://jobs.example/1",
      provider: "gemini",
      model: "gemini-3.5-flash",
    });
    expect(result.current.aiError).toBeNull();
    expect(result.current.loadingAI).toBe(false);
  });

  it("surfaces loading while scoring is in flight and resets it afterwards", async () => {
    let resolveScore: (() => void) | undefined;
    const onScore = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveScore = resolve;
        }),
    );
    const { result } = renderHookWithProviders(() =>
      useJobMatchScoringState({ onScore, hasAIApiKey: true }),
    );

    let pending: Promise<void>;
    act(() => {
      pending = result.current.handleJobMatchAnalysis(
        "Senior engineer",
        "",
        "gemini",
        "gemini-3.5-flash",
      );
    });

    await waitFor(() => expect(result.current.loadingAI).toBe(true));

    await act(async () => {
      resolveScore?.();
      await pending;
    });

    expect(result.current.loadingAI).toBe(false);
  });

  it("captures the error message and stops loading when scoring throws", async () => {
    const onScore = vi
      .fn()
      .mockRejectedValue(new Error("Gemini rejected the request"));
    const { result } = renderHookWithProviders(() =>
      useJobMatchScoringState({ onScore, hasAIApiKey: true }),
    );

    await act(async () => {
      await result.current.handleJobMatchAnalysis(
        "Senior engineer",
        "",
        "gemini",
        "gemini-3.5-flash",
      );
    });

    expect(result.current.aiError).toBe("Gemini rejected the request");
    expect(result.current.loadingAI).toBe(false);
  });

  it("opens the copy/paste panel with the current offer description and url", () => {
    const onScore = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useJobMatchScoringState({ onScore, hasAIApiKey: false }),
    );

    act(() => {
      result.current.openCopyPaste("Pasted JD", "https://jobs.example/2");
    });

    expect(result.current.copyPasteOpen).toBe(true);
    expect(result.current.copyPasteJobDescription).toBe("Pasted JD");
    expect(result.current.copyPasteJobUrl).toBe("https://jobs.example/2");

    act(() => {
      result.current.closeCopyPaste();
    });

    expect(result.current.copyPasteOpen).toBe(false);
  });
});
