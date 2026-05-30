"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { ConversationList } from "./conversation-list";
import { ChatHeader } from "./chat-header";
import { ChatMessagesArea } from "@/components/shared/chat/chat-messages-area";
import { ChatInput } from "./chat-input";
import type { AnalysisChatConversation, AnalysisChatMessage } from "./chat-types";

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
  const [model, setModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
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
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("loadConversationsFailed"),
      );
    } finally {
      setIsLoadingConversations(false);
    }
  }, [analysisId, activeConversationId, t]);

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || isSending) return;
    if (!hasAIApiKey) {
      setError(t("missingApiKey"));
      return;
    }

    let conversationId = activeConversationId;

    if (!conversationId) {
      try {
        const res = await fetch(`/api/job-match-analyses/${analysisId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_conversation" }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(data.error || t("createConversationFailed"));
        const conv = data.conversation as AnalysisChatConversation;
        setConversations((prev) => [conv, ...prev]);
        setActiveConversationId(conv.id);
        conversationId = conv.id;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("createConversationFailed"),
        );
        return;
      }
    }

    setIsSending(true);
    setError(null);
    try {
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
        <ChatHeader model={model} onModelChange={setModel} />

        <ChatMessagesArea
          messages={messages}
          isLoading={isLoadingConversations || isLoadingMessages}
          isSending={isSending}
          activeConversationId={activeConversationId}
          onNewConversation={createConversation}
          formatTime={formatTime}
          scrollRef={scrollRef}
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
          isSending={isSending}
          onSubmit={handleSubmit}
          textareaRef={textareaRef}
        />
      </div>
    </motion.div>
  );
}
