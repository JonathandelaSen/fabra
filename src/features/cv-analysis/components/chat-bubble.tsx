"use client";

import { Bot, UserRound } from "lucide-react";
import { ChatMarkdown } from "./chat-markdown";
import type { AnalysisChatMessage } from "./chat-types";

interface ChatBubbleProps {
  message: AnalysisChatMessage;
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
            : "bg-white/10 text-zinc-400"
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
              ? "rounded-tl-md bg-white/[0.03] text-zinc-300"
              : "rounded-tr-md bg-cyan-500/10 text-zinc-200"
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
