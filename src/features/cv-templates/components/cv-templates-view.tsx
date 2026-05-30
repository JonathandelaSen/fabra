"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  CV_TEMPLATES,
  type CVTemplateLocale,
} from "@/lib/cv-templates";
import {
  getStoredAIApiKey,
  getStoredAIProvider,
} from "@/lib/browser-preferences";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { useCVDocumentList } from "@/features/cv-library";
import { useCreateCVTemplateVersion } from "../hooks/use-cv-template-mutations";
import { CVTemplatesSidebar } from "./cv-templates-sidebar";
import { CVTemplateDetail } from "./cv-template-detail";
import { motion } from "framer-motion";
import { DEFAULT_GEMINI_MODEL, DEFAULT_FAST_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";

interface CVTemplatesViewProps {
  onOpenSettings: () => void;
  onOpenEditor: (versionId: string) => void;
  onOpenUpload: () => void;
}

export default function CVTemplatesView({
  onOpenSettings,
  onOpenEditor,
  onOpenUpload,
}: CVTemplatesViewProps) {
  const pathname = usePathname();
  const router = useRouter();
  const listQuery = useCVDocumentList();
  const cvs = listQuery.data ?? [];
  const aiProvider = getStoredAIProvider();
  const aiApiKey = getStoredAIApiKey();
  
  const hasAIApiKey = aiProvider === "mock" || aiApiKey.length > 0;
  const t = useTranslations("analysisFlow.templates");
  const tf = useTranslations("analysisFlow.forms");
  const templateIdFromPath = pathname.split("/").filter(Boolean)[1] ?? null;
  
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [locale, setLocale] = useState<CVTemplateLocale>("es");
  const [searchQuery, setSearchQuery] = useState("");
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const createVersion = useCreateCVTemplateVersion({
    onCreated: (version) => onOpenEditor(version.id),
  });

  const models = [
    { id: "gemini-2.5-flash", label: `${GEMINI_MODELS["gemini-2.5-flash"]} (${tf("fast")})` },
    { id: "gemini-3.1-pro-preview", label: `${GEMINI_MODELS["gemini-3.1-pro-preview"]} (${tf("powerful")})` },
  ];

  const filteredCvs = cvs.filter(
    (cv) =>
      cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cv.filename ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedTemplate = CV_TEMPLATES.find((template) => template.templateId === templateIdFromPath) ?? null;

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/templates/${encodeURIComponent(templateId)}`);
  };

  const handleCreateVersion = async () => {
    if (!selectedTemplate || !selectedCvId) return;

    createVersion.create({
      cvId: selectedCvId,
      templateId: selectedTemplate.templateId,
      locale,
      provider: aiProvider,
      apiKey: aiApiKey,
      model: selectedModel,
    });
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
        <CVTemplatesSidebar
          templates={CV_TEMPLATES}
          selectedId={templateIdFromPath}
          onSelect={handleSelectTemplate}
        />
        
        <CVTemplateDetail
          template={selectedTemplate}
          cvs={cvs}
          filteredCvs={filteredCvs}
          selectedCvId={selectedCvId}
          locale={locale}
          searchQuery={searchQuery}
          hasAIApiKey={hasAIApiKey}
          selectedModel={selectedModel}
          models={models}
          creating={createVersion.isPending}
          copyPasteOpen={copyPasteOpen}
          error={createVersion.errorMessage}
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
