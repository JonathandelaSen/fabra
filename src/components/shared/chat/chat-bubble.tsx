"use client";

import { Bot, UserRound } from "lucide-react";
import { ChatMarkdown } from "./chat-markdown";
import type { ChatMessage } from "./chat-types";

interface ChatBubbleProps {
  message: ChatMessage;
  formatTime: (d: string) => string;
}

export function ChatBubble({ message, formatTime }: ChatBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex gap-3 py-2 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
          isAssistant
            ? "bg-cyan-500/10 text-cyan-400"
            : "bg-panel-control text-text-muted"
        }`}
      >
        {isAssistant ? (
          <Bot className="size-3.5" />
        ) : (
          <UserRound className="size-3.5" />
        )}
      </div>
      <div
        className={`max-w-[80%] min-w-0 ${
          isAssistant ? "" : "flex flex-col items-end"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAssistant
              ? "rounded-tl-md bg-panel-subtle text-text-soft"
              : "rounded-tr-md bg-cyan-500/10 text-text-main"
          }`}
        >
          {isAssistant ? (
            <ChatMarkdown content={message.content} />
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>
        <span className="mt-1 px-1 text-[10px] text-zinc-700">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
