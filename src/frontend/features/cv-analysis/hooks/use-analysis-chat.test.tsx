import { act, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { server } from "@/frontend/testing/msw/server";
import { useAnalysisChat } from "./use-analysis-chat";

const ANALYSIS_ID = "analysis-1";
const CONVERSATION_ID = "conversation-1";
const SECOND_CONVERSATION_ID = "conversation-2";
const USER_MESSAGE = "How should I position my experience?";
const ASSISTANT_MESSAGE = "Lead with your platform ownership.";
const chatMessages = getMessages("en").analysisDetail.chat;

function conversation(id = CONVERSATION_ID, title = "Platform positioning") {
  return {
    id,
    analysis_id: ANALYSIS_ID,
    title,
    messages: [],
  };
}

function conversationView(id = CONVERSATION_ID, title = "Platform positioning") {
  return {
    id,
    analysisId: ANALYSIS_ID,
    title,
    messages: [],
  };
}

function message(
  id: string,
  role: "user" | "assistant",
  content: string,
) {
  return {
    id,
    role,
    content,
    created_at: "2026-06-07T10:00:00.000Z",
  };
}

function renderChat(focusInput = vi.fn()) {
  return {
    focusInput,
    ...renderHookWithProviders(() =>
      useAnalysisChat({
        analysisId: ANALYSIS_ID,
        aiProvider: "mock",
        aiApiKey: "",
        aiModel: "mock",
        hasAIApiKey: false,
        focusInput,
      }),
    ),
  };
}

describe("useAnalysisChat", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads conversations, selects the first one, and loads its messages", async () => {
    const initialMessages = [
      message("message-1", "assistant", ASSISTANT_MESSAGE),
    ];
    server.use(
      http.get(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get("conversationId") === CONVERSATION_ID) {
            return HttpResponse.json({ messages: initialMessages });
          }
          return HttpResponse.json({
            conversations: [conversation(), conversation(SECOND_CONVERSATION_ID)],
          });
        },
      ),
    );

    const { result } = renderChat();

    await waitFor(() => {
      expect(result.current.isLoadingConversations).toBe(false);
      expect(result.current.activeConversationId).toBe(CONVERSATION_ID);
    });
    await waitFor(() => {
      expect(result.current.messages).toEqual(initialMessages);
    });
  });

  it("creates and activates a conversation while focusing the composer", async () => {
    server.use(
      http.get(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        () => HttpResponse.json({ conversations: [] }),
      ),
      http.post(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        async ({ request }) => {
          const body = (await request.json()) as { action?: string };
          if (body.action === "create_conversation") {
            return HttpResponse.json({ conversation: conversation() });
          }
          return HttpResponse.json({});
        },
      ),
    );
    const { focusInput, result } = renderChat();
    await waitFor(() => expect(result.current.isLoadingConversations).toBe(false));

    let created: unknown;
    await act(async () => {
      created = await result.current.createConversation();
    });

    expect(created).toEqual(conversationView());
    expect(result.current.conversations).toEqual([conversationView()]);
    expect(result.current.activeConversationId).toBe(CONVERSATION_ID);
    expect(result.current.messages).toEqual([]);
    expect(focusInput).toHaveBeenCalledOnce();
  });

  it("creates a conversation when needed and appends both sent messages", async () => {
    const sentUserMessage = message("message-user", "user", USER_MESSAGE);
    const sentAssistantMessage = message(
      "message-assistant",
      "assistant",
      ASSISTANT_MESSAGE,
    );
    server.use(
      http.get(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        () => HttpResponse.json({ conversations: [] }),
      ),
      http.post(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        async ({ request }) => {
          const body = (await request.json()) as {
            action?: string;
            message?: string;
            provider?: string;
            conversationId?: string;
          };
          if (body.action === "create_conversation") {
            return HttpResponse.json({ conversation: conversation() });
          }
          expect(body).toMatchObject({
            message: USER_MESSAGE,
            provider: "mock",
            conversationId: CONVERSATION_ID,
          });
          return HttpResponse.json({
            userMessage: sentUserMessage,
            assistantMessage: sentAssistantMessage,
          });
        },
      ),
    );
    const { result } = renderChat();
    await waitFor(() => expect(result.current.isLoadingConversations).toBe(false));

    act(() => {
      result.current.setProvider("mock");
      result.current.setModel("mock");
      result.current.setDraft(`  ${USER_MESSAGE}  `);
    });
    await act(async () => {
      await result.current.sendMessage({
        preventDefault: vi.fn(),
      } as never);
    });

    expect(result.current.messages).toEqual([
      sentUserMessage,
      sentAssistantMessage,
    ]);
    expect(result.current.draft).toBe("");
    expect(result.current.error).toBeNull();
  });

  it("does not send blank drafts or messages with invalid provider configuration", async () => {
    const postRequest = vi.fn();
    server.use(
      http.get(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        () => HttpResponse.json({ conversations: [] }),
      ),
      http.post(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        () => {
          postRequest();
          return HttpResponse.json({});
        },
      ),
    );
    const { result } = renderChat();
    await waitFor(() => expect(result.current.isLoadingConversations).toBe(false));

    await act(async () => {
      await result.current.sendMessage({
        preventDefault: vi.fn(),
      } as never);
    });
    expect(postRequest).not.toHaveBeenCalled();

    act(() => {
      result.current.setProvider("gemini");
      result.current.setDraft(USER_MESSAGE);
    });
    await act(async () => {
      await result.current.sendMessage({
        preventDefault: vi.fn(),
      } as never);
    });

    expect(postRequest).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });

  it("deletes the active conversation and selects the next one", async () => {
    server.use(
      http.get(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.has("conversationId")) {
            return HttpResponse.json({ messages: [] });
          }
          return HttpResponse.json({
            conversations: [conversation(), conversation(SECOND_CONVERSATION_ID)],
          });
        },
      ),
      http.post(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        async ({ request }) => {
          const body = (await request.json()) as { action?: string };
          expect(body.action).toBe("delete_conversation");
          return HttpResponse.json({ ok: true });
        },
      ),
    );
    const { result } = renderChat();
    await waitFor(() => {
      expect(result.current.activeConversationId).toBe(CONVERSATION_ID);
    });

    await act(async () => {
      await result.current.deleteConversation(CONVERSATION_ID);
    });

    expect(result.current.conversations).toEqual([
      conversationView(SECOND_CONVERSATION_ID),
    ]);
    expect(result.current.activeConversationId).toBe(SECOND_CONVERSATION_ID);
  });

  it("surfaces conversation loading failures", async () => {
    server.use(
      http.get(
        `http://localhost/api/job-match-analyses/${ANALYSIS_ID}/chat`,
        () =>
          HttpResponse.json(
            { error: chatMessages.loadConversationsFailed },
            { status: 500 },
          ),
      ),
    );

    const { result } = renderChat();

    await waitFor(() => {
      expect(result.current.isLoadingConversations).toBe(false);
      expect(result.current.error).toBe(chatMessages.loadConversationsFailed);
    });
  });
});
