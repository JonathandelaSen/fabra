"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslations } from "next-intl";
import {
  Bot,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import type {
  AnalysisChatConversation,
  AnalysisChatMessage,
} from "../types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { CopyPasteTextPanel } from "@/components/shared/copy-paste-text-panel";

interface TabChatOfertaProps {
  analysisId: string;
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
}

function ChatMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-100">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-zinc-300">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="text-zinc-300">{children}</li>,
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-emerald-300">
                {children}
              </code>
            );
          }
          return (
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-emerald-300">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="mb-3 last:mb-0">{children}</pre>,
        h1: ({ children }) => (
          <h1 className="mb-2 text-base font-bold text-zinc-100">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 text-sm font-bold text-zinc-100">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1.5 text-sm font-semibold text-zinc-200">
            {children}
          </h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-2 border-cyan-500/30 pl-3 italic text-zinc-400 last:mb-0">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-white/10" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: {
  conversations: AnalysisChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("analysisDetail.chat");
  const common = useTranslations("common.actions");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (conv: AnalysisChatConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const commitRename = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-white/[0.06]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {t("conversations")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-zinc-400 hover:text-cyan-300"
          onClick={onNew}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          {conversations.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-zinc-600">
              {t("noConversations")}
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition-colors cursor-pointer ${
                activeId === conv.id
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-300"
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <MessageCircle className="size-3.5 shrink-0" />
              {editingId === conv.id ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="min-w-0 flex-1 truncate bg-transparent text-xs outline-none"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-xs">
                  {conv.title}
                </span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10"
                >
                  <MoreHorizontal className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => startEditing(conv)}>
                    <Pencil className="mr-2 size-3.5" />
                    {t("rename")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400"
                    onClick={() => onDelete(conv.id)}
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    {common("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
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
      {/* Sidebar */}
      <ConversationList
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={createConversation}
        onRename={renameConversation}
        onDelete={deleteConversation}
      />

      {/* Chat area */}
      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-400">
              <Sparkles className="size-3.5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-200">
                {t("title")}
              </h4>
              <p className="text-[11px] text-zinc-600">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-zinc-600">{t("modelLabel")}</span>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="flex flex-col gap-1 p-4">
            {isLoadingConversations || isLoadingMessages ? (
              <div className="flex flex-1 items-center justify-center py-20 text-sm text-zinc-600">
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("loading")}
              </div>
            ) : !activeConversationId ? (
              <EmptyState onNew={createConversation} />
            ) : messages.length === 0 ? (
              <EmptyChat />
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
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-500">
                  <Loader2 className="size-3.5 animate-spin" />
                  {t("thinking")}
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Error */}
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

        {/* Input */}
        <div className="border-t border-white/[0.06] p-3">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(e);
                }
              }}
              placeholder={t("inputPlaceholder")}
              rows={1}
              className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-xl border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-cyan-500/20"
            />
            <AIActionLauncher
              actionLabel={t("sendAction")}
              loading={isSending || isPreparingCopyPaste}
              disabled={!draft.trim()}
              integrated={{
                available: hasAIApiKey,
                selectedModelId: model || aiModel,
                models: [
                  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },
                  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
                ],
                onModelChange: setModel,
                onRun: () => void handleSubmit(),
                unavailableReason: t("missingApiKey"),
              }}
              copyPaste={{
                available: true,
                onOpenFlow: () => void openCopyPasteFlow(),
              }}
            />
          </form>
        </div>
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

function OfferChatCopyPasteModal({
  isOpen,
  isApplying,
  prompt,
  privacyNotice,
  onClose,
  onApplyText,
}: {
  isOpen: boolean;
  isApplying: boolean;
  prompt: string;
  privacyNotice: string;
  onClose: () => void;
  onApplyText: (text: string) => void;
}) {
  const t = useTranslations("analysisDetail.chat.copyPaste");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[min(760px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-white/10 bg-[#101018] p-5 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="absolute right-4 top-4 rounded-md p-1 text-zinc-500 hover:bg-white/10 hover:text-zinc-200"
            >
              <X className="size-4" />
            </button>
            <div className="mb-4 pr-8">
              <h3 className="text-base font-semibold text-zinc-100">
                {t("title")}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">{t("intro")}</p>
            </div>
            <CopyPasteTextPanel
              title={t("panelTitle")}
              privacyNotice={privacyNotice}
              prompt={prompt}
              copyLabel={t("copyPrompt")}
              copiedLabel={t("promptCopied")}
              pastedTextLabel={t("pasteResponseLabel")}
              pastedTextPlaceholder={t("pasteResponsePlaceholder")}
              applyLabel={isApplying ? t("applying") : t("insertResponse")}
              emptyResponseError={t("emptyResponse")}
              onApplyText={onApplyText}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ChatBubble({
  message,
  formatTime,
}: {
  message: AnalysisChatMessage;
  formatTime: (d: string) => string;
}) {
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

function EmptyState({ onNew }: { onNew: () => void }) {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
        <MessageCircle className="size-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-300">
          {t("startTitle")}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          {t("startDescription")}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onNew}
        className="mt-1 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
      >
        <Plus className="mr-1.5 size-3.5" />
        {t("newConversation")}
      </Button>
    </div>
  );
}

function EmptyChat() {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-600">
        <Sparkles className="size-5" />
      </div>
      <div>
        <p className="text-sm text-zinc-400">{t("firstQuestion")}</p>
        <p className="mt-1 text-xs text-zinc-600">
          {t("firstQuestionDescription")}
        </p>
      </div>
    </div>
  );
}
