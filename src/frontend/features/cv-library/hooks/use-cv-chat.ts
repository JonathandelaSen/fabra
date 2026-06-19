"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";
import {
  createCVChatConversation,
  deleteCVChatConversation,
  listCVChatConversations,
  listCVChatMessages,
  renameCVChatConversation,
  sendCVChatMessage,
} from "../api/cv-library-chat-api";
import type { CVChatConversation, CVChatMessage } from "../components/detail/cv-chat-types";
import type { CVChatMessageResponse } from "@/app/api/cvs/[id]/chat/responses";

import { getAIRequestConfigForProvider, type StoredAIProvider } from "@/lib/browser-preferences";
import { useErrorMessage } from "@/frontend/utils/errors/use-error-message";

function toCVChatMessage(message: CVChatMessageResponse): CVChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    created_at: message.createdAt,
  };
}
interface UseCVChatParams {
  cvId: string;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  focusInput: () => void;
}

export function useCVChat({
  cvId,
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  focusInput,
}: UseCVChatParams) {
  const t = useTranslations("analysisFlow.cvLibrary.chat");
  const getErrorMessage = useErrorMessage();
  const [conversations, setConversations] = useState<
    CVChatConversation[]
  >([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<CVChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [provider, setProvider] = useState<StoredAIProvider>(aiProvider);
  const [model, setModel] = useState<string>(aiModel || DEFAULT_GEMINI_MODEL);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(async () => {
    setError(null);
    try {
      const { conversation } = await createCVChatConversation(
        cvId,
        t("createConversationFailed"),
      );
      setConversations((current) => [conversation, ...current]);
      setActiveConversationId(conversation.id);
      setMessages([]);
      focusInput();
      return conversation;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, [cvId, focusInput, t]);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const { conversations: nextConversations } = await listCVChatConversations(
        cvId,
        t("loadConversationsFailed"),
      );
      setConversations(nextConversations);
      setActiveConversationId((current) => current ?? nextConversations[0]?.id ?? null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoadingConversations(false);
    }
  }, [cvId, t]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      setError(null);
      try {
        const { messages: nextMessages } = await listCVChatMessages(
          cvId,
          conversationId,
          t("loadMessagesFailed"),
        );
        setMessages(nextMessages.map(toCVChatMessage));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [cvId, t],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadConversations]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (activeConversationId) {
        void loadMessages(activeConversationId);
      } else {
        setMessages([]);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeConversationId, loadMessages]);

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      try {
        const { conversation: updated } = await renameCVChatConversation(
          cvId,
          id,
          title,
        );
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === id ? updated : conversation,
          ),
        );
      } catch {
        // Rename failures are non-blocking; the previous title remains visible.
      }
    },
    [cvId],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteCVChatConversation(cvId, id);
        setConversations((current) => {
          const next = current.filter((conversation) => conversation.id !== id);
          if (activeConversationId === id) {
            setActiveConversationId(next[0]?.id ?? null);
          }
          return next;
        });
      } catch {
        // Delete failures are non-blocking; the conversation remains visible.
      }
    },
    [activeConversationId, cvId],
  );

  const sendMessage = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      const message = draft.trim();
      if (!message || isSending) return;
      const resolvedProvider = provider || aiProvider;
      const aiConfig = getAIRequestConfigForProvider(resolvedProvider, aiApiKey, model || aiModel);
      if (aiConfig.error) {
        setError(aiConfig.error);
        return;
      }

      const conversation =
        activeConversationId ?? (await createConversation())?.id;
      if (!conversation) return;

      setIsSending(true);
      setError(null);
      try {
        const response = await sendCVChatMessage(
          cvId,
          {
            message,
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            baseUrl: aiConfig.baseUrl,
            model: aiConfig.model,
            conversationId: conversation,
          },
          t("sendFailed"),
        );
        setMessages((current) => [
          ...current,
          toCVChatMessage(response.userMessage),
          toCVChatMessage(response.assistantMessage),
        ]);
        setDraft("");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsSending(false);
      }
    },
    [
      activeConversationId,
      aiApiKey,
      aiModel,
      provider,
      cvId,
      createConversation,
      draft,
      hasAIApiKey,
      isSending,
      model,
      t,
    ],
  );

  return {
    conversations,
    activeConversationId,
    messages,
    draft,
    provider,
    model,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    error,
    setActiveConversationId,
    setDraft,
    setProvider,
    setModel,
    createConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
  };
}
