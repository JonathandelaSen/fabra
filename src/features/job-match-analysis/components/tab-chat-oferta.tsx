"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { useJobMatchOfferChat } from "../hooks/use-job-match-offer-chat";
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
  const { locale } = useInterfaceLanguage();
  const timeLocale = locale === "es" ? "es-ES" : "en-US";
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const focusComposer = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  const chat = useJobMatchOfferChat({
    analysisId,
    aiProvider,
    aiApiKey,
    aiModel,
    hasAIApiKey,
    focusComposer,
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
      className="flex h-[calc(100dvh-280px)] min-h-[400px] overflow-hidden rounded-2xl border border-line bg-panel-base"
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
        <ChatHeader />

        <ChatMessagesArea
          isLoading={chat.isLoadingConversations || chat.isLoadingMessages}
          activeConversationId={chat.activeConversationId}
          messages={chat.messages}
          isSending={chat.isSending}
          formatTime={formatTime}
          scrollRef={scrollRef}
          onNewConversation={chat.createConversation}
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
          textareaRef={textareaRef}
          isSending={chat.isSending}
          isPreparingCopyPaste={chat.isPreparingCopyPaste}
          hasAIApiKey={hasAIApiKey}
          provider={chat.provider}
          onProviderChange={chat.setProvider}
          model={chat.model}
          aiModel={aiModel}
          onModelChange={chat.setModel}
          onSubmit={chat.handleSubmit}
          onOpenCopyPasteFlow={() => void chat.openCopyPasteFlow()}
        />
      </div>

      <OfferChatCopyPasteModal
        isOpen={chat.isCopyPasteOpen}
        isApplying={chat.isApplyingCopyPaste}
        prompt={chat.copyPastePrompt}
        privacyNotice={chat.copyPastePrivacyNotice}
        onClose={() => chat.setIsCopyPasteOpen(false)}
        onApplyText={chat.applyCopyPasteText}
      />
    </motion.div>
  );
}
