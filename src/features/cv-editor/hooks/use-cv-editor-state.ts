import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCVTemplate, type CVTemplateLocale } from "@/lib/cv-templates";
import {
  normalizeStandardCVProfile,
  type StandardCVProfile,
} from "@/lib/cv-profile";
import {
  getStoredAIApiKey,
  getStoredAIModel,
  getStoredAIProvider,
  type StoredAIProvider,
} from "@/lib/browser-preferences";
import {
  buildPublicCVPath,
  normalizePublicCVSlug,
  useCVDocumentList,
  type CVDocumentListItem,
} from "@/features/cv-library";
import { useProfileHistory } from "./use-profile-history";
import { cvEditorKeys } from "../api/cv-editor-query-keys";
import { fetchRecommendations, saveProfile as saveProfileApi } from "../api/cv-editor-api";
import { getErrorMessage } from "@/lib/errors";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";

function serializeProfile(profile: StandardCVProfile | null | undefined) {
  return JSON.stringify(profile ? normalizeStandardCVProfile(profile) : null);
}

export function useCVEditorState(activeVersionId: string | null) {
  const listQuery = useCVDocumentList();
  const allCvs = listQuery.data ?? [];
  const templateCvs = allCvs.filter((c) => c.type === "template");
  const hasOriginalCVs = allCvs.some((c) => c.type === "uploaded");

  const aiProvider = getStoredAIProvider();
  const aiApiKey = getStoredAIApiKey();
  const aiModel = getStoredAIModel();
  const hasAIApiKey = aiProvider === "mock" || aiApiKey.length > 0;

  const [editedVersion, setEditedVersion] = useState<CVDocumentListItem | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<StoredAIProvider>("gemini");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);

  const activeHistoryCvIdRef = useRef<string | null>(null);
  const savedProfileJsonRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentVersionId = activeVersionId;
  const currentVersionFromList = useMemo(
    () => currentVersionId ? (templateCvs.find((v) => v.id === currentVersionId) ?? null) : null,
    [templateCvs, currentVersionId],
  );

  const currentVersion = editedVersion?.id === currentVersionFromList?.id ? editedVersion : currentVersionFromList;
  const currentVersionIdForSave = currentVersion?.id ?? null;
  const activeTemplate = currentVersion?.templateId ? getCVTemplate(currentVersion.templateId) : null;
  const locale = (currentVersion?.templateLocale ?? "es") as CVTemplateLocale;

  const {
    present: historyProfile,
    canUndo,
    canRedo,
    reset: resetProfileHistory,
    setProfile,
    undo,
    redo,
  } = useProfileHistory(currentVersion?.profile ?? null);

  const currentProfile = historyProfile ?? currentVersion?.profile ?? null;
  const currentProfileJson = serializeProfile(currentProfile);
  const previewSrc = currentVersion?.id ? `/api/cvs/${currentVersion.id}/template-pdf?v=${previewVersion}` : "";

  const defaultPublicSlug = currentVersion?.publicSlug ?? normalizePublicCVSlug(currentVersion?.name) ?? "";
  const [publicSlugDraft, setPublicSlugDraft] = useState<{ cvId: string | null; value: string }>({ cvId: null, value: "" });
  const publicSlug = publicSlugDraft.cvId === currentVersion?.id ? publicSlugDraft.value : defaultPublicSlug;
  const normalizedPublicSlug = normalizePublicCVSlug(publicSlug || currentVersion?.name) ?? "";
  const savedPublicSlug = currentVersion?.publicSlug ?? "";
  const hasPublicSlugChanges = Boolean(currentVersion?.publicEnabled && normalizedPublicSlug && normalizedPublicSlug !== savedPublicSlug);
  const sharePublicSlug = currentVersion?.publicEnabled && hasPublicSlugChanges ? savedPublicSlug : normalizedPublicSlug;
  const publicPath = currentVersion?.publicId && sharePublicSlug ? buildPublicCVPath(currentVersion.publicId, sharePublicSlug) : "";
  const publicDraftPath = currentVersion?.publicId && normalizedPublicSlug ? buildPublicCVPath(currentVersion.publicId, normalizedPublicSlug) : "";
  const publicUrl = typeof window !== "undefined" && publicPath ? `${window.location.origin}${publicPath}` : publicPath;
  const publicDraftUrl = typeof window !== "undefined" && publicDraftPath ? `${window.location.origin}${publicDraftPath}` : publicDraftPath;

  const recommendationsQuery = useQuery({
    queryKey: cvEditorKeys.recommendations(currentVersion?.sourceCvId),
    queryFn: () => fetchRecommendations(currentVersion!.sourceCvId!),
    enabled: !!currentVersion?.sourceCvId,
  });

  const reloadPreview = useCallback(() => {
    setPreviewVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (!currentVersion?.id || !currentVersion.profile) return;
    const incomingJson = serializeProfile(currentVersion.profile);
    const isNewCV = activeHistoryCvIdRef.current !== currentVersion.id;
    const isExternalProfileChange = incomingJson !== savedProfileJsonRef.current && currentProfileJson === savedProfileJsonRef.current;
    if (isNewCV || isExternalProfileChange) {
      activeHistoryCvIdRef.current = currentVersion.id;
      savedProfileJsonRef.current = incomingJson;
      resetProfileHistory(currentVersion.profile);
      setSaveState("idle");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    }
  }, [currentProfileJson, currentVersion?.id, currentVersion?.profile, resetProfileHistory]);

  const saveProfileToApi = useCallback(
    async (profile: StandardCVProfile | null) => {
      if (!currentVersionIdForSave || !profile) return false;
      const normalized = normalizeStandardCVProfile(profile);
      const json = JSON.stringify(normalized);
      if (json === savedProfileJsonRef.current) return true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveState("saving");
      try {
        const updated = await saveProfileApi({ cvId: currentVersionIdForSave, profile });
        savedProfileJsonRef.current = json;
        setEditedVersion(updated);
        setSaveState("saved");
        reloadPreview();
        void listQuery.refetch();
        return true;
      } catch (err: unknown) {
        setSaveState("idle");
        setError(getErrorMessage(err));
        return false;
      }
    },
    [currentVersionIdForSave, listQuery, reloadPreview],
  );

  useEffect(() => {
    if (!currentVersion?.id || !currentProfile) return;
    if (currentProfileJson === savedProfileJsonRef.current) return;
    setSaveState("idle");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveProfileToApi(currentProfile);
    }, 1500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [currentProfile, currentProfileJson, currentVersion?.id, saveProfileToApi]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isUndoKey = event.key.toLowerCase() === "z";
      const isRedoKey = event.key.toLowerCase() === "y";
      const hasModifier = event.metaKey || event.ctrlKey;
      if (!hasModifier) return;
      if (isUndoKey && event.shiftKey && canRedo) { event.preventDefault(); redo(); return; }
      if (isUndoKey && !event.shiftKey && canUndo) { event.preventDefault(); undo(); return; }
      if (isRedoKey && event.ctrlKey && canRedo) { event.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canRedo, canUndo, redo, undo]);

  const handleManualChange = useCallback(
    (updater: (prev: StandardCVProfile) => StandardCVProfile) => {
      setProfile(updater, "manual");
    },
    [setProfile],
  );

  return {
    templateCvs,
    hasOriginalCVs,
    aiProvider,
    aiApiKey,
    aiModel,
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
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    editedVersion,
    setEditedVersion,
    setProfile,
    saveProfileToApi,
    reloadPreview,
    listQuery,
    recommendationAnalysis: recommendationsQuery.data ?? null,
    handleManualChange,
    publicSlug,
    normalizedPublicSlug,
    publicUrl,
    publicDraftUrl,
    hasPublicSlugChanges,
    publicSlugDraft,
    setPublicSlugDraft,
    savedProfileJsonRef,
  };
}
