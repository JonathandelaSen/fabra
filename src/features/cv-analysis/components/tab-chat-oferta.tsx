"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { ChatMessagesArea } from "@/components/shared/chat/chat-messages-area";
import { useAnalysisChat } from "../hooks/use-analysis-chat";
import { ConversationList } from "./conversation-list";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";

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
  const { locale } = useInterfaceLanguage();
  const timeLocale = locale === "es" ? "es-ES" : "en-US";
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chat = useAnalysisChat({
    analysisId,
    aiProvider,
    aiApiKey,
    aiModel,
    hasAIApiKey,
    focusInput: () => textareaRef.current?.focus(),
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages.length, chat.isSending]);

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
        conversations={chat.conversations}
        activeId={chat.activeConversationId}
        onSelect={chat.setActiveConversationId}
        onNew={chat.createConversation}
        onRename={chat.renameConversation}
        onDelete={chat.deleteConversation}
      />

      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        <ChatHeader model={chat.model} onModelChange={chat.setModel} />

        <ChatMessagesArea
          messages={chat.messages}
          isLoading={chat.isLoadingConversations || chat.isLoadingMessages}
          isSending={chat.isSending}
          activeConversationId={chat.activeConversationId}
          onNewConversation={chat.createConversation}
          formatTime={formatTime}
          scrollRef={scrollRef}
        />

        <AnimatePresence>
          {chat.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4"
            >
              <p className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs text-red-400">
                {chat.error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <ChatInput
          draft={chat.draft}
          onDraftChange={chat.setDraft}
          isSending={chat.isSending}
          onSubmit={chat.sendMessage}
          textareaRef={textareaRef}
        />
      </div>
    </motion.div>
  );
}
