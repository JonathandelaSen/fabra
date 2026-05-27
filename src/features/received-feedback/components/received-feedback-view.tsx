"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  ChevronRight,
  User,
  Lock,
  MessageSquareQuote,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { Button } from "@/components/ui/button";
import { ActivityContextSelector } from "@/features/activity-context";
import type {
  ActivityContext,
  ReceivedFeedbackItem,
} from "../api/received-feedback-api";
import { useReceivedFeedbackMutations } from "../hooks/use-received-feedback-mutations";
import {
  useReceivedFeedbackContexts,
  useReceivedFeedbackList,
} from "../hooks/use-received-feedback-queries";
import { useReceivedFeedbackRouteState } from "../hooks/use-received-feedback-route-state";
import {
  ReceivedFeedbackListSkeleton,
  ReceivedFeedbackDetailSkeleton,
} from "./received-feedback-skeleton";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20";

const textareaClass =
  "w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20";

interface FormState {
  activityContextId: string;
  receivedDate: string;
  giverName: string;
  feedbackText: string;
  userNote: string;
}

function emptyForm(): FormState {
  return {
    activityContextId: "",
    receivedDate: new Date().toISOString().slice(0, 10),
    giverName: "",
    feedbackText: "",
    userNote: "",
  };
}

function findDefaultContext(contexts: ActivityContext[]) {
  return contexts.find((context) => context.isDefault) ?? contexts[0] ?? null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReceivedFeedbackView() {
  useReceivedFeedbackRouteState();
  const t = useTranslations("receivedFeedback");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const feedbackQuery = useReceivedFeedbackList();
  const contextsQuery = useReceivedFeedbackContexts();
  const mutations = useReceivedFeedbackMutations();
  
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const rawItems = feedbackQuery.data ?? [];
  const contexts = contextsQuery.data?.contexts ?? [];
  
  // Search filter
  const items = useMemo(() => {
    const sorted = [...rawItems].sort(
      (a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime()
    );
    if (!searchQuery.trim()) return sorted;
    const query = searchQuery.toLowerCase();
    return sorted.filter(
      (item) =>
        item.giverName.toLowerCase().includes(query) ||
        item.feedbackText.toLowerCase().includes(query) ||
        (item.userNote && item.userNote.toLowerCase().includes(query))
    );
  }, [rawItems, searchQuery]);

  const selectedItem = useMemo(() => {
    return rawItems.find((item) => item.id === selectedId) ?? null;
  }, [rawItems, selectedId]);

  const saving =
    mutations.createFeedback.isPending ||
    mutations.updateFeedback.isPending ||
    mutations.deleteFeedback.isPending;
  const loading = feedbackQuery.isLoading || contextsQuery.isLoading;
  
  const queryError = feedbackQuery.error
    ? getErrorMessage(feedbackQuery.error)
    : contextsQuery.error
      ? getErrorMessage(contextsQuery.error)
      : null;
  const visibleError = error ?? queryError;

  // Auto-selection on initial load
  useEffect(() => {
    if (!selectedId && !isCreating && items.length > 0) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId, isCreating]);

  // Handle URL context parameters
  useEffect(() => {
    const selectedContextId = searchParams.get("activityContextId");
    if (selectedContextId) {
      const defaultContext = contexts.find((c) => c.id === selectedContextId) ?? findDefaultContext(contexts);
      setForm({
        ...emptyForm(),
        activityContextId: defaultContext?.id ?? selectedContextId,
      });
      setIsCreating(true);
      setSelectedId(null);
      setIsEditing(false);
      return;
    }
    const defaultContext = findDefaultContext(contexts);
    if (defaultContext && !form.activityContextId) {
      setForm((current) => ({
        ...current,
        activityContextId: defaultContext.id,
      }));
    }
  }, [contexts, form.activityContextId, searchParams]);

  const startCreate = () => {
    const defaultContext = findDefaultContext(contexts);
    setForm({ ...emptyForm(), activityContextId: defaultContext?.id ?? "" });
    setSelectedId(null);
    setIsCreating(true);
    setIsEditing(false);
    setError(null);
  };

  const startEdit = (item: ReceivedFeedbackItem) => {
    const fallbackContext = findDefaultContext(contexts);
    setForm({
      activityContextId: item.activityContextId ?? fallbackContext?.id ?? "",
      receivedDate: item.receivedDate,
      giverName: item.giverName,
      feedbackText: item.feedbackText,
      userNote: item.userNote ?? "",
    });
    setIsEditing(true);
    setIsCreating(false);
    setError(null);
  };

  const cancelAction = () => {
    setIsCreating(false);
    setIsEditing(false);
    if (items.length > 0) {
      setSelectedId(selectedId ?? items[0].id);
    } else {
      setSelectedId(null);
    }
    setForm(emptyForm());
  };

  const manageContexts = () => {
    router.push(
      `/activity-contexts?source=received-feedback&returnTo=${encodeURIComponent("/received-feedback")}`
    );
  };

  const saveFeedback = async () => {
    if (!form.receivedDate || !form.giverName.trim() || !form.feedbackText.trim()) {
      setError(t("errors.required"));
      return;
    }

    const payload = {
      receivedDate: form.receivedDate,
      activityContextId: form.activityContextId,
      giverName: form.giverName,
      feedbackText: form.feedbackText,
      userNote: form.userNote || null,
    };

    setError(null);
    try {
      if (isEditing && selectedId) {
        await mutations.updateFeedback.mutateAsync({
          id: selectedId,
          updates: payload,
        });
        setIsEditing(false);
      } else {
        const result = await mutations.createFeedback.mutateAsync(payload);
        if (result?.id) {
          setSelectedId(result.id);
        }
        setIsCreating(false);
      }
      setForm(emptyForm());
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t("errors.saveFeedback"));
    }
  };

  const deleteFeedback = async (item: ReceivedFeedbackItem) => {
    if (!window.confirm(t("confirmDelete"))) return;

    setError(null);
    try {
      const deletedId = item.id;
      const currentIndex = items.findIndex((x) => x.id === deletedId);
      const nextSelection =
        items[currentIndex + 1]?.id ?? items[currentIndex - 1]?.id ?? null;
      
      await mutations.deleteFeedback.mutateAsync(item);
      
      if (selectedId === deletedId) {
        setSelectedId(nextSelection);
        setIsEditing(false);
        setIsCreating(false);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t("errors.deleteFeedback"));
    }
  };

  return (
    <FeatureScreenShell
      title={t("title")}
      actions={
        <Button
          type="button"
          onClick={startCreate}
          disabled={saving}
          className="bg-emerald-300 text-emerald-950 font-semibold hover:bg-emerald-200 transition-colors shadow-[0_0_30px_rgba(110,231,183,0.15)]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t("newFeedback")}
        </Button>
      }
      className="w-full"
      contentClassName="w-full"
      bodyContentClassName="w-full h-full"
    >
      <FeatureTwoPaneLayout
        sidebar={
          <FeatureSidebarPanel
            header={
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-indigo-500/40"
                />
              </div>
            }
          >
            {loading ? (
              <ReceivedFeedbackListSkeleton />
            ) : items.length === 0 ? (
              <div className="px-4 py-12 text-center text-xs text-zinc-600">
                {searchQuery ? "No matches found." : t("empty")}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const isSelected = selectedId === item.id;
                  const contextName = contexts.find(
                    (c) => c.id === item.activityContextId
                  )?.name;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(item.id);
                        setIsEditing(false);
                        setIsCreating(false);
                        setError(null);
                      }}
                      className={`group relative w-full rounded-xl p-3.5 text-left border transition-all duration-200 ${
                        isSelected
                          ? "bg-[#181825] border-indigo-500/20 text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-semibold text-zinc-100">
                          {item.giverName}
                        </p>
                        <ChevronRight
                          className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                            isSelected ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"
                          }`}
                        />
                      </div>
                      
                      <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400">
                        {item.feedbackText}
                      </p>

                      <div className="mt-3.5 flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] font-medium text-zinc-500 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5">
                          {contextName || "General"}
                        </span>
                        <span className="shrink-0 text-[10px] text-zinc-500">
                          {formatDate(item.receivedDate)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </FeatureSidebarPanel>
        }
      >
        <div className="flex flex-col gap-4">
          {visibleError && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {visibleError}
            </div>
          )}

          {loading ? (
            <ReceivedFeedbackDetailSkeleton />
          ) : isCreating ? (
            /* Creation Form Mode */
            <section className="rounded-xl border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
              <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-50">{t("newFeedback")}</h2>
                  <p className="text-xs text-zinc-500 mt-1">Capture a new piece of feedback you received.</p>
                </div>
                <Button
                  onClick={cancelAction}
                  variant="ghost"
                  size="icon-sm"
                  className="text-zinc-500 hover:text-zinc-200"
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <ActivityContextSelector
                    id="feedback-activity-context"
                    label={t("fields.activityContext")}
                    manageLabel={t("actions.manageContexts")}
                    value={form.activityContextId}
                    onChange={(val) => setForm({ ...form, activityContextId: val })}
                    contexts={contexts}
                    onManageClick={manageContexts}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    {t("fields.receivedDate")}
                  </label>
                  <input
                    type="date"
                    max={today}
                    className={inputClass}
                    value={form.receivedDate}
                    onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    {t("fields.from")}
                  </label>
                  <input
                    className={inputClass}
                    maxLength={120}
                    placeholder={t("placeholders.from")}
                    value={form.giverName}
                    onChange={(e) => setForm({ ...form, giverName: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-400">
                    {t("fields.feedback")}
                  </label>
                  <textarea
                    className={textareaClass}
                    maxLength={10000}
                    rows={6}
                    placeholder={t("placeholders.feedback")}
                    value={form.feedbackText}
                    onChange={(e) => setForm({ ...form, feedbackText: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-400">
                    {t("fields.privateNote")}
                  </label>
                  <textarea
                    className={textareaClass}
                    maxLength={10000}
                    rows={4}
                    placeholder={t("placeholders.privateNote")}
                    value={form.userNote}
                    onChange={(e) => setForm({ ...form, userNote: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-white/[0.04] pt-4">
                <Button
                  onClick={cancelAction}
                  variant="ghost"
                  disabled={saving}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  {t("actions.cancel")}
                </Button>
                <Button
                  onClick={() => void saveFeedback()}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  {saving ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-4 w-4" />
                  )}
                  {t("actions.save")}
                </Button>
              </div>
            </section>
          ) : selectedItem ? (
            isEditing ? (
              /* Edit Form Mode */
              <section className="rounded-xl border border-white/[0.06] bg-[#101018] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
                <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/[0.04] pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-50">{t("editFeedback")}</h2>
                    <p className="text-xs text-zinc-500 mt-1">Update details for this feedback record.</p>
                  </div>
                  <Button
                    onClick={cancelAction}
                    variant="ghost"
                    size="icon-sm"
                    className="text-zinc-500 hover:text-zinc-200"
                    disabled={saving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <ActivityContextSelector
                      id="edit-feedback-activity-context"
                      label={t("fields.activityContext")}
                      manageLabel={t("actions.manageContexts")}
                      value={form.activityContextId}
                      onChange={(val) => setForm({ ...form, activityContextId: val })}
                      contexts={contexts}
                      onManageClick={manageContexts}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">
                      {t("fields.receivedDate")}
                    </label>
                    <input
                      type="date"
                      max={today}
                      className={inputClass}
                      value={form.receivedDate}
                      onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">
                      {t("fields.from")}
                    </label>
                    <input
                      className={inputClass}
                      maxLength={120}
                      placeholder={t("placeholders.from")}
                      value={form.giverName}
                      onChange={(e) => setForm({ ...form, giverName: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-400">
                      {t("fields.feedback")}
                    </label>
                    <textarea
                      className={textareaClass}
                      maxLength={10000}
                      rows={6}
                      placeholder={t("placeholders.feedback")}
                      value={form.feedbackText}
                      onChange={(e) => setForm({ ...form, feedbackText: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-400">
                      {t("fields.privateNote")}
                    </label>
                    <textarea
                      className={textareaClass}
                      maxLength={10000}
                      rows={4}
                      placeholder={t("placeholders.privateNote")}
                      value={form.userNote}
                      onChange={(e) => setForm({ ...form, userNote: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-white/[0.04] pt-4">
                  <Button
                    onClick={cancelAction}
                    variant="ghost"
                    disabled={saving}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    {t("actions.cancel")}
                  </Button>
                  <Button
                    onClick={() => void saveFeedback()}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  >
                    {saving ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-4 w-4" />
                    )}
                    {t("actions.save")}
                  </Button>
                </div>
              </section>
            ) : (
              /* Read-Only Details Panel Mode */
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
                            {selectedItem.giverName}
                          </h2>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Received feedback provider
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                          {contexts.find((c) => c.id === selectedItem.activityContextId)?.name || "General"}
                        </span>
                        
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-white/[0.06]">
                          <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
                          {formatDate(selectedItem.receivedDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <Button
                        type="button"
                        onClick={() => startEdit(selectedItem)}
                        variant="secondary"
                        size="sm"
                        className="bg-indigo-600/15 text-indigo-300 hover:bg-indigo-600/25 border border-indigo-500/20 font-medium transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => void deleteFeedback(selectedItem)}
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
                    {/* Quotation Feedback Card */}
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
                          {selectedItem.feedbackText}
                        </p>
                      </div>
                    </div>

                    {/* Private Note Card */}
                    {selectedItem.userNote && (
                      <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-5">
                        <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                          <Lock className="h-3.5 w-3.5" />
                          {t("fields.privateNote")}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                          {selectedItem.userNote}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )
          ) : (
            /* Empty State */
            <div className="rounded-xl border border-dashed border-white/10 py-24 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] text-zinc-500 border border-white/5">
                <MessageSquareQuote className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-200">{t("empty")}</h3>
              <p className="mt-1.5 text-xs text-zinc-500">Select an existing feedback card or create a new one to begin.</p>
              <div className="mt-6">
                <Button
                  onClick={startCreate}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  {t("newFeedback")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
