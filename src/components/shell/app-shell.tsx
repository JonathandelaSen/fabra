"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AnalysisSummary } from "@/lib/analysis-types";
import Sidebar from "@/components/shell/sidebar";
import { CVEditorView } from "@/features/cv-editor";
import { CVLibraryView, TemplatesView } from "@/features/cv-library";
import { CVAnalysisView } from "@/features/cv-analysis";
import { InterviewQuestionsView } from "@/features/interview-questions";
import { WorkJournalView } from "@/features/work-journal";
import { ObjectivesView } from "@/features/objectives";
import { FeedbackNotesView } from "@/features/feedback-notes";
import { ReceivedFeedbackView } from "@/features/received-feedback";
import { ActivityContextView } from "@/features/activity-context";
import { AdminObservabilityView } from "@/features/admin-observability";
import ExtractionView from "@/features/cv-analysis/components/extraction-view";
import AIAnalysisView from "@/features/cv-analysis/components/analysis-view";
import { JobMatchAnalysisView } from "@/features/job-match-analysis";
import { SettingsView } from "@/features/settings";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { AnalysisDetailSkeleton } from "@/components/shared/skeletons";
import { createClient } from "@/lib/supabase/client";
import { normalizeAnalysisSummaries } from "@/components/shell/analysis-summary-normalizer";
import type {
  AnalysisMode,
  AIContext,
  OfferStatus,
} from "@/lib/analysis-types";
import type { CVDocumentSummaryResponse as CVSummary } from "@/modules/cv-library/client";
import type { ListCVDocumentsResponse } from "@/app/api/cvs/responses";
import type { InterviewQuestionResponse as InterviewQuestionSummary } from "@/app/api/interview-questions/responses";
import {
  getStoredAIApiKey,
  getStoredAIModel,
  getStoredAIProvider,
  type StoredAIProvider,
} from "@/lib/browser-preferences";

let userEmailRequest: Promise<string | null> | null = null;
let adminStatusRequest: Promise<boolean> | null = null;

function loadUserEmail() {
  userEmailRequest ??= createClient()
    .auth.getUser()
    .then(({ data }) => data.user?.email ?? null)
    .catch(() => null);
  return userEmailRequest;
}

function loadAdminStatus() {
  adminStatusRequest ??= fetch("/api/admin/me")
    .then((res) => (res.ok ? res.json() : { isAdmin: false }))
    .then((data) => Boolean(data.isAdmin))
    .catch(() => false);
  return adminStatusRequest;
}

type ViewTab = "extraction" | "analysis";
type AppView =
  | "new"
  | "analysis"
  | "cv-analyses"
  | "job-analyses"
  | "cvs"
  | "templates"
  | "editor"
  | "questions"
  | "journal"
  | "objectives"
  | "received-feedback"
  | "activity-context"
  | "feedback-notes"
  | "settings"
  | "admin";

interface FullAnalysis {
  id: string;
  cv_id: string | null;
  cv: {
    id: string;
    name: string;
    filename: string;
    type?: string;
  } | null;
  title: string;
  filename: string;
  file_size: number | null;
  created_at: string;
  updated_at: string;
  text_python: string | null;
  text_pdfjs: string | null;
  text_node: string | null;
  extract_error_python: string | null;
  extract_error_pdfjs: string | null;
  extract_error_node: string | null;
  analysis_mode: AnalysisMode;
  ai_model: string | null;
  job_description: string | null;
  job_url: string | null;
  offer_status: OfferStatus | null;
  offer_notes: string | null;
  offer_next_action: string | null;
  offer_next_action_at: string | null;
  ai_context: AIContext | null;
  ai_score: number | null;
  ai_feedback: string | null;
  ai_keywords: string | null;
  ai_improvements: string | null;
  job_key_data: string | null;
  job_keywords: string | null;
  cv_keywords: string | null;
  matching_keywords: string | null;
  missing_keywords: string | null;
  ai_analyzed_at: string | null;
}

function toLegacyCVSummary(cv: ListCVDocumentsResponse[number]): CVSummary {
  return {
    id: cv.id,
    name: cv.name,
    filename: cv.filename,
    file_size: cv.fileSize,
    type: cv.type,
    source_cv_id: cv.sourceCvId,
    template_id: cv.templateId,
    template_locale: cv.templateLocale,
    profile: cv.profile,
    public_enabled: cv.publicEnabled,
    public_id: cv.publicId,
    public_slug: cv.publicSlug,
    public_published_at: cv.publicPublishedAt,
    created_at: cv.createdAt,
    updated_at: cv.updatedAt,
  };
}

interface AppShellProps {
  initialView?: AppView;
  initialUserEmail?: string | null;
  initialIsAdmin?: boolean;
}

export default function AppShell({
  initialView = "cv-analyses",
  initialUserEmail = null,
  initialIsAdmin = false,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analysisFlow = useTranslations("analysisFlow.appShell");
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [analysesLoading, setAnalysesLoading] = useState(true);
  const [cvs, setCVs] = useState<CVSummary[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<
    InterviewQuestionSummary[]
  >([]);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<FullAnalysis | null>(
    null,
  );
  const tabFromUrl = searchParams.get("tab") as ViewTab | null;
  const viewTab: ViewTab = tabFromUrl || (activeAnalysis?.ai_score !== null && activeAnalysis?.ai_score !== undefined ? "analysis" : "extraction");

  const setViewTab = (tab: ViewTab) => {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };
  const [activeView, setActiveView] = useState<AppView>(initialView);
  const [activeEditorCvId, setActiveEditorCvId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [aiProvider, setAIProvider] = useState<StoredAIProvider>("gemini");
  const [aiApiKey, setAIApiKey] = useState("");
  const [aiModel, setAIModel] = useState("gemini-3.1-pro-preview");
  const lastFeedbackNotesHrefRef = useRef("/feedback-notes");
  const lastReceivedFeedbackHrefRef = useRef("/received-feedback");
  const lastWorkJournalHrefRef = useRef("/work-journal");
  const lastObjectivesHrefRef = useRef("/objectives");
  const lastInterviewQuestionsHrefRef = useRef("/interview-questions");
  const lastCVAnalysesHrefRef = useRef("/cv-analysis");
  const lastJobAnalysesHrefRef = useRef("/job-analyses");
  const lastCVLibraryHrefRef = useRef("/cvs");
  const hasLoadedAnalysesRef = useRef(false);
  const hasLoadedCVAnalysesRef = useRef(false);
  const hasLoadedCVsRef = useRef(false);
  const hasLoadedInterviewQuestionsRef = useRef(false);
  const analysesRequestRef = useRef<Promise<void> | null>(null);
  const cvsRequestRef = useRef<Promise<void> | null>(null);
  const interviewQuestionsRequestRef = useRef<Promise<void> | null>(null);

  // Fetch analyses list
  const fetchAnalyses = useCallback(async (includeJobMatches: boolean = false) => {
    setAnalysesLoading(true);
    try {
      const requests = [fetch("/api/cv-analyses")];
      if (includeJobMatches) {
        requests.push(fetch("/api/job-match-analyses"));
      }

      const responses = await Promise.all(requests);
      const cvAnalyses = responses[0].ok ? await responses[0].json() : [];
      const jobMatchAnalyses =
        includeJobMatches && responses[1]?.ok ? await responses[1].json() : [];

      setAnalyses((prev) => {
        const existingJobMatches = prev.filter(
          (a) => a.analysis_mode === "job_match",
        );
        const newJobMatches = includeJobMatches
          ? jobMatchAnalyses
          : existingJobMatches;
        return normalizeAnalysisSummaries([
          ...cvAnalyses,
          ...newJobMatches,
        ]).sort((a, b) => b.created_at.localeCompare(a.created_at));
      });
      hasLoadedCVAnalysesRef.current = true;
      if (includeJobMatches) {
        hasLoadedAnalysesRef.current = true;
      }
    } catch {
      // silent
    } finally {
      setAnalysesLoading(false);
    }
  }, []);

  const fetchCVs = useCallback(async () => {
    try {
      const res = await fetch("/api/cvs");
      if (res.ok) {
        const data = (await res.json()) as ListCVDocumentsResponse;
        setCVs(data.map(toLegacyCVSummary));
        hasLoadedCVsRef.current = true;
      }
    } catch {
      // silent
    }
  }, []);

  const fetchInterviewQuestions = useCallback(async () => {
    try {
      const res = await fetch("/api/interview-questions");
      if (res.ok) {
        const data = await res.json();
        setInterviewQuestions(data);
        hasLoadedInterviewQuestionsRef.current = true;
      }
    } catch {
      // silent
    }
  }, []);

  const ensureAnalyses = useCallback(async () => {
    if (hasLoadedCVAnalysesRef.current || hasLoadedAnalysesRef.current) return;
    analysesRequestRef.current ??= fetchAnalyses(false).finally(() => {
      analysesRequestRef.current = null;
    });
    await analysesRequestRef.current;
  }, [fetchAnalyses]);

  const ensureAllAnalyses = useCallback(async () => {
    if (hasLoadedAnalysesRef.current) return;
    analysesRequestRef.current ??= fetchAnalyses(true).finally(() => {
      analysesRequestRef.current = null;
    });
    await analysesRequestRef.current;
  }, [fetchAnalyses]);

  const ensureCVs = useCallback(async () => {
    if (hasLoadedCVsRef.current) return;
    cvsRequestRef.current ??= fetchCVs().finally(() => {
      cvsRequestRef.current = null;
    });
    await cvsRequestRef.current;
  }, [fetchCVs]);

  const ensureInterviewQuestions = useCallback(async () => {
    if (hasLoadedInterviewQuestionsRef.current) return;
    interviewQuestionsRequestRef.current ??= fetchInterviewQuestions().finally(() => {
      interviewQuestionsRequestRef.current = null;
    });
    await interviewQuestionsRequestRef.current;
  }, [fetchInterviewQuestions]);

  useEffect(() => {
    if (activeView === "new" || activeView === "cv-analyses") {
      return;
    }

    if (activeView === "templates" || activeView === "editor") {
      return;
    }

    if (activeView === "analysis") {
      void ensureAnalyses();
      return;
    }

    if (activeView === "job-analyses") {
      void ensureInterviewQuestions();
      return;
    }

    if (activeView === "cvs") {
      void Promise.all([ensureAllAnalyses(), ensureInterviewQuestions()]);
      return;
    }

    if (activeView === "questions") {
      return;
    }
  }, [activeView, ensureAnalyses, ensureAllAnalyses, ensureCVs, ensureInterviewQuestions]);

  useEffect(() => {
    if (initialUserEmail) return;
    let cancelled = false;
    loadUserEmail().then((email) => {
      if (!cancelled) setUserEmail(email);
    });
    return () => {
      cancelled = true;
    };
  }, [initialUserEmail]);

  useEffect(() => {
    if (initialIsAdmin) return;
    let cancelled = false;
    loadAdminStatus().then((admin) => {
      if (!cancelled) setIsAdmin(admin);
    });
    return () => {
      cancelled = true;
    };
  }, [initialIsAdmin]);

  useEffect(() => {
    const syncAISettings = () => {
      setAIProvider(getStoredAIProvider());
      setAIApiKey(getStoredAIApiKey());
      setAIModel(getStoredAIModel());
    };

    syncAISettings();
    window.addEventListener("storage", syncAISettings);

    return () => window.removeEventListener("storage", syncAISettings);
  }, []);

  const rememberFeedbackNotesLocation = useCallback(() => {
    if (window.location.pathname.startsWith("/feedback-notes")) {
      lastFeedbackNotesHrefRef.current = `${window.location.pathname}${window.location.search}`;
    }
  }, []);

  const rememberReceivedFeedbackLocation = useCallback(() => {
    if (window.location.pathname.startsWith("/received-feedback")) {
      lastReceivedFeedbackHrefRef.current = `${window.location.pathname}${window.location.search}`;
    }
  }, []);

  const rememberWorkJournalLocation = useCallback(() => {
    if (window.location.pathname.startsWith("/work-journal")) {
      lastWorkJournalHrefRef.current = `${window.location.pathname}${window.location.search}`;
    }
  }, []);

  const rememberObjectivesLocation = useCallback(() => {
    if (window.location.pathname.startsWith("/objectives")) {
      lastObjectivesHrefRef.current = `${window.location.pathname}${window.location.search}`;
    }
  }, []);

  const rememberInterviewQuestionsLocation = useCallback(() => {
    if (window.location.pathname.startsWith("/interview-questions")) {
      lastInterviewQuestionsHrefRef.current = `${window.location.pathname}${window.location.search}`;
    }
  }, []);

  const rememberCVAnalysesLocation = useCallback(() => {
    if (window.location.pathname.startsWith("/cv-analysis")) {
      lastCVAnalysesHrefRef.current = `${window.location.pathname}${window.location.search}`;
    }
  }, []);

  const rememberJobAnalysesLocation = useCallback(() => {
    if (window.location.pathname.startsWith("/job-analyses")) {
      lastJobAnalysesHrefRef.current = `${window.location.pathname}${window.location.search}`;
    }
  }, []);

  const rememberCVLibraryLocation = useCallback(() => {
    if (window.location.pathname.startsWith("/cvs")) {
      lastCVLibraryHrefRef.current = `${window.location.pathname}${window.location.search}`;
    }
  }, []);

  // Fetch single analysis detail
  const fetchAnalysisDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const knownMode = analyses.find((analysis) => analysis.id === id)
        ?.analysis_mode;
      const endpoints =
        knownMode === "job_match"
          ? [`/api/job-match-analyses/${id}`]
          : knownMode === "general"
            ? [`/api/cv-analyses/${id}`]
            : [`/api/cv-analyses/${id}`, `/api/job-match-analyses/${id}`];

      let data: FullAnalysis | null = null;
      for (const endpoint of endpoints) {
        const res = await fetch(endpoint);
        if (res.ok) {
          data = await res.json();
          break;
        }
      }
      if (data) {
        setActiveAnalysis(data);
        setActiveView("analysis");
      }
    } catch {
      // silent
    } finally {
      setLoadingDetail(false);
    }
  }, [analyses]);

  useEffect(() => {
    const analysisId = searchParams.get("analysis");
    const view = searchParams.get("view");

    if (analysisId) {
      queueMicrotask(() => {
        setActiveView("analysis");
        setActiveAnalysisId((prevId) => {
          if (prevId !== analysisId) {
            void fetchAnalysisDetail(analysisId);
          }
          return analysisId;
        });
      });
    } else if (pathname.startsWith("/cv-analysis/")) {
      const id = pathname.split("/cv-analysis/")[1];
      if (id) {
        queueMicrotask(() => {
          setActiveView("analysis");
          setActiveAnalysisId((prevId) => {
            if (prevId !== id) {
              void fetchAnalysisDetail(id);
            }
            return id;
          });
        });
      }
    } else if (view === "cvs") {
      queueMicrotask(() => {
        router.replace("/cvs");
      });
    } else if (pathname.startsWith("/cvs")) {
      queueMicrotask(() => {
        setActiveView("cvs");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "templates") {
      queueMicrotask(() => {
        setActiveView("templates");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "editor") {
      queueMicrotask(() => {
        setActiveView("editor");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
        setActiveEditorCvId(searchParams.get("cv"));
      });
    } else if (view === "questions") {
      queueMicrotask(() => {
        const nextParams = new URLSearchParams();
        const cv = searchParams.get("cv");
        const offer = searchParams.get("offer");
        if (cv) nextParams.set("cv", cv);
        if (offer) nextParams.set("offer", offer);
        const query = nextParams.toString();
        router.replace(query ? `/interview-questions?${query}` : "/interview-questions");
      });
    } else if (pathname.startsWith("/interview-questions")) {
      queueMicrotask(() => {
        setActiveView("questions");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "journal") {
      queueMicrotask(() => {
        router.replace("/work-journal");
      });
    } else if (pathname.startsWith("/work-journal")) {
      queueMicrotask(() => {
        setActiveView("journal");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "objectives") {
      queueMicrotask(() => {
        router.replace("/objectives");
      });
    } else if (pathname.startsWith("/objectives")) {
      queueMicrotask(() => {
        setActiveView("objectives");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "feedback-notes") {
      queueMicrotask(() => {
        router.replace("/feedback-notes");
      });
    } else if (pathname.startsWith("/feedback-notes")) {
      queueMicrotask(() => {
        setActiveView("feedback-notes");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "cv-analyses") {
      queueMicrotask(() => {
        router.replace("/cv-analysis");
      });
    } else if (pathname === "/cv-analysis") {
      queueMicrotask(() => {
        setActiveView("cv-analyses");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "job-analyses") {
      queueMicrotask(() => {
        router.replace("/job-analyses");
      });
    } else if (pathname.startsWith("/job-analyses")) {
      queueMicrotask(() => {
        setActiveView("job-analyses");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "received-feedback") {
      queueMicrotask(() => {
        router.replace("/received-feedback");
      });
    } else if (pathname.startsWith("/received-feedback")) {
      queueMicrotask(() => {
        setActiveView("received-feedback");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (pathname.startsWith("/activity-contexts")) {
      queueMicrotask(() => {
        setActiveView("activity-context");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "settings") {
      queueMicrotask(() => {
        router.replace("/settings");
      });
    } else if (pathname === "/settings") {
      queueMicrotask(() => {
        setActiveView("settings");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (pathname === "/admin" || view === "admin") {
      queueMicrotask(() => {
        setActiveView("admin");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    }
  }, [fetchAnalysisDetail, router, pathname, searchParams]);

  // Handle selecting an analysis
  const handleSelect = (id: string) => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveAnalysisId(id);
    setActiveView("analysis");
    fetchAnalysisDetail(id);

    const mode = analyses.find((a) => a.id === id)?.analysis_mode;
    if (mode === "general") {
      router.push(`/cv-analysis/${encodeURIComponent(id)}`);
    } else if (mode === "job_match") {
      router.push(`/job-analyses/${encodeURIComponent(id)}`);
    } else {
      router.push(`/?analysis=${encodeURIComponent(id)}`);
    }
  };

  // Handle new analysis
  const handleNewAnalysis = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("cv-analyses");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push("/cv-analysis?mode=new");
  };

  const handleOpenCVs = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    setActiveView("cvs");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push(lastCVLibraryHrefRef.current);
  };

  const handleOpenTemplates = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("templates");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    window.history.replaceState(null, "", "/?view=templates");
  };

  const handleOpenEditor = (cvId?: string | null) => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberCVLibraryLocation();
    const targetCvId = cvId !== undefined ? cvId : null;
    setActiveView("editor");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    setActiveEditorCvId(targetCvId);
    const suffix = targetCvId ? `&cv=${encodeURIComponent(targetCvId)}` : "";
    window.history.replaceState(null, "", `/?view=editor${suffix}`);
  };

  const handleOpenQuestions = (options?: {
    cvId?: string | null;
    analysisId?: string | null;
  }) => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberCVLibraryLocation();
    const cvId = options?.cvId ?? null;
    const analysisId = options?.analysisId ?? null;
    setActiveView("questions");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    const params = new URLSearchParams();
    if (cvId) params.set("cv", cvId);
    if (analysisId) params.set("offer", analysisId);
    const query = params.toString();
    const fallbackHref = query
      ? `/interview-questions?${query}`
      : lastInterviewQuestionsHrefRef.current;
    router.push(fallbackHref);
  };

  const handleOpenJournal = () => {
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("journal");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push(lastWorkJournalHrefRef.current);
  };

  const handleOpenObjectives = () => {
    rememberWorkJournalLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("objectives");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push(lastObjectivesHrefRef.current);
  };

  const handleOpenFeedbackNotes = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("feedback-notes");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push(lastFeedbackNotesHrefRef.current);
  };

  const handleOpenReceivedFeedback = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("received-feedback");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push(lastReceivedFeedbackHrefRef.current);
  };

  const handleOpenCVAnalyses = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("cv-analyses");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push(lastCVAnalysesHrefRef.current);
  };

  const handleOpenJobAnalyses = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberCVLibraryLocation();
    setActiveView("job-analyses");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push(lastJobAnalysesHrefRef.current);
  };

  const handleOpenSettings = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("settings");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push("/settings");
  };

  const handleOpenAdmin = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("admin");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    window.history.replaceState(null, "", "/admin");
  };

  // Handle analysis creation complete
  const handleAnalysisCreated = (id: string) => {
    setActiveAnalysisId(id);
    setActiveView("cv-analyses");
    window.history.replaceState(
      null,
      "",
      `/cv-analysis/${encodeURIComponent(id)}`,
    );
    fetchAnalysisDetail(id);
    fetchAnalyses(hasLoadedAnalysesRef.current);
    fetchCVs();
    fetchInterviewQuestions();
  };

  // Handle AI analysis complete
  const handleAIComplete = () => {
    if (activeAnalysisId) {
      fetchAnalysisDetail(activeAnalysisId);
      fetchAnalyses(hasLoadedAnalysesRef.current);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const mode =
        analyses.find((analysis) => analysis.id === id)?.analysis_mode ??
        activeAnalysis?.analysis_mode;
      const endpoint =
        mode === "job_match"
          ? `/api/job-match-analyses/${id}`
          : `/api/cv-analyses/${id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        await fetchAnalyses(hasLoadedAnalysesRef.current);
        if (activeAnalysisId === id) {
          setActiveAnalysisId(null);
          setActiveAnalysis(null);
          setActiveView("cv-analyses");
          window.history.replaceState(null, "", "/cv-analysis");
        }
      }
    } catch {
      // silent
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090f]">
      {/* Background ambient gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-indigo-600/[0.07] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] bg-violet-600/[0.05] rounded-full blur-[130px]" />
      </div>

      {/* Sidebar */}
      <Sidebar
        generalAnalyses={analyses.filter(
          (analysis) => analysis.analysis_mode === "general",
        )}
        jobMatchAnalyses={analyses.filter(
          (analysis) => analysis.analysis_mode === "job_match",
        )}
        activeId={activeAnalysisId}
        activeView={activeView}
        onSelect={handleSelect}
        onNewAnalysis={handleNewAnalysis}
        onOpenCVAnalyses={handleOpenCVAnalyses}
        onOpenJobAnalyses={handleOpenJobAnalyses}
        onOpenCVs={handleOpenCVs}
        onOpenTemplates={handleOpenTemplates}
        onOpenEditor={() => handleOpenEditor()}
        onOpenQuestions={() => handleOpenQuestions()}
        onOpenJournal={handleOpenJournal}
        onOpenObjectives={handleOpenObjectives}
        onOpenReceivedFeedback={handleOpenReceivedFeedback}
        onOpenFeedbackNotes={handleOpenFeedbackNotes}
        onOpenSettings={handleOpenSettings}
        onOpenAdmin={handleOpenAdmin}
        onDelete={handleDelete}
        userEmail={userEmail}
        isAdmin={isAdmin}
        isForceCollapsed={activeView === "editor"}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
          {activeView === "new" ? (
            <div key="new-analysis" className="flex-1 flex flex-col min-h-0">
              <CVAnalysisView
                aiProvider={aiProvider}
                aiApiKey={aiApiKey}
                aiModel={aiModel}
                hasAIApiKey={aiProvider === "mock" || aiApiKey.length > 0}
                onOpenSettings={handleOpenSettings}
                onOpenQuestions={(options) => handleOpenQuestions(options)}
              />
            </div>
          ) : activeView === "cv-analyses" ? (
            <div key="cv-analyses-list" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <CVAnalysisView
                aiProvider={aiProvider}
                aiApiKey={aiApiKey}
                aiModel={aiModel}
                hasAIApiKey={aiProvider === "mock" || aiApiKey.length > 0}
                onOpenSettings={handleOpenSettings}
                onOpenQuestions={(options) => handleOpenQuestions(options)}
              />
            </div>
          ) : activeView === "job-analyses" ? (
            <div key="job-analyses-list" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <JobMatchAnalysisView
                aiProvider={aiProvider}
                aiApiKey={aiApiKey}
                aiModel={aiModel}
                hasAIApiKey={aiProvider === "mock" || aiApiKey.length > 0}
                onOpenSettings={handleOpenSettings}
                onNewAnalysis={handleNewAnalysis}
                onOpenQuestions={(options) => handleOpenQuestions(options)}
                interviewQuestions={interviewQuestions}
                onInterviewQuestionCreated={fetchInterviewQuestions}
              />
            </div>
          ) : activeView === "cvs" ? (
            <div key="cv-library" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <CVLibraryView
                onOpenAnalysis={handleSelect}
                onOpenEditor={handleOpenEditor}
                onOpenQuestions={(cvId) => handleOpenQuestions({ cvId })}
              />
            </div>
          ) : activeView === "templates" ? (
            <div key="templates" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <TemplatesView
                onOpenSettings={handleOpenSettings}
                onOpenEditor={handleOpenEditor}
                onOpenUpload={handleNewAnalysis}
              />
            </div>
          ) : activeView === "editor" ? (
            <div key="editor" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <CVEditorView
                activeVersionId={activeEditorCvId}
                onOpenTemplates={handleOpenTemplates}
                onOpenSettings={handleOpenSettings}
                onStartAnalysis={handleNewAnalysis}
                onBackToLibrary={handleOpenCVs}
              />
            </div>
          ) : activeView === "questions" ? (
            <div key="interview-questions" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <InterviewQuestionsView
                aiProvider={aiProvider}
                aiApiKey={aiApiKey}
                aiModel={aiModel}
                hasAIApiKey={aiProvider === "mock" || aiApiKey.length > 0}
                onOpenSettings={handleOpenSettings}
                onOpenAnalysis={handleSelect}
              />
            </div>
          ) : activeView === "journal" ? (
            <div key="work-journal" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <WorkJournalView
                aiProvider={aiProvider}
                aiApiKey={aiApiKey}
                aiModel={aiModel}
                hasAIApiKey={aiProvider === "mock" || aiApiKey.length > 0}
                onOpenSettings={handleOpenSettings}
              />
            </div>
          ) : activeView === "objectives" ? (
            <div key="objectives" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <ObjectivesView />
            </div>
          ) : activeView === "feedback-notes" ? (
            <div key="feedback-notes" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <FeedbackNotesView
                aiProvider={aiProvider}
                aiApiKey={aiApiKey}
                aiModel={aiModel}
                hasAIApiKey={aiProvider === "mock" || aiApiKey.length > 0}
                onOpenSettings={handleOpenSettings}
              />
            </div>
          ) : activeView === "received-feedback" ? (
            <div key="received-feedback" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <ReceivedFeedbackView />
            </div>
          ) : activeView === "activity-context" ? (
            <div key="activity-context" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <ActivityContextView />
            </div>
          ) : activeView === "settings" ? (
            <div key="settings" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <SettingsView
                aiProvider={aiProvider}
                aiApiKey={aiApiKey}
                aiModel={aiModel}
                onAISettingsChange={(settings) => {
                  setAIProvider(settings.provider);
                  setAIApiKey(settings.apiKey);
                  setAIModel(settings.model);
                }}
                userEmail={userEmail}
              />
            </div>
          ) : activeView === "admin" && isAdmin ? (
            <div key="admin-observability" className="flex-1 flex flex-col overflow-hidden min-h-0">
              <AdminObservabilityView userEmail={userEmail} />
            </div>
          ) : loadingDetail ? (
            <div key="loading" className="flex-1 overflow-y-auto p-6">
              <AnalysisDetailSkeleton />
            </div>
          ) : activeAnalysis ? (
            <div key={activeAnalysis.id} className="flex-1 flex flex-col overflow-hidden min-h-0">
              {/* Tabs - Extraction / Analysis */}
              {activeAnalysis.ai_score !== null && (
                <div className="shrink-0 flex items-center gap-1 px-4 sm:px-6 pt-4">
                  <button
                    onClick={() => setViewTab("extraction")}
                    className={`
                      flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
                      ${
                        viewTab === "extraction"
                          ? "bg-white/[0.08] text-zinc-100 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                      }
                    `}
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {analysisFlow("extractionTab")}
                  </button>
                  <button
                    onClick={() => setViewTab("analysis")}
                    className={`
                      flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
                      ${
                        viewTab === "analysis"
                          ? "bg-white/[0.08] text-zinc-100 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                      }
                    `}
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {analysisFlow("analysisTab")}
                  </button>
                </div>
              )}

              {/* View Content */}
              <AnimatePresence mode="wait">
                {viewTab === "extraction" ? (
                  <motion.div
                    key="extraction-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 flex flex-col overflow-hidden min-h-0"
                  >
                    <ExtractionView
                      analysis={activeAnalysis}
                      onAIAnalysisComplete={handleAIComplete}
                      aiProvider={aiProvider}
                      aiApiKey={aiApiKey}
                      aiModel={aiModel}
                      hasAIApiKey={aiProvider === "mock" || aiApiKey.length > 0}
                      onOpenSettings={handleOpenSettings}
                    />
                  </motion.div>
                ) : activeAnalysis.ai_score !== null ? (
                  <motion.div
                    key="analysis-view"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 flex flex-col overflow-hidden min-h-0"
                  >
                    <AIAnalysisView
                      analysis={{
                        ai_score: activeAnalysis.ai_score,
                        ai_feedback: activeAnalysis.ai_feedback!,
                        ai_keywords: activeAnalysis.ai_keywords!,
                        ai_improvements: activeAnalysis.ai_improvements!,
                        ai_model: activeAnalysis.ai_model!,
                        ai_analyzed_at: activeAnalysis.ai_analyzed_at!,
                        analysis_mode: activeAnalysis.analysis_mode,
                        job_description: activeAnalysis.job_description,
                        job_url: activeAnalysis.job_url,
                        offer_status: activeAnalysis.offer_status,
                        offer_notes: activeAnalysis.offer_notes,
                        offer_next_action: activeAnalysis.offer_next_action,
                        offer_next_action_at:
                          activeAnalysis.offer_next_action_at,
                        ai_context: activeAnalysis.ai_context,
                        job_key_data: activeAnalysis.job_key_data,
                        job_keywords: activeAnalysis.job_keywords,
                        cv_keywords: activeAnalysis.cv_keywords,
                        matching_keywords: activeAnalysis.matching_keywords,
                        missing_keywords: activeAnalysis.missing_keywords,
                        id: activeAnalysis.id,
                        cv_id: activeAnalysis.cv_id,
                        cv: activeAnalysis.cv,
                        title: activeAnalysis.title,
                        filename: activeAnalysis.filename,
                      }}
                      aiProvider={aiProvider}
                      aiApiKey={aiApiKey}
                      aiModel={aiModel}
                      hasAIApiKey={aiProvider === "mock" || aiApiKey.length > 0}
                      onDelete={handleDelete}
                      onUpdate={() => fetchAnalysisDetail(activeAnalysis.id)}
                      interviewQuestions={interviewQuestions.filter(
                        (question) =>
                          question.analysisId === activeAnalysis.id,
                      )}
                      onInterviewQuestionCreated={fetchInterviewQuestions}
                      onOpenQuestions={() =>
                        handleOpenQuestions({
                          cvId: activeAnalysis.cv_id,
                          analysisId: activeAnalysis.id,
                        })
                      }
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <div key="empty" className="flex-1 flex items-center justify-center">
              <div className="text-center text-zinc-600">
                <p>{analysisFlow("empty")}</p>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
