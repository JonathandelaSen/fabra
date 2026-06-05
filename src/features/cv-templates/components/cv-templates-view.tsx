"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CV_TEMPLATES, type CVTemplateLocale } from "@/lib/cv-templates";
import {
  getAIRequestConfigForProvider,
  getStoredAIApiKey,
  getStoredAIProvider,
  type StoredAIProvider,
} from "@/lib/browser-preferences";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { useCVDocumentList } from "@/features/cv-library";
import { useCreateCVTemplateVersion } from "../hooks/use-cv-template-mutations";
import { CVTemplatesSidebar } from "./cv-templates-sidebar";
import { CVTemplateDetail } from "./cv-template-detail";
import { shouldShowCVTemplatesLoader } from "./cv-templates-loading-state";
import { CVTemplatesSkeleton } from "./cv-templates-skeleton";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";

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
  const searchParams = useSearchParams();
  const listQuery = useCVDocumentList();
  const cvs = listQuery.data ?? [];
  const aiProviderValue = getStoredAIProvider();
  const aiApiKey = getStoredAIApiKey();

  const hasAIApiKey = aiProviderValue === "mock" || aiApiKey.length > 0;
  const t = useTranslations("analysisFlow.templates");
  const templateIdFromPath = pathname.split("/").filter(Boolean)[1] ?? null;
  const cvIdFromQuery = searchParams.get("cvId");

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    templateIdFromPath,
  );
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [locale, setLocale] = useState<CVTemplateLocale>("es");
  const [searchQuery, setSearchQuery] = useState("");
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<StoredAIProvider>(aiProviderValue);
  const [selectedModel, setSelectedModel] =
    useState<string>(DEFAULT_GEMINI_MODEL);
  const createVersion = useCreateCVTemplateVersion({
    onCreated: (version) => onOpenEditor(version.id),
  });
  const isResolvingCvs = listQuery.isFetching;

  const filteredCvs = cvs.filter(
    (cv) =>
      cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cv.filename ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedTemplate =
    CV_TEMPLATES.find(
      (template) => template.templateId === selectedTemplateId,
    ) ?? null;

  useEffect(() => {
    setSelectedTemplateId(templateIdFromPath);
  }, [templateIdFromPath]);

  useEffect(() => {
    const firstTemplateId = CV_TEMPLATES[0]?.templateId;
    if (pathname === "/templates" && firstTemplateId) {
      const query = cvIdFromQuery
        ? `?cvId=${encodeURIComponent(cvIdFromQuery)}`
        : "";
      router.replace(
        `/templates/${encodeURIComponent(firstTemplateId)}${query}`,
      );
    }
  }, [cvIdFromQuery, pathname, router]);

  useEffect(() => {
    if (!cvIdFromQuery || selectedCvId) return;
    if (cvs.some((cv) => cv.id === cvIdFromQuery)) {
      setSelectedCvId(cvIdFromQuery);
    }
  }, [cvIdFromQuery, cvs, selectedCvId]);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const queryCvId = selectedCvId || cvIdFromQuery;
    const query = queryCvId
      ? `?cvId=${encodeURIComponent(queryCvId)}`
      : "";
    router.push(`/templates/${encodeURIComponent(templateId)}${query}`);
  };

  const handleCreateVersion = async () => {
    if (!selectedTemplate || !selectedCvId) return;

    const aiConfig = getAIRequestConfigForProvider(
      selectedProvider || aiProviderValue,
      aiApiKey,
      selectedModel,
    );
    if (aiConfig.error) {
      alert(aiConfig.error);
      onOpenSettings();
      return;
    }

    createVersion.create({
      cvId: selectedCvId,
      templateId: selectedTemplate.templateId,
      locale,
      provider: aiConfig.provider,
      apiKey: aiConfig.apiKey,
      baseUrl: aiConfig.baseUrl,
      model: aiConfig.model,
    });
  };

  return (
    <FeatureScreenShell title={t("title")} bodyClassName="overflow-hidden">
      {shouldShowCVTemplatesLoader({
        isResolvingCvs,
        pathname,
        templateCount: CV_TEMPLATES.length,
        templateId: templateIdFromPath,
      }) ? (
        <CVTemplatesSkeleton />
      ) : (
        <div className="grid h-full w-full gap-6 lg:grid-cols-[320px_1fr]">
          <CVTemplatesSidebar
            templates={CV_TEMPLATES}
            selectedId={selectedTemplateId}
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
        </div>
      )}
    </FeatureScreenShell>
  );
}
