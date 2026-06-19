"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import { getErrorMessage } from "@/lib/errors";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import type { CVDocumentSummaryResponse } from "@/app/api/cvs/responses";
import {
  NewJobMatchCVSourceSelector,
  type CVSource,
} from "./new-job-match-cv-source";
import { NewJobMatchExistingCVSelector } from "./new-job-match-existing-cv-selector";
import { NewJobMatchJsonResumeSelector } from "./new-job-match-json-resume-selector";
import { NewJobMatchUploadCVSelector } from "./new-job-match-upload-cv-selector";
import { NewJobMatchOfferForm } from "./new-job-match-offer-form";

interface NewJobMatchFlowProps {
  cvs: CVDocumentSummaryResponse[];
  defaultProvider: StoredAIProvider;
  defaultModel: string;
  hasAIApiKey: boolean;
  isCreating: boolean;
  isUploading: boolean;
  isScoring: boolean;
  error: string | null;
  onCreateCV: (file: File, name: string) => Promise<string>;
  onRunIntegrated: (input: {
    cvId: string;
    title: string;
    jobDescription: string;
    jobUrl: string | null;
    provider: StoredAIProvider;
    model: string;
  }) => Promise<void>;
  onOpenCopyPaste: (input: {
    cvId: string;
    title: string;
    jobDescription: string;
    jobUrl: string | null;
    model: string;
  }) => Promise<void>;
  onOpenSettings: () => void;
}

export default function NewJobMatchFlow({
  cvs,
  defaultProvider,
  defaultModel,
  hasAIApiKey,
  isCreating,
  isUploading,
  isScoring,
  error,
  onCreateCV,
  onRunIntegrated,
  onOpenCopyPaste,
  onOpenSettings,
}: NewJobMatchFlowProps) {
  const t = useTranslations("analysisFlow.newOffer");
  const [cvDraft, setCvDraft] = useState<{
    source: CVSource;
    selectedCvId: string;
    file: File | null;
    cvName: string;
    jsonResumeCvId: string | null;
  }>({
    source: cvs.length > 0 ? "existing" : "upload",
    selectedCvId: cvs[0]?.id ?? "",
    file: null,
    cvName: "",
    jsonResumeCvId: null,
  });
  const [offerDraft, setOfferDraft] = useState({
    title: "",
    jobDescription: "",
    jobUrl: "",
  });
  const [aiDraft, setAiDraft] = useState({
    provider: defaultProvider,
    model: defaultModel,
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const busy = isCreating || isUploading || isScoring;
  const activeSelectedCvId = cvDraft.selectedCvId || (cvs[0]?.id ?? "");

  const getSelectedCvId = async () => {
    if (cvDraft.source === "existing") return activeSelectedCvId;
    if (cvDraft.source === "json_resume") return cvDraft.jsonResumeCvId ?? "";
    if (!cvDraft.file) return "";
    return onCreateCV(
      cvDraft.file,
      cvDraft.cvName.trim() || cvDraft.file.name.replace(/\.pdf$/i, ""),
    );
  };

  const validate = () => {
    if (cvDraft.source === "existing" && !activeSelectedCvId) {
      return t("chooseSource");
    }
    if (cvDraft.source === "upload" && !cvDraft.file) return t("selectPdf");
    if (cvDraft.source === "json_resume" && !cvDraft.jsonResumeCvId) {
      return t("importJsonResumeFirst");
    }
    if (!offerDraft.title.trim()) return t("titleRequired");
    if (!offerDraft.jobDescription.trim()) return t("jobDescriptionRequired");
    return null;
  };

  const buildInput = async () => {
    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return null;
    }

    try {
      const cvId = await getSelectedCvId();
      if (!cvId) {
        setLocalError(t("chooseSource"));
        return null;
      }
      setLocalError(null);
      return {
        cvId,
        title: offerDraft.title.trim(),
        jobDescription: offerDraft.jobDescription.trim(),
        jobUrl: offerDraft.jobUrl.trim() || null,
      };
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err));
      return null;
    }
  };

  const runIntegrated = async () => {
    const input = await buildInput();
    if (!input) return;
    await onRunIntegrated({
      ...input,
      provider: aiDraft.provider,
      model: aiDraft.model,
    });
  };

  const openCopyPaste = async () => {
    const input = await buildInput();
    if (!input) return;
    await onOpenCopyPaste({
      ...input,
      model: aiDraft.model,
    });
  };

  const shownError = localError ?? error;

  return (
    <div className="h-full w-full overflow-y-auto py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto flex w-full max-w-5xl flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-text-main">{t("title")}</h1>
        </div>

        <NewJobMatchCVSourceSelector
          cvs={cvs}
          source={cvDraft.source}
          onSourceChange={(source) =>
            setCvDraft((draft) => ({ ...draft, source }))
          }
        />

        {cvDraft.source === "existing" ? (
          <NewJobMatchExistingCVSelector
            cvs={cvs}
            selectedCvId={activeSelectedCvId}
            onSelectedCvIdChange={(selectedCvId) =>
              setCvDraft((draft) => ({ ...draft, selectedCvId }))
            }
          />
        ) : cvDraft.source === "json_resume" ? (
          <NewJobMatchJsonResumeSelector
            importedCvId={cvDraft.jsonResumeCvId}
            onImported={(jsonResumeCvId) =>
              setCvDraft((draft) => ({ ...draft, jsonResumeCvId }))
            }
          />
        ) : (
          <NewJobMatchUploadCVSelector
            file={cvDraft.file}
            cvName={cvDraft.cvName}
            onFileChange={(nextFile, fileError) => {
              setCvDraft((draft) => ({ ...draft, file: nextFile }));
              setLocalError(fileError);
            }}
            onCvNameChange={(cvName) =>
              setCvDraft((draft) => ({ ...draft, cvName }))
            }
          />
        )}

        <NewJobMatchOfferForm
          title={offerDraft.title}
          jobUrl={offerDraft.jobUrl}
          jobDescription={offerDraft.jobDescription}
          onTitleChange={(title) =>
            setOfferDraft((draft) => ({ ...draft, title }))
          }
          onJobUrlChange={(jobUrl) =>
            setOfferDraft((draft) => ({ ...draft, jobUrl }))
          }
          onJobDescriptionChange={(jobDescription) =>
            setOfferDraft((draft) => ({ ...draft, jobDescription }))
          }
        />

        {shownError && (
          <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>
            {shownError}
          </AlertBanner>
        )}

        <div className="flex justify-end">
          <AIActionLauncher
            actionLabel={t("compare")}
            loading={busy}
            disabled={busy || !offerDraft.jobDescription.trim()}
            integrated={{
              available: hasAIApiKey,
              selectedProvider: aiDraft.provider,
              onProviderChange: (provider) =>
                setAiDraft((draft) => ({ ...draft, provider })),
              selectedModelId: aiDraft.model,
              onModelChange: (model) =>
                setAiDraft((draft) => ({ ...draft, model })),
              onRun: () => void runIntegrated(),
              onConfigure: onOpenSettings,
            }}
            copyPaste={{
              available: true,
              onOpenFlow: () => void openCopyPaste(),
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
