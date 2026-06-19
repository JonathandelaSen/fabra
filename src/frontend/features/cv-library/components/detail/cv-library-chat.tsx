"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInterfaceLanguage } from "@/frontend/components/shared/i18n-provider";
import { ChatMessagesArea } from "@/frontend/components/shared/chat/chat-messages-area";
import { useCVChat } from "../../hooks/use-cv-chat";
import { ConversationList } from "./cv-chat-conversation-list";
import { ChatInput } from "./cv-chat-input";
import {
  getStoredAIApiKey,
  getStoredAIModel,
  getStoredAIProvider,
} from "@/frontend/utils/browser-preferences";
import { useTranslations } from "next-intl";

interface CVLibraryChatProps {
  cvId: string;
}

export default function CVLibraryChat({ cvId }: CVLibraryChatProps) {
  const t = useTranslations("analysisFlow.cvLibrary.chat");
  const aiProvider = getStoredAIProvider();
  const aiApiKey = getStoredAIApiKey();
  const aiModel = getStoredAIModel();
  const { locale } = useInterfaceLanguage();
  const timeLocale = locale === "es" ? "es-ES" : "en-US";
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chat = useCVChat({
    cvId,
    aiProvider,
    aiApiKey,
    aiModel,
    hasAIApiKey: true,
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
      className="flex h-[calc(100dvh-260px)] min-h-[460px] min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-panel-base md:flex-row"
    >
      <ConversationList
        conversations={chat.conversations}
        activeId={chat.activeConversationId}
        onSelect={chat.setActiveConversationId}
        onNew={chat.createConversation}
        onRename={chat.renameConversation}
        onDelete={chat.deleteConversation}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatMessagesArea
          messages={chat.messages}
          isLoading={chat.isLoadingConversations || chat.isLoadingMessages}
          isSending={chat.isSending}
          activeConversationId={chat.activeConversationId}
          onNewConversation={chat.createConversation}
          formatTime={formatTime}
          scrollRef={scrollRef}
          labels={{
            loading: t("loading"),
            thinking: t("thinking"),
            emptyState: {
              title: t("startTitle"),
              description: t("startDescription"),
              newConversation: t("newConversation"),
            },
            emptyChat: {
              title: t("firstQuestion"),
              description: t("firstQuestionDescription"),
            },
          }}
        />

        <AnimatePresence>
          {chat.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4"
            >
              <p className="rounded-lg border border-danger-border bg-danger/[0.06] px-3 py-2 text-xs text-danger-text">
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
          hasAIApiKey
          provider={chat.provider}
          onProviderChange={chat.setProvider}
          model={chat.model}
          aiModel={aiModel}
          onModelChange={chat.setModel}
        />
      </div>
    </motion.div>
  );
}
