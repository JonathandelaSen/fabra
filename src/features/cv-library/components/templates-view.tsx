"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import {
  CV_TEMPLATES,
  type CVTemplateLocale,
} from "@/lib/cv-templates";
import {
  getStoredAIApiKey,
  getStoredAIProvider,
} from "@/lib/browser-preferences";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { useCVDocumentList } from "../hooks/use-cv-library-queries";
import { TemplatesSidebar } from "./templates-sidebar";
import { TemplateDetail } from "./template-detail";
import { motion } from "framer-motion";

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
  
  const hasAIApiKey = aiProvider === "mock" || aiApiKey.length > 0;
  const t = useTranslations("analysisFlow.templates");
  const tf = useTranslations("analysisFlow.forms");
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(CV_TEMPLATES[0]?.templateId ?? "");
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [locale, setLocale] = useState<CVTemplateLocale>("es");
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-pro-preview");
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

  const selectedTemplate = CV_TEMPLATES.find((t) => t.templateId === selectedTemplateId) ?? null;

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
    <FeatureScreenShell
      title={t("title")}
      bodyClassName="overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid h-full w-full gap-6 lg:grid-cols-[320px_1fr]"
      >
        <TemplatesSidebar
          templates={CV_TEMPLATES}
          selectedId={selectedTemplateId}
          onSelect={setSelectedTemplateId}
        />
        
        <TemplateDetail
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
          error={error}
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
              onOpenEditor(result.version.id);
            }
          }}
        />
      </motion.div>
    </FeatureScreenShell>
  );
}
