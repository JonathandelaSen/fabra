"use client";

import type { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Bot, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./chat-bubble";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatEmptyChat } from "./chat-empty-chat";
import type { ChatMessage } from "./chat-types";

interface ChatMessagesAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  activeConversationId: string | null;
  onNewConversation: () => void;
  formatTime: (d: string) => string;
  scrollRef: RefObject<HTMLDivElement | null>;
  labels?: {
    loading: string;
    thinking: string;
    emptyState: { title: string; description: string; newConversation: string };
    emptyChat: { title: string; description: string };
  };
}

export function ChatMessagesArea({
  messages,
  isLoading,
  isSending,
  activeConversationId,
  onNewConversation,
  formatTime,
  scrollRef,
  labels,
}: ChatMessagesAreaProps) {
  const t = useTranslations("analysisDetail.chat");

  return (
    <ScrollArea className="min-w-0 flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-col gap-1 p-3 sm:p-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20 text-sm text-zinc-600">
            <Loader2 className="mr-2 size-4 animate-spin" />
            {labels?.loading ?? t("loading")}
          </div>
        ) : !activeConversationId ? (
          <ChatEmptyState onNew={onNewConversation} labels={labels?.emptyState} />
        ) : messages.length === 0 && !isSending ? (
          <ChatEmptyChat labels={labels?.emptyChat} />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatBubble message={msg} formatTime={formatTime} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 py-2"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <Bot className="size-3.5" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-panel-subtle px-4 py-2.5 text-sm text-text-muted">
              <Loader2 className="size-3.5 animate-spin" />
              {labels?.thinking ?? t("thinking")}
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
