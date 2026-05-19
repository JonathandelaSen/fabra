"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  Globe2,
  KeyRound,
  LayoutTemplate,
  Lightbulb,
  Loader2,
  PenLine,
  Redo2,
  Settings,
  Sparkles,
  Undo2,
  Wand2,
} from "lucide-react";
import { getCVTemplate } from "@/lib/cv-templates";

import { Button } from "@/components/ui/button";
import { ManualEditor } from "./cv-manual-editor/manual-editor";
import { useCVEditorMutations } from "../hooks/use-cv-editor-mutations";
import { useCVEditorState } from "../hooks/use-cv-editor-state";

const PDFPreview = dynamic(
  () => import("@/components/shared/pdf-preview").then((mod) => mod.PDFPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  },
);

interface CVEditorViewProps {
  activeVersionId: string | null;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  onStartAnalysis: () => void;
  onBackToLibrary?: () => void;
}

function safeParseArray(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default function CVEditorView({
  activeVersionId,
  onOpenTemplates,
  onOpenSettings,
  onStartAnalysis,
  onBackToLibrary,
}: CVEditorViewProps) {
  const t = useTranslations("cvEditor");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [publicCopied, setPublicCopied] = useState(false);
  const [editorTab, setEditorTab] = useState<"ai" | "manual">("ai");

  const editorState = useCVEditorState(activeVersionId);
  const {
    templateCvs,
    aiProvider,
    aiApiKey,
    hasAIApiKey,
    currentVersion,
    activeTemplate,
    locale,
    currentProfile,
    previewSrc,
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
    error,
    setError,
    selectedModel,
    setSelectedModel,
    setEditedVersion,
    setManuallySelectedVersionId,
    setProfile,
    saveProfileToApi,
    reloadPreview,
    recommendationAnalysis,
    handleManualChange,
    publicSlug,
    normalizedPublicSlug,
    publicUrl,
    publicDraftUrl,
    hasPublicSlugChanges,
    setPublicSlugDraft,
    savedProfileJsonRef,
  } = editorState;

  const {
    editInstruction,
    setEditInstruction,
    editingProfile,
    savingAsCv,
    savingLocale,
    savingPublicSettings,
    applyInstruction,
    saveAsCV,
    updateLocale,
    updatePublicSettings,
  } = useCVEditorMutations({
    currentVersionId: currentVersion?.id ?? null,
    currentProfile,
    normalizedPublicSlug,
    aiProvider,
    aiApiKey,
    selectedModel,
    hasAIApiKey,
    savedProfileJsonRef,
    setEditedVersion,
    setProfile,
    saveProfileToApi,
    reloadPreview,
    setError,
    setPublicSlugDraft,
  });

  const handleSaveAsCV = async () => {
    const saved = await saveAsCV(saveName);
    if (saved) setIsSavingModalOpen(false);
  };

  const handleUpdatePublicSettings = async (
    enabled: boolean,
    confirmPublicExposure = false,
  ) => {
    const saved = await updatePublicSettings(enabled, confirmPublicExposure);
    if (saved) setIsPublicModalOpen(false);
  };

  const copyPublicUrl = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setPublicCopied(true);
    setTimeout(() => setPublicCopied(false), 1800);
  };

  if (!currentVersion || !activeTemplate) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#050509] p-10 text-center overflow-y-auto">
        <div className="max-w-3xl w-full">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
            <LayoutTemplate className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t("empty.title")}
          </h2>
          <p className="text-zinc-500 mb-8">
            {t("empty.description")}
          </p>

          {templateCvs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {templateCvs.map((cv) => (
                <button
                  key={cv.id}
                  onClick={() => setManuallySelectedVersionId(cv.id)}
                  className="flex flex-col items-start rounded-xl border border-white/5 bg-white/5 p-4 hover:border-teal-500/30 hover:bg-white/10 transition-colors"
                >
                  <span className="font-semibold text-white truncate w-full">
                    {cv.name}
                  </span>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                      {getCVTemplate(cv.templateId!)?.name || cv.templateId}
                    </span>
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                      {cv.templateLocale}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 mx-auto max-w-md">
              <p className="text-zinc-500 mb-6">
                {t("empty.noTemplateCvs")}
              </p>
              <Button
                onClick={onOpenTemplates}
                className="bg-teal-500 text-black hover:bg-teal-400"
              >
                {t("empty.openTemplates")}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#050509]">
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0a12]/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackToLibrary}
            className="h-8 w-8 text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-white">
                {currentVersion.name}
              </h2>
              <span className="text-[10px] text-zinc-600">{t("basedOn")}</span>
              <span className="truncate text-[11px] font-medium text-teal-500/80 italic">
                {t("originalCv")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <span className="rounded-full bg-white/5 px-1.5 py-0.5 uppercase tracking-wider">
                {activeTemplate.name}
              </span>
              <span className="rounded-full bg-white/5 px-1.5 py-0.5 uppercase tracking-wider">
                {locale}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-white/5 bg-white/5 p-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canUndo}
              onClick={undo}
              className="h-7 w-7 text-zinc-400 hover:text-white disabled:opacity-30"
              title={t("undo")}
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canRedo}
              onClick={redo}
              className="h-7 w-7 text-zinc-400 hover:text-white disabled:opacity-30"
              title={t("redo")}
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            onClick={() => {
              setSaveName(t("editedName", { name: currentVersion.name }));
              setIsSavingModalOpen(true);
            }}
            variant="ghost"
            className="h-9 gap-2 border border-teal-500/20 bg-teal-500/5 text-xs text-teal-400 hover:bg-teal-500/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("saveNewVersion")}</span>{" "}
          </Button>

          <div className="hidden h-4 w-[1px] bg-white/10 md:block" />

          <a
            href={`/api/cvs/${currentVersion.id}/template-pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-white/5 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("downloadPdf")}</span>
            <span className="sm:hidden">PDF</span>
          </a>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`h-9 w-9 transition-colors ${isPanelOpen ? "text-teal-400" : "text-zinc-500"}`}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1 overflow-auto bg-[#050509] scrollbar-thin">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {currentProfile ? (
            <PDFPreview url={previewSrc} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {isPanelOpen && (
            <motion.aside
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-30 w-[480px] border-l border-white/5 bg-[#0a0a12]/95 backdrop-blur-xl md:relative"
            >
              <div className="flex h-full flex-col overflow-y-auto p-6 scrollbar-thin">
                <div className="space-y-8">
                  <div className="flex gap-1 rounded-xl border border-white/5 p-1 bg-white/5">
                    <button
                      onClick={() => setEditorTab("ai")}
                      className={`flex items-center gap-1.5 flex-1 justify-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${editorTab === "ai" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      IA
                    </button>
                    <button
                      onClick={() => setEditorTab("manual")}
                      className={`flex items-center gap-1.5 flex-1 justify-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${editorTab === "manual" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      Manual
                    </button>
                  </div>

                  {editorTab === "manual" && currentProfile && (
                    <ManualEditor
                      profile={currentProfile}
                      templateId={activeTemplate.templateId}
                      locale={locale}
                      saveState={saveState}
                      onChange={handleManualChange}
                      onSave={() => void saveProfileToApi(currentProfile)}
                    />
                  )}

                  {editorTab === "ai" && (
                    <section>
                      <header className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <h3 className="text-sm font-semibold text-white">
                            Editor IA
                          </h3>
                        </div>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="bg-transparent text-[11px] font-medium text-zinc-500 focus:outline-none cursor-pointer"
                        >
                          <option value="gemini-3.1-pro-preview">
                            Gemini 3.1 Pro
                          </option>
                          <option value="gemini-2.5-flash">
                            Gemini 2.5 Flash
                          </option>
                        </select>
                      </header>

                      {error && (
                        <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
                          {error}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="relative">
                          <textarea
                            value={editInstruction}
                            onChange={(e) => setEditInstruction(e.target.value)}
                            placeholder="Describe los cambios que quieres hacer..."
                            className="h-32 w-full resize-none rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/30 focus:outline-none transition-colors"
                          />
                          <Button
                            disabled={
                              !editInstruction.trim() ||
                              editingProfile ||
                              !hasAIApiKey
                            }
                            onClick={() => applyInstruction()}
                            className="absolute bottom-3 right-3 h-8 rounded-lg bg-teal-500 px-3 text-xs font-bold text-black hover:bg-teal-400 disabled:opacity-30"
                          >
                            {editingProfile ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Wand2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {[
                            t("aiHints.shortenSummary"),
                            t("aiHints.improveClarity"),
                            t("aiHints.moreExecutive"),
                            t("aiHints.fixTypos"),
                          ].map((hint) => (
                            <button
                              key={hint}
                              onClick={() => {
                                setEditInstruction(hint);
                                void applyInstruction(hint);
                              }}
                              className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px] text-zinc-400 hover:border-white/10 hover:bg-white/10 hover:text-zinc-200 transition-colors"
                            >
                              {hint}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">
                          {t("recommendations.title")}
                        </h3>
                      </div>
                      {recommendationAnalysis?.ai_score && (
                        <span className="text-xs font-bold text-amber-500">
                          {recommendationAnalysis.ai_score}/100
                        </span>
                      )}
                    </div>

                    {recommendationAnalysis ? (
                      <div className="space-y-3">
                        {safeParseArray(recommendationAnalysis.ai_improvements)
                          .slice(0, 3)
                          .map((imp, i) => (
                            <div
                              key={i}
                              className="flex gap-3 text-xs leading-relaxed text-zinc-400"
                            >
                              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/40" />
                              <p>{imp}</p>
                            </div>
                          ))}
                        {safeParseArray(recommendationAnalysis.missing_keywords)
                          .length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {safeParseArray(
                              recommendationAnalysis.missing_keywords,
                            )
                              .slice(0, 5)
                              .map((k) => (
                                <span
                                  key={k}
                                  className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500"
                                >
                                  {k}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
                        <p className="text-xs text-zinc-500 mb-3">
                          {t("recommendations.empty")}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onStartAnalysis}
                          className="h-8 text-[11px] border-white/10 text-zinc-400 hover:text-white"
                        >
                          {t("recommendations.analyzeNow")}
                        </Button>
                      </div>
                    )}
                  </section>

                  <section className="space-y-4 border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                          <Globe2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            {t("publicPage.title")}
                          </h3>
                          <p className="text-[11px] text-zinc-600">
                            {currentVersion.publicEnabled
                              ? t("publicPage.enabled")
                              : t("publicPage.disabled")}
                          </p>
                        </div>
                      </div>
                      {currentVersion.publicEnabled ? (
                        <Button
                          variant="ghost"
                          disabled={savingPublicSettings}
                          onClick={() => void handleUpdatePublicSettings(false)}
                          className="h-8 border border-rose-500/20 bg-rose-500/5 px-3 text-[11px] text-rose-300 hover:bg-rose-500/10"
                        >
                          {t("publicPage.unpublish")}
                        </Button>
                      ) : (
                        <Button
                          disabled={
                            savingPublicSettings || !normalizedPublicSlug
                          }
                          onClick={() => setIsPublicModalOpen(true)}
                          className="h-8 bg-sky-500 px-3 text-[11px] font-bold text-black hover:bg-sky-400"
                        >
                          {t("publicPage.publish")}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        {t("publicPage.editableUrl")}
                      </label>
                      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-1.5">
                        <span className="hidden shrink-0 pl-2 text-[11px] text-zinc-600 sm:inline">
                          /cv/{currentVersion.publicId ?? "id"}/
                        </span>
                        <input
                          value={publicSlug}
                          onChange={(event) =>
                            setPublicSlugDraft({
                              cvId: currentVersion.id,
                              value: event.target.value,
                            })
                          }
                          onBlur={() =>
                            setPublicSlugDraft({
                              cvId: currentVersion.id,
                              value: normalizedPublicSlug,
                            })
                          }
                          className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder:text-zinc-700"
                          placeholder="nombre-del-cv"
                        />
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-600">
                        {t("publicPage.urlHelp")}
                      </p>
                    </div>

                    {currentVersion.publicEnabled && publicUrl && (
                      <div className="space-y-2">
                        {hasPublicSlugChanges && (
                          <Button
                            disabled={
                              savingPublicSettings || !normalizedPublicSlug
                            }
                            onClick={() => void handleUpdatePublicSettings(true)}
                            className="h-8 w-full bg-sky-500 px-3 text-[11px] font-bold text-black hover:bg-sky-400"
                          >
                            {savingPublicSettings ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              t("publicPage.saveUrl")
                            )}
                          </Button>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            disabled={savingPublicSettings}
                            onClick={() => void copyPublicUrl()}
                            className="h-8 flex-1 border border-white/5 bg-white/5 text-xs text-zinc-300 hover:bg-white/10"
                          >
                            {publicCopied ? (
                              <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="mr-2 h-3.5 w-3.5" />
                            )}
                            {publicCopied ? t("publicPage.copied") : t("publicPage.copyUrl")}
                          </Button>
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center justify-center rounded-md border border-white/5 bg-white/5 px-3 text-xs text-zinc-300 hover:bg-white/10"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="pt-4 border-t border-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                      {t("settings.title")}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          {t("settings.cvLanguage")}
                        </span>
                        <div className="flex gap-1 rounded-lg border border-white/5 p-1 bg-white/5">
                          {(["es", "en"] as const).map((l) => (
                            <button
                              key={l}
                              onClick={() => updateLocale(l)}
                              disabled={savingLocale}
                              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                                locale === l
                                  ? "bg-white/10 text-white"
                                  : "text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">{t("settings.design")}</span>
                        <Button
                          variant="link"
                          onClick={onOpenTemplates}
                          className="h-auto p-0 text-xs text-teal-400"
                        >
                          {t("settings.changeTemplate")}
                        </Button>
                      </div>
                    </div>
                  </section>

                  {!hasAIApiKey && (
                    <Button
                      variant="secondary"
                      onClick={onOpenSettings}
                      className="w-full h-10 text-xs bg-amber-500 text-black hover:bg-amber-400"
                    >
                      <KeyRound className="mr-2 h-3.5 w-3.5" />
                      {t("settings.configureApiKey")}
                    </Button>
                  )}
                </div>

                <div className="mt-auto pt-10">
                  <p className="text-[10px] text-zinc-600 leading-relaxed">
                    {t("derivedNotice")}
                  </p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isPublicModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-[#0a0a12] p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {t("publicModal.title")}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {t("publicModal.description")}
              </p>
              <div className="mt-4 rounded-2xl border border-rose-500/15 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-200">
                {t("publicModal.warning")}
              </div>
              <div className="mt-6 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                {publicDraftUrl || `/cv/id/${normalizedPublicSlug}`}
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsPublicModalOpen(false)}
                  className="flex-1 text-zinc-400 hover:bg-white/5"
                >
                  {t("actions.cancel")}
                </Button>
                <Button
                  disabled={savingPublicSettings || !normalizedPublicSlug}
                  onClick={() => void handleUpdatePublicSettings(true, true)}
                  className="flex-1 bg-rose-500 text-white hover:bg-rose-400"
                >
                  {savingPublicSettings ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("publicModal.confirm")
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {isSavingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a0a12] p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white">
                {t("saveModal.title")}
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                {t("saveModal.description")}
              </p>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    {t("saveModal.nameLabel")}
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-teal-500/50 focus:outline-none"
                    placeholder={t("saveModal.namePlaceholder")}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsSavingModalOpen(false)}
                    className="flex-1 text-zinc-400 hover:bg-white/5"
                  >
                    {t("actions.cancel")}
                  </Button>
                  <Button
                    onClick={handleSaveAsCV}
                    disabled={!saveName.trim() || savingAsCv}
                    className="flex-1 bg-teal-500 text-black hover:bg-teal-400"
                  >
                    {savingAsCv ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("actions.save")
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
