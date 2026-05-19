"use client";

import { useCallback, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";
import {
  normalizeStandardCVProfile,
  type StandardCVProfile,
} from "@/lib/cv-profile";
import type { CVTemplateLocale } from "@/lib/cv-templates";
import { getErrorMessage } from "@/lib/errors";
import {
  useCVDocumentList,
  type CVDocumentListItem,
} from "@/features/cv-library";
import {
  applyInstruction as applyInstructionApi,
  saveAsCV as saveAsCVApi,
  updateLocale as updateLocaleApi,
  updatePublicSettings as updatePublicSettingsApi,
} from "../api/cv-editor-api";

interface UseCVEditorMutationsInput {
  currentVersionId: string | null;
  currentProfile: StandardCVProfile | null;
  normalizedPublicSlug: string;
  aiProvider: string;
  aiApiKey: string;
  selectedModel: string;
  hasAIApiKey: boolean;
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
  hasAIApiKey,
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

  const [editInstruction, setEditInstruction] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingAsCv, setSavingAsCv] = useState(false);
  const [savingLocale, setSavingLocale] = useState(false);
  const [savingPublicSettings, setSavingPublicSettings] = useState(false);

  const applyInstruction = useCallback(
    async (instruction?: string) => {
      const text = instruction ?? editInstruction;
      if (!currentVersionId) return;
      if (!hasAIApiKey) {
        setError(t("errors.missingApiKey"));
        return;
      }
      if (!text.trim()) return;

      setEditingProfile(true);
      setError(null);
      try {
        if (currentProfile && !(await saveProfileToApi(currentProfile))) return;

        const { version, profile } = await applyInstructionApi({
          cvId: currentVersionId,
          provider: aiProvider,
          apiKey: aiApiKey,
          model: selectedModel,
          instruction: text.trim(),
        });

        if (profile) {
          savedProfileJsonRef.current = serializeProfile(profile);
          setProfile(profile, "instant");
        }
        setEditedVersion(version);
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
      hasAIApiKey,
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
    savingPublicSettings,
    applyInstruction,
    saveAsCV,
    updateLocale,
    updatePublicSettings,
  };
}
