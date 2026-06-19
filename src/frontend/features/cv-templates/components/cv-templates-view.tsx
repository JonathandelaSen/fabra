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
} from "@/frontend/utils/browser-preferences";
import { FeatureScreenShell } from "@/frontend/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/frontend/components/shared/feature-two-pane-layout";
import { useIsDesktopLayout } from "@/frontend/components/shared/use-is-desktop-layout";
import { useCVDocumentList } from "@/frontend/features/cv-library";
import { useCreateCVTemplateVersion } from "../hooks/use-cv-template-mutations";
import { CVTemplatesSidebar } from "./cv-templates-sidebar";
import { CVTemplateDetail } from "./cv-template-detail";
import {
  resolveActiveTemplateId,
  shouldShowCVTemplatesLoader,
} from "./cv-templates-loading-state";
import { CVTemplatesSkeleton } from "./cv-templates-skeleton";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";

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
  const templateIdFromPath = resolveActiveTemplateId(
    pathname,
    CV_TEMPLATES.map((template) => template.templateId),
  );
  const cvIdFromQuery = searchParams.get("cvId");

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    templateIdFromPath,
  );
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [locale, setLocale] = useState<CVTemplateLocale>("es");
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<StoredAIProvider>(aiProviderValue);
  const [selectedModel, setSelectedModel] =
    useState<string>(DEFAULT_GEMINI_MODEL);
  const createVersion = useCreateCVTemplateVersion({
    onCreated: (version) => onOpenEditor(version.id),
  });
  const isCvsPending = listQuery.isPending;
  const isDesktopLayout = useIsDesktopLayout();
  const showTemplatesLoader =
    (isDesktopLayout || pathname !== "/templates") &&
    shouldShowCVTemplatesLoader({
      isCvsPending,
      pathname,
      templateCount: CV_TEMPLATES.length,
      templateId: selectedTemplateId,
    });

  const selectedTemplate =
    CV_TEMPLATES.find(
      (template) => template.templateId === selectedTemplateId,
    ) ?? null;

  useEffect(() => {
    setSelectedTemplateId(templateIdFromPath);
  }, [templateIdFromPath]);

  useEffect(() => {
    const firstTemplateId = CV_TEMPLATES[0]?.templateId;
    if (isDesktopLayout && pathname === "/templates" && firstTemplateId) {
      const query = cvIdFromQuery
        ? `?cvId=${encodeURIComponent(cvIdFromQuery)}`
        : "";
      router.replace(
        `/templates/${encodeURIComponent(firstTemplateId)}${query}`,
      );
    }
  }, [cvIdFromQuery, isDesktopLayout, pathname, router]);

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

  const handleBackToList = () => {
    const query = cvIdFromQuery
      ? `?cvId=${encodeURIComponent(cvIdFromQuery)}`
      : "";
    router.push(`/templates${query}`);
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
    <FeatureScreenShell
      title={t("title")}
      mobileBackActive={Boolean(templateIdFromPath)}
      onMobileBack={handleBackToList}
      bodyClassName="overflow-hidden"
    >
      {showTemplatesLoader ? (
        <CVTemplatesSkeleton />
      ) : (
        <FeatureTwoPaneLayout
          mobileDetailActive={templateIdFromPath ? true : false}
          columnsClassName="lg:grid-cols-[800px_minmax(0,1fr)]"
          sidebar={
            <CVTemplatesSidebar
              templates={CV_TEMPLATES}
              selectedId={selectedTemplateId}
              locale={locale}
              onSelect={handleSelectTemplate}
            />
          }
        >
            <CVTemplateDetail
              template={selectedTemplate}
              cvs={cvs}
              selectedCvId={selectedCvId}
              locale={locale}
              hasAIApiKey={hasAIApiKey}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            selectedModel={selectedModel}
            creating={createVersion.isPending}
            copyPasteOpen={copyPasteOpen}
            error={createVersion.errorMessage}
              onSelectCv={setSelectedCvId}
              onLocaleChange={setLocale}
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
        </FeatureTwoPaneLayout>
      )}
    </FeatureScreenShell>
  );
}
