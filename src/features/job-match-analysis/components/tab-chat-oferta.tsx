"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type {
  AnalysisChatConversation,
  AnalysisChatMessage,
} from "../types";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { ConversationList } from "./conversation-list";
import { ChatHeader } from "./chat-header";
import { ChatMessagesArea } from "@/components/shared/chat/chat-messages-area";
import { ChatInput } from "./chat-input";
import { OfferChatCopyPasteModal } from "./offer-chat-copy-paste-modal";

interface TabChatOfertaProps {
  analysisId: string;
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
}

export default function TabChatOferta({
  analysisId,
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
}: TabChatOfertaProps) {
  const t = useTranslations("analysisDetail.chat");
  const { locale } = useInterfaceLanguage();
  const timeLocale = locale === "es" ? "es-ES" : "en-US";
  const [conversations, setConversations] = useState<
    AnalysisChatConversation[]
  >([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<AnalysisChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState("gemini-3.1-pro-preview");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);
  const [copyPastePrompt, setCopyPastePrompt] = useState("");
  const [copyPastePrivacyNotice, setCopyPastePrivacyNotice] = useState("");
  const [isPreparingCopyPaste, setIsPreparingCopyPaste] = useState(false);
  const [isApplyingCopyPaste, setIsApplyingCopyPaste] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const res = await fetch(`/api/job-match-analyses/${analysisId}/chat`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error || t("loadConversationsFailed"));
      const convs = (data.conversations ?? []) as AnalysisChatConversation[];
      setConversations(convs);
      setActiveConversationId((prev) =>
        prev ? prev : convs.length > 0 ? convs[0].id : null,
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
        const res = await fetch(
          `/api/job-match-analyses/${analysisId}/chat?conversationId=${conversationId}`,
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || t("loadMessagesFailed"));
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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isSending]);

  const createConversation = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/job-match-analyses/${analysisId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_conversation" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("createConversationFailed"));
      const conv = data.conversation as AnalysisChatConversation;
      setConversations((prev) => [conv, ...prev]);
      setActiveConversationId(conv.id);
      setMessages([]);
      textareaRef.current?.focus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("createConversationFailed"),
      );
    }
  };

  const renameConversation = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/job-match-analyses/${analysisId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rename_conversation",
          conversationId: id,
          title,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      const updated = data.conversation as AnalysisChatConversation;
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      // silently fail rename
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/job-match-analyses/${analysisId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_conversation",
          conversationId: id,
        }),
      });
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (activeConversationId === id) {
          setActiveConversationId(next[0]?.id ?? null);
        }
        return next;
      });
    } catch {
      // silently fail delete
    }
  };

  const ensureConversation = async () => {
    if (activeConversationId) return activeConversationId;

    const res = await fetch(`/api/job-match-analyses/${analysisId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_conversation" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || t("createConversationFailed"));
    const conv = data.conversation as AnalysisChatConversation;
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(conv.id);
    return conv.id;
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = draft.trim();
    if (!message || isSending) return;
    if (!hasAIApiKey) {
      setError(t("missingApiKey"));
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const conversationId = await ensureConversation();
      const res = await fetch(`/api/job-match-analyses/${analysisId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          provider: aiProvider,
          apiKey: aiApiKey,
          model: model || aiModel,
          conversationId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error || t("sendFailed"));
      setMessages((current) => [
        ...current,
        data.userMessage,
        data.assistantMessage,
      ]);
      setDraft("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("sendFailed"),
      );
    } finally {
      setIsSending(false);
    }
  };

  const openCopyPasteFlow = async () => {
    const message = draft.trim();
    if (!message || isPreparingCopyPaste) return;

    setIsPreparingCopyPaste(true);
    setError(null);
    try {
      const conversationId = await ensureConversation();
      const res = await fetch(
        `/api/job-match-analyses/${analysisId}/chat/copy-paste/prepare`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, message }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("copyPaste.prepareFailed"));
      }
      setCopyPastePrompt(data.prompt ?? "");
      setCopyPastePrivacyNotice(data.privacyNotice ?? t("copyPaste.privacyNotice"));
      setIsCopyPasteOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("copyPaste.prepareFailed"),
      );
    } finally {
      setIsPreparingCopyPaste(false);
    }
  };

  const applyCopyPasteText = async (assistantResponse: string) => {
    const message = draft.trim();
    if (!message || !activeConversationId || isApplyingCopyPaste) return;

    setIsApplyingCopyPaste(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/job-match-analyses/${analysisId}/chat/copy-paste/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: activeConversationId,
            userMessage: message,
            assistantResponse,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("copyPaste.applyFailed"));
      setMessages((current) => [
        ...current,
        data.userMessage,
        data.assistantMessage,
      ]);
      setDraft("");
      setIsCopyPasteOpen(false);
      setCopyPastePrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("copyPaste.applyFailed"));
    } finally {
      setIsApplyingCopyPaste(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(timeLocale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex h-[calc(100dvh-280px)] min-h-[400px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a12]"
    >
      <ConversationList
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={createConversation}
        onRename={renameConversation}
        onDelete={deleteConversation}
      />

      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <ChatHeader />

        <ChatMessagesArea
          isLoading={isLoadingConversations || isLoadingMessages}
          activeConversationId={activeConversationId}
          messages={messages}
          isSending={isSending}
          formatTime={formatTime}
          scrollRef={scrollRef}
          onNewConversation={createConversation}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4"
            >
              <p className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <ChatInput
          draft={draft}
          onDraftChange={setDraft}
          textareaRef={textareaRef}
          isSending={isSending}
          isPreparingCopyPaste={isPreparingCopyPaste}
          hasAIApiKey={hasAIApiKey}
          model={model}
          aiModel={aiModel}
          onModelChange={setModel}
          onSubmit={handleSubmit}
          onOpenCopyPasteFlow={() => void openCopyPasteFlow()}
        />
      </div>

      <OfferChatCopyPasteModal
        isOpen={isCopyPasteOpen}
        isApplying={isApplyingCopyPaste}
        prompt={copyPastePrompt}
        privacyNotice={copyPastePrivacyNotice}
        onClose={() => setIsCopyPasteOpen(false)}
        onApplyText={applyCopyPasteText}
      />
    </motion.div>
  );
}
