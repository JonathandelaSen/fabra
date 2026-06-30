import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/frontend/testing/render";
import { useJobMatchOfferChat } from "./use-job-match-offer-chat";

vi.mock("../api/job-match-analysis-api", () => ({
  listJobMatchOfferChatConversations: vi.fn(async () => ({ conversations: [] })),
  listJobMatchOfferChatMessages: vi.fn(async () => ({ messages: [] })),
  createJobMatchOfferChatConversation: vi.fn(),
  renameJobMatchOfferChatConversation: vi.fn(),
  deleteJobMatchOfferChatConversation: vi.fn(),
  sendJobMatchOfferChatMessage: vi.fn(),
  prepareJobMatchOfferChatCopyPaste: vi.fn(),
  applyJobMatchOfferChatCopyPaste: vi.fn(),
}));

describe("useJobMatchOfferChat draft requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies a new prepared-conversation draft once without overwriting edits", async () => {
    const focusComposer = vi.fn();
    const { result, rerender } = renderHookWithProviders(
      ({ request }: { request: { id: number; text: string } | null }) =>
        useJobMatchOfferChat({
          analysisId: "analysis-1",
          aiProvider: "mock",
          aiApiKey: "",
          aiModel: "mock-model",
          focusComposer,
          draftRequest: request,
        }),
      {
        initialProps: {
          request: {
            id: 1,
            text: "Help me prepare my conversation with Marta.",
          },
        },
      },
    );

    await waitFor(() =>
      expect(result.current.draft).toBe(
        "Help me prepare my conversation with Marta.",
      ),
    );
    expect(focusComposer).toHaveBeenCalledOnce();

    act(() => result.current.setDraft("My edited draft"));
    rerender({
      request: {
        id: 1,
        text: "Help me prepare my conversation with Marta.",
      },
    });
    expect(result.current.draft).toBe("My edited draft");
  });
});
