"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LayoutTemplate } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import {
  CV_TEMPLATES,
  type CVTemplateDefinition,
  type CVTemplateLocale,
} from "@/lib/cv-templates";
import {
  getStoredAIApiKey,
  getStoredAIModel,
  getStoredAIProvider,
} from "@/lib/browser-preferences";
import { useCVDocumentList } from "../hooks/use-cv-library-queries";
import TemplateCard from "./template-card";
import TemplateConfigurationModal from "./template-configuration-modal";

interface TemplatesViewProps {
  onOpenSettings: () => void;
  onOpenEditor: (versionId: string) => void;
  onOpenUpload: () => void;
}

export default function TemplatesView({
  onOpenSettings,
  onOpenEditor,
  onOpenUpload,
}: TemplatesViewProps) {
  const listQuery = useCVDocumentList();
  const cvs = listQuery.data ?? [];
  const aiProvider = getStoredAIProvider();
  const aiApiKey = getStoredAIApiKey();
  const aiModel = getStoredAIModel();
  const hasAIApiKey = aiProvider === "mock" || aiApiKey.length > 0;
  const t = useTranslations("analysisFlow.templates");
  const tf = useTranslations("analysisFlow.forms");
  const [selectedTemplate, setSelectedTemplate] =
    useState<CVTemplateDefinition | null>(null);
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [locale, setLocale] = useState<CVTemplateLocale>("es");
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [error, setError] = useState<string | null>(null);

  const models = [
    { id: "gemini-2.5-flash", label: `Gemini 2.5 Flash (${tf("fast")})` },
    { id: "gemini-3.1-pro-preview", label: `Gemini 3.1 Pro Preview (${tf("powerful")})` },
  ];

  const filteredCvs = cvs.filter(
    (cv) =>
      cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cv.filename ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateVersion = async () => {
    if (!selectedTemplate || !selectedCvId) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch(`/api/cvs/${selectedCvId}/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.templateId,
          locale,
          provider: aiProvider,
          apiKey: aiApiKey,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || data.details || t("createFailed"),
        );
      }

      void listQuery.refetch();
      onOpenEditor(data.version.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#050509]">
      <div className="mx-auto max-w-7xl p-6 md:p-10">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-300">
            <LayoutTemplate className="h-3.5 w-3.5" />
            {t("badge")}
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-400">
            {t("description")}
          </p>
        </header>

        {error && (
          <div className="mb-8 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {CV_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.templateId}
              template={template}
              onSelect={setSelectedTemplate}
            />
          ))}
        </div>
      </div>

      <TemplateConfigurationModal
        template={selectedTemplate}
        cvs={cvs}
        filteredCvs={filteredCvs}
        selectedCvId={selectedCvId}
        locale={locale}
        searchQuery={searchQuery}
        hasAIApiKey={hasAIApiKey}
        selectedModel={selectedModel}
        models={models}
        creating={creating}
        copyPasteOpen={copyPasteOpen}
        onClose={() => setSelectedTemplate(null)}
        onSelectCv={setSelectedCvId}
        onLocaleChange={setLocale}
        onSearchChange={setSearchQuery}
        onOpenUpload={onOpenUpload}
        onOpenSettings={onOpenSettings}
        onModelChange={setSelectedModel}
        onCreateVersion={handleCreateVersion}
        onOpenCopyPaste={() => setCopyPasteOpen(true)}
        onCloseCopyPaste={() => setCopyPasteOpen(false)}
        onApplied={(result) => {
          void listQuery.refetch();
          if (result.version) {
            setSelectedTemplate(null);
            onOpenEditor(result.version.id);
          }
        }}
      />
    </div>
  );
}
