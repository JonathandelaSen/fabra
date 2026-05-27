"use client";

import {
  CalendarDays,
  Lock,
  MessageSquareQuote,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type {
  ActivityContext,
  ReceivedFeedbackItem,
} from "../api/received-feedback-api";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ReceivedFeedbackDetailProps {
  item: ReceivedFeedbackItem;
  contexts: ActivityContext[];
  onEdit: () => void;
  onDelete: () => void;
}

export function ReceivedFeedbackDetail({
  item,
  contexts,
  onEdit,
  onDelete,
}: ReceivedFeedbackDetailProps) {
  const t = useTranslations("receivedFeedback");

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between border-b border-white/[0.04] pb-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-zinc-50 truncate">
                  {item.giverName}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Received feedback provider
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                {contexts.find((c) => c.id === item.activityContextId)?.name ||
                  "General"}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-white/[0.06]">
                <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
                {formatDate(item.receivedDate)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <Button
              type="button"
              onClick={onEdit}
              variant="secondary"
              size="sm"
              className="bg-indigo-600/15 text-indigo-300 hover:bg-indigo-600/25 border border-indigo-500/20 font-medium transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>

            <Button
              type="button"
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className="bg-rose-600/10 text-rose-400 hover:bg-rose-600/25 border border-rose-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.015] p-6 shadow-inner">
            <div className="absolute top-4 right-4 text-white/[0.02]">
              <MessageSquareQuote className="h-24 w-24 -mt-6 -mr-4" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">
                <MessageSquareQuote className="h-4 w-4" />
                Feedback content
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                {item.feedbackText}
              </p>
            </div>
          </div>

          {item.userNote && (
            <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-5">
              <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                <Lock className="h-3.5 w-3.5" />
                {t("fields.privateNote")}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {item.userNote}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
