"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import {
  createAnalysisChatConversation,
  deleteAnalysisChatConversation,
  listAnalysisChatConversations,
  listAnalysisChatMessages,
  renameAnalysisChatConversation,
  sendAnalysisChatMessage,
} from "../api/cv-analysis-chat-api";
import type { AnalysisChatConversation, AnalysisChatMessage } from "../components/detail/chat/chat-types";
import type { ListOfferChatConversationsResponse } from "@/app/api/job-match-analyses/[id]/chat/responses";

import { getAIRequestConfigForProvider, type StoredAIProvider } from "@/lib/browser-preferences";

type OfferChatConversation =
  ListOfferChatConversationsResponse["conversations"][number];

function toAnalysisChatConversation(
  conversation: OfferChatConversation,
): AnalysisChatConversation {
  return {
    id: conversation.id,
    analysisId: conversation.analysis_id,
    title: conversation.title,
    messages: [],
  };
}
interface UseAnalysisChatParams {
  analysisId: string;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  focusInput: () => void;
}

export function useAnalysisChat({
  analysisId,
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  focusInput,
}: UseAnalysisChatParams) {
  const t = useTranslations("analysisDetail.chat");
  const [conversations, setConversations] = useState<
    AnalysisChatConversation[]
  >([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<AnalysisChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [provider, setProvider] = useState<StoredAIProvider>("gemini");
  const [model, setModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(async () => {
    setError(null);
    try {
      const { conversation } = await createAnalysisChatConversation(
        analysisId,
        t("createConversationFailed"),
      );
      const mapped = toAnalysisChatConversation(conversation);
      setConversations((current) => [mapped, ...current]);
      setActiveConversationId(mapped.id);
      setMessages([]);
      focusInput();
      return mapped;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("createConversationFailed"),
      );
      return null;
    }
  }, [analysisId, focusInput, t]);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const { conversations } = await listAnalysisChatConversations(
        analysisId,
        t("loadConversationsFailed"),
      );
      const nextConversations = conversations.map(toAnalysisChatConversation);
      setConversations(nextConversations);
      setActiveConversationId((current) => current ?? nextConversations[0]?.id ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("loadConversationsFailed"),
      );
    } finally {
      setIsLoadingConversations(false);
    }
  }, [analysisId, t]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      setError(null);
      try {
        const { messages: nextMessages } = await listAnalysisChatMessages(
          analysisId,
          conversationId,
          t("loadMessagesFailed"),
        );
        setMessages(nextMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("loadMessagesFailed"));
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [analysisId, t],
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
        const { conversation: updated } = await renameAnalysisChatConversation(
          analysisId,
          id,
          title,
        );
        const mapped = toAnalysisChatConversation(updated);
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === id
              ? { ...mapped, messages: conversation.messages }
              : conversation,
          ),
        );
      } catch {
        // Rename failures are non-blocking; the previous title remains visible.
      }
    },
    [analysisId],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteAnalysisChatConversation(analysisId, id);
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
    [activeConversationId, analysisId],
  );

  const sendMessage = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
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
        const response = await sendAnalysisChatMessage(
          analysisId,
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
          response.userMessage,
          response.assistantMessage,
        ]);
        setDraft("");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("sendFailed"));
      } finally {
        setIsSending(false);
      }
    },
    [
      activeConversationId,
      aiApiKey,
      aiModel,
      provider,
      analysisId,
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
