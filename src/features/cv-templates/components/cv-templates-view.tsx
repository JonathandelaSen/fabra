"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  CV_TEMPLATES,
  type CVTemplateLocale,
} from "@/lib/cv-templates";
import {
  getAIApiKeyForProvider,
  getStoredAIApiKey,
  getStoredAIProvider,
  type StoredAIProvider,
} from "@/lib/browser-preferences";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { useCVDocumentList } from "@/features/cv-library";
import { useCreateCVTemplateVersion } from "../hooks/use-cv-template-mutations";
import { CVTemplatesSidebar } from "./cv-templates-sidebar";
import { CVTemplateDetail } from "./cv-template-detail";
import { motion } from "framer-motion";
import { DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";

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
  const aiProviderValue = getStoredAIProvider();
  const aiApiKey = getStoredAIApiKey();
  
  const hasAIApiKey = aiProviderValue === "mock" || aiApiKey.length > 0;
  const t = useTranslations("analysisFlow.templates");
  const tf = useTranslations("analysisFlow.forms");
  const templateIdFromPath = pathname.split("/").filter(Boolean)[1] ?? null;
  
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [locale, setLocale] = useState<CVTemplateLocale>("es");
  const [searchQuery, setSearchQuery] = useState("");
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<StoredAIProvider>(aiProviderValue);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const createVersion = useCreateCVTemplateVersion({
    onCreated: (version) => onOpenEditor(version.id),
  });

  const filteredCvs = cvs.filter(
    (cv) =>
      cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cv.filename ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedTemplate = CV_TEMPLATES.find((template) => template.templateId === templateIdFromPath) ?? null;

  useEffect(() => {
    const firstTemplateId = CV_TEMPLATES[0]?.templateId;
    if (pathname === "/templates" && firstTemplateId) {
      router.replace(`/templates/${encodeURIComponent(firstTemplateId)}`);
    }
  }, [pathname, router]);

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/templates/${encodeURIComponent(templateId)}`);
  };

  const handleCreateVersion = async () => {
    if (!selectedTemplate || !selectedCvId) return;

    createVersion.create({
      cvId: selectedCvId,
      templateId: selectedTemplate.templateId,
      locale,
      provider: selectedProvider || aiProviderValue,
      apiKey: getAIApiKeyForProvider(selectedProvider || aiProviderValue, aiApiKey),
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
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          selectedModel={selectedModel}
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
