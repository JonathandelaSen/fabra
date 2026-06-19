"use client";

import { useCallback, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  normalizeStandardCVProfile,
  type StandardCVProfile,
} from "@/lib/cv-profile";
import type { CVTemplateLocale } from "@/lib/cv-templates";
import { getErrorMessage } from "@/lib/errors";
import {
  cvLibraryQueryKeys,
  useCVDocumentList,
  type CVDocumentListItem,
} from "@/frontend/features/cv-library";
import type { ApplyCVEditorCopyPasteResponse } from "@/app/api/cvs/[id]/edit/copy-paste/apply/responses";
import {
  applyInstruction as applyInstructionApi,
  createTemplateVersion as createTemplateVersionApi,
  saveAsCV as saveAsCVApi,
  updateLocale as updateLocaleApi,
  updatePublicSettings as updatePublicSettingsApi,
  normalizeCVResponse,
} from "../api/cv-editor-api";
import {
  getAIRequestConfigForProvider,
  type StoredAIProvider,
} from "@/lib/browser-preferences";

interface UseCVEditorMutationsInput {
  currentVersionId: string | null;
  currentProfile: StandardCVProfile | null;
  normalizedPublicSlug: string;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  selectedModel: string;
  savedProfileJsonRef: RefObject<string | null>;
  setEditedVersion: (v: CVDocumentListItem | null) => void;
  setProfile: (profile: StandardCVProfile, mode: "instant") => void;
  saveProfileToApi: (profile: StandardCVProfile | null) => Promise<boolean>;
  reloadPreview: () => void;
  setError: (error: string | null) => void;
  setPublicSlugDraft: (draft: { cvId: string | null; value: string }) => void;
}

function serializeProfile(profile: StandardCVProfile | null | undefined) {
  return JSON.stringify(profile ? normalizeStandardCVProfile(profile) : null);
}

export function useCVEditorMutations({
  currentVersionId,
  currentProfile,
  normalizedPublicSlug,
  aiProvider,
  aiApiKey,
  selectedModel,
  savedProfileJsonRef,
  setEditedVersion,
  setProfile,
  saveProfileToApi,
  reloadPreview,
  setError,
  setPublicSlugDraft,
}: UseCVEditorMutationsInput) {
  const t = useTranslations("cvEditor");
  const listQuery = useCVDocumentList();
  const queryClient = useQueryClient();

  const [editInstruction, setEditInstruction] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingAsCv, setSavingAsCv] = useState(false);
  const [savingLocale, setSavingLocale] = useState(false);
  const [changingTemplate, setChangingTemplate] = useState(false);
  const [savingPublicSettings, setSavingPublicSettings] = useState(false);

  const applyInstruction = useCallback(
    async (instruction?: string) => {
      const text = instruction ?? editInstruction;
      if (!currentVersionId) return;
      const aiConfig = getAIRequestConfigForProvider(aiProvider, aiApiKey, selectedModel);
      if (aiConfig.error) {
        setError(t("errors.missingApiKey"));
        return;
      }
      if (!text.trim()) return;

      setEditingProfile(true);
      setError(null);
      try {
        if (currentProfile && !(await saveProfileToApi(currentProfile))) return;

        const result = await applyInstructionApi({
          cvId: currentVersionId,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          baseUrl: aiConfig.baseUrl,
          model: aiConfig.model,
          instruction: text.trim(),
        });

        const normalized = result.version
          ? normalizeCVResponse(result.version)
          : null;
        const profile = normalized?.profile ?? null;
        if (profile) {
          savedProfileJsonRef.current = serializeProfile(profile);
          setProfile(profile, "instant");
        }
        if (normalized) setEditedVersion(normalized);
        setEditInstruction("");
        reloadPreview();
        void listQuery.refetch();
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setEditingProfile(false);
      }
    },
    [
      currentVersionId,
      currentProfile,
      editInstruction,
      aiProvider,
      aiApiKey,
      selectedModel,
      savedProfileJsonRef,
      setEditedVersion,
      setProfile,
      saveProfileToApi,
      reloadPreview,
      setError,
      listQuery,
      t,
    ],
  );

  const handleCopyPasteApplied = useCallback(
    (result: ApplyCVEditorCopyPasteResponse) => {
      if (result.version) {
        const normalized = normalizeCVResponse(result.version);
        const profile = normalized.profile ?? null;
        if (profile) {
          savedProfileJsonRef.current = serializeProfile(profile);
          setProfile(profile, "instant");
        }
        setEditedVersion(normalized);
        setEditInstruction("");
        reloadPreview();
        void listQuery.refetch();
      }
    },
    [
      savedProfileJsonRef,
      setProfile,
      setEditedVersion,
      reloadPreview,
      listQuery,
    ],
  );

  const saveAsCV = useCallback(
    async (name: string) => {
      if (!currentVersionId || !name.trim()) return;
      setSavingAsCv(true);
      try {
        await saveAsCVApi({ cvId: currentVersionId, name: name.trim() });
        void listQuery.refetch();
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setSavingAsCv(false);
      }
    },
    [currentVersionId, listQuery, setError],
  );

  const updateLocale = useCallback(
    async (nextLocale: CVTemplateLocale) => {
      if (!currentVersionId) return;
      setSavingLocale(true);
      setError(null);
      try {
        const updated = await updateLocaleApi({
          cvId: currentVersionId,
          locale: nextLocale,
        });
        setEditedVersion(updated);
        reloadPreview();
        void listQuery.refetch();
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setSavingLocale(false);
      }
    },
    [currentVersionId, setEditedVersion, reloadPreview, listQuery, setError],
  );

  const changeTemplate = useCallback(
    async (input: { templateId: string; locale: CVTemplateLocale }) => {
      if (!currentVersionId || !currentProfile) return null;
      setChangingTemplate(true);
      setError(null);
      try {
        if (!(await saveProfileToApi(currentProfile))) return null;
        const result = await createTemplateVersionApi({
          cvId: currentVersionId,
          templateId: input.templateId,
          locale: input.locale,
        });
        const version = normalizeCVResponse(result.version);
        setEditedVersion(version);
        queryClient.setQueryData<CVDocumentListItem[]>(
          cvLibraryQueryKeys.list(),
          (current) => [
            version,
            ...(current ?? []).filter((item) => item.id !== version.id),
          ],
        );
        queryClient.setQueryData(cvLibraryQueryKeys.detail(version.id), version);
        return version;
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        return null;
      } finally {
        setChangingTemplate(false);
      }
    },
    [
      currentVersionId,
      currentProfile,
      saveProfileToApi,
      setEditedVersion,
      queryClient,
      setError,
    ],
  );

  const updatePublicSettings = useCallback(
    async (enabled: boolean, confirmPublicExposure = false) => {
      if (!currentVersionId || !normalizedPublicSlug) return;
      setSavingPublicSettings(true);
      setError(null);
      try {
        const updated = await updatePublicSettingsApi({
          cvId: currentVersionId,
          enabled,
          slug: normalizedPublicSlug,
          confirmPublicExposure,
        });
        setEditedVersion(updated);
        setPublicSlugDraft({
          cvId: updated.id,
          value: updated.publicSlug ?? normalizedPublicSlug,
        });
        void listQuery.refetch();
        return true;
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setSavingPublicSettings(false);
      }
    },
    [
      currentVersionId,
      normalizedPublicSlug,
      setEditedVersion,
      setPublicSlugDraft,
      listQuery,
      setError,
    ],
  );

  return {
    editInstruction,
    setEditInstruction,
    editingProfile,
    savingAsCv,
    savingLocale,
    changingTemplate,
    savingPublicSettings,
    applyInstruction,
    handleCopyPasteApplied,
    saveAsCV,
    changeTemplate,
    updateLocale,
    updatePublicSettings,
  };
}
