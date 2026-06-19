"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";
import type {
  JobAnalysisChatConversation,
  JobAnalysisChatMessage,
} from "../types";
import {
  applyJobMatchOfferChatCopyPaste,
  createJobMatchOfferChatConversation,
  deleteJobMatchOfferChatConversation,
  listJobMatchOfferChatConversations,
  listJobMatchOfferChatMessages,
  prepareJobMatchOfferChatCopyPaste,
  renameJobMatchOfferChatConversation,
  sendJobMatchOfferChatMessage,
} from "../api/job-match-analysis-api";

import { getAIRequestConfigForProvider, type StoredAIProvider } from "@/lib/browser-preferences";

interface UseJobMatchOfferChatParams {
  analysisId: string;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  focusComposer: () => void;
}

export function useJobMatchOfferChat({
  analysisId,
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  focusComposer,
}: UseJobMatchOfferChatParams) {
  const t = useTranslations("analysisDetail.chat");
  const [conversations, setConversations] = useState<
    JobAnalysisChatConversation[]
  >([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<JobAnalysisChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [provider, setProvider] = useState<StoredAIProvider>("gemini");
  const [model, setModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);
  const [copyPastePrompt, setCopyPastePrompt] = useState("");
  const [copyPastePrivacyNotice, setCopyPastePrivacyNotice] = useState("");
  const [isPreparingCopyPaste, setIsPreparingCopyPaste] = useState(false);
  const [isApplyingCopyPaste, setIsApplyingCopyPaste] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const data = await listJobMatchOfferChatConversations(analysisId);
      const nextConversations = data.conversations ?? [];
      setConversations(nextConversations);
      setActiveConversationId((prev) =>
        prev ? prev : nextConversations[0]?.id ?? null,
      );
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
        const data = await listJobMatchOfferChatMessages({
          analysisId,
          conversationId,
        });
        setMessages(data.messages ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("loadMessagesFailed"),
        );
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

  const createConversation = useCallback(async () => {
    setError(null);
    try {
      const data = await createJobMatchOfferChatConversation(analysisId);
      const conversation = data.conversation;
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
      setMessages([]);
      focusComposer();
      return conversation.id;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("createConversationFailed"),
      );
      return null;
    }
  }, [analysisId, focusComposer, t]);

  const ensureConversation = useCallback(async () => {
    if (activeConversationId) return activeConversationId;

    const data = await createJobMatchOfferChatConversation(analysisId);
    const conversation = data.conversation;
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
    return conversation.id;
  }, [activeConversationId, analysisId]);

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      try {
        const data = await renameJobMatchOfferChatConversation({
          analysisId,
          conversationId: id,
          title,
        });
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === id ? data.conversation : conversation,
          ),
        );
      } catch {
        // Rename failures are non-blocking because the list keeps the prior title.
      }
    },
    [analysisId],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteJobMatchOfferChatConversation({
          analysisId,
          conversationId: id,
        });
        setConversations((prev) => {
          const next = prev.filter((conversation) => conversation.id !== id);
          if (activeConversationId === id) {
            setActiveConversationId(next[0]?.id ?? null);
          }
          return next;
        });
      } catch {
        // Delete failures are non-blocking because the existing row remains visible.
      }
    },
    [activeConversationId, analysisId],
  );

  const handleSubmit = useCallback(
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

      setIsSending(true);
      setError(null);
      try {
        const conversationId = await ensureConversation();
        const data = await sendJobMatchOfferChatMessage({
          analysisId,
          input: {
            message,
            provider: aiConfig.provider,
            apiKey: aiConfig.apiKey,
            baseUrl: aiConfig.baseUrl,
            model: aiConfig.model,
            conversationId,
          },
        });
        setMessages((current) => [
          ...current,
          data.userMessage,
          data.assistantMessage,
        ]);
        setDraft("");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("sendFailed"));
      } finally {
        setIsSending(false);
      }
    },
    [
      aiApiKey,
      aiModel,
      provider,
      analysisId,
      draft,
      ensureConversation,
      hasAIApiKey,
      isSending,
      model,
      t,
    ],
  );

  const openCopyPasteFlow = useCallback(async () => {
    const message = draft.trim();
    if (!message || isPreparingCopyPaste) return;

    setIsPreparingCopyPaste(true);
    setError(null);
    try {
      const conversationId = await ensureConversation();
      const data = await prepareJobMatchOfferChatCopyPaste({
        analysisId,
        input: { conversationId, message },
      });
      setCopyPastePrompt(data.prompt ?? "");
      setCopyPastePrivacyNotice(
        data.privacyNotice ?? t("copyPaste.privacyNotice"),
      );
      setIsCopyPasteOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("copyPaste.prepareFailed"),
      );
    } finally {
      setIsPreparingCopyPaste(false);
    }
  }, [analysisId, draft, ensureConversation, isPreparingCopyPaste, t]);

  const applyCopyPasteText = useCallback(
    async (assistantResponse: string) => {
      const message = draft.trim();
      if (!message || !activeConversationId || isApplyingCopyPaste) return;

      setIsApplyingCopyPaste(true);
      setError(null);
      try {
        const data = await applyJobMatchOfferChatCopyPaste({
          analysisId,
          input: {
            conversationId: activeConversationId,
            userMessage: message,
            assistantResponse,
          },
        });
        setMessages((current) => [
          ...current,
          data.userMessage,
          data.assistantMessage,
        ]);
        setDraft("");
        setIsCopyPasteOpen(false);
        setCopyPastePrompt("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("copyPaste.applyFailed"),
        );
      } finally {
        setIsApplyingCopyPaste(false);
      }
    },
    [activeConversationId, analysisId, draft, isApplyingCopyPaste, t],
  );

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    draft,
    setDraft,
    provider,
    setProvider,
    model,
    setModel,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    isCopyPasteOpen,
    setIsCopyPasteOpen,
    copyPastePrompt,
    copyPastePrivacyNotice,
    isPreparingCopyPaste,
    isApplyingCopyPaste,
    error,
    createConversation,
    renameConversation,
    deleteConversation,
    handleSubmit,
    openCopyPasteFlow,
    applyCopyPasteText,
  };
}
