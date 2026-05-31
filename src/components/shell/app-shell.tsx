"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { AnalysisSummary } from "@/lib/analysis-types";
import Sidebar from "@/components/shell/sidebar";
import {
  type CVAnalysisDetail,
  type CVAnalysisDetailTab,
} from "@/features/cv-analysis";
import { createClient } from "@/lib/supabase/client";
import { normalizeAnalysisSummaries } from "@/components/shell/analysis-summary-normalizer";
import type { ListCVDocumentsResponse } from "@/app/api/cvs/responses";
import type { InterviewQuestionResponse as InterviewQuestionSummary } from "@/app/api/interview-questions/responses";
import {
  AI_SETTINGS_CHANGED_EVENT,
  getStoredAIApiKey,
  getStoredAIModel,
  getStoredAIProvider,
  type StoredAIDefaultApiKeys,
  type StoredAIProvider,
} from "@/lib/browser-preferences";
import { CV_TEMPLATES } from "@/lib/cv-templates";
import AppShellContent from "./app-shell-content";
import type { SidebarActiveView } from "./sidebar-types";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import { fetchDefaultAISettings } from "@/features/settings";

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

type AppView =
  | "home"
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

type CVSummary = {
  id: string;
  name: string;
  filename: string | null;
  file_size: number | null;
  type: ListCVDocumentsResponse[number]["type"];
  source_cv_id: string | null;
  template_id: string | null;
  template_locale: string | null;
  profile: ListCVDocumentsResponse[number]["profile"];
  public_enabled: boolean;
  public_id: string | null;
  public_slug: string | null;
  public_published_at: string | null;
  created_at: string;
  updated_at: string;
};

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
  initialView = "home",
  initialUserEmail = null,
  initialIsAdmin = false,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [, setCVs] = useState<CVSummary[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<
    InterviewQuestionSummary[]
  >([]);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<CVAnalysisDetail | null>(
    null,
  );
  const tabFromUrl = searchParams.get("tab") as CVAnalysisDetailTab | null;
  const viewTab: CVAnalysisDetailTab =
    tabFromUrl ||
    (activeAnalysis?.ai_score !== null && activeAnalysis?.ai_score !== undefined
      ? "analysis"
      : "extraction");

  const setViewTab = (tab: CVAnalysisDetailTab) => {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };
  const [activeView, setActiveView] = useState<AppView>(initialView);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [aiProvider, setAIProvider] = useState<StoredAIProvider>("gemini");
  const [aiApiKey, setAIApiKey] = useState("");
  const [aiModel, setAIModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const lastFeedbackNotesHrefRef = useRef("/feedback-notes");
  const lastReceivedFeedbackHrefRef = useRef("/received-feedback");
  const lastWorkJournalHrefRef = useRef("/work-journal");
  const lastObjectivesHrefRef = useRef("/objectives");
  const lastInterviewQuestionsHrefRef = useRef("/interview-questions");
  const lastCVAnalysesHrefRef = useRef("/cv-analysis");
  const lastJobAnalysesHrefRef = useRef("/job-analyses");
  const lastCVLibraryHrefRef = useRef("/cvs");
  const defaultAIKeysRef = useRef<StoredAIDefaultApiKeys>({});
  const hasLoadedAnalysesRef = useRef(false);
  const hasLoadedCVAnalysesRef = useRef(false);
  const hasLoadedCVsRef = useRef(false);
  const hasLoadedInterviewQuestionsRef = useRef(false);
  const analysesRequestRef = useRef<Promise<void> | null>(null);
  const cvsRequestRef = useRef<Promise<void> | null>(null);
  const interviewQuestionsRequestRef = useRef<Promise<void> | null>(null);

  // Fetch analyses list
  const fetchAnalyses = useCallback(
    async (includeJobMatches: boolean = false) => {

      try {
        const requests = [fetch("/api/cv-analyses")];
        if (includeJobMatches) {
          requests.push(fetch("/api/job-match-analyses"));
        }

        const responses = await Promise.all(requests);
        const cvAnalyses = responses[0].ok ? await responses[0].json() : [];
        const jobMatchAnalyses =
          includeJobMatches && responses[1]?.ok
            ? await responses[1].json()
            : [];

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

      }
    },
    [],
  );

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
    interviewQuestionsRequestRef.current ??= fetchInterviewQuestions().finally(
      () => {
        interviewQuestionsRequestRef.current = null;
      },
    );
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
  }, [
    activeView,
    ensureAnalyses,
    ensureAllAnalyses,
    ensureCVs,
    ensureInterviewQuestions,
  ]);

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
    let cancelled = false;
    const syncAISettings = () => {
      setAIProvider(getStoredAIProvider());
      setAIApiKey(getStoredAIApiKey(defaultAIKeysRef.current));
      setAIModel(getStoredAIModel());
    };

    syncAISettings();
    fetchDefaultAISettings().then((settings) => {
      if (cancelled) return;
      defaultAIKeysRef.current = settings.apiKeys;
      syncAISettings();
    });
    window.addEventListener("storage", syncAISettings);
    window.addEventListener(AI_SETTINGS_CHANGED_EVENT, syncAISettings);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", syncAISettings);
      window.removeEventListener(AI_SETTINGS_CHANGED_EVENT, syncAISettings);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/") {
        setActiveView("home");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      } else if (path.startsWith("/cv-analysis")) {
        setActiveView("cv-analyses");
      } else if (path.startsWith("/job-analyses")) {
        setActiveView("job-analyses");
      } else if (path.startsWith("/cvs/editor")) {
        setActiveView("editor");
      } else if (path.startsWith("/cvs")) {
        setActiveView("cvs");
      } else if (path.startsWith("/templates")) {
        setActiveView("templates");
      } else if (path.startsWith("/work-journal")) {
        setActiveView("journal");
      } else if (path.startsWith("/objectives")) {
        setActiveView("objectives");
      } else if (path.startsWith("/feedback-notes")) {
        setActiveView("feedback-notes");
      } else if (path.startsWith("/received-feedback")) {
        setActiveView("received-feedback");
      } else if (path.startsWith("/interview-questions")) {
        setActiveView("questions");
      } else if (path.startsWith("/settings")) {
        setActiveView("settings");
      } else if (path.startsWith("/admin")) {
        setActiveView("admin");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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
  const fetchAnalysisDetail = useCallback(
    async (id: string) => {
      setLoadingDetail(true);
      try {
        const knownMode = analyses.find(
          (analysis) => analysis.id === id,
        )?.analysis_mode;
        const endpoints =
          knownMode === "job_match"
            ? [`/api/job-match-analyses/${id}`]
            : knownMode === "general"
              ? [`/api/cv-analyses/${id}`]
              : [`/api/cv-analyses/${id}`, `/api/job-match-analyses/${id}`];

        let data: CVAnalysisDetail | null = null;
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
    },
    [analyses],
  );

  useEffect(() => {
    const analysisId = searchParams.get("analysis");
    const view = searchParams.get("view");

    if (pathname === "/" && !analysisId && !view) {
      queueMicrotask(() => {
        setActiveView("home");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (analysisId) {
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
      queueMicrotask(() => {
        setActiveView("cv-analyses");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "cvs") {
      queueMicrotask(() => {
        router.replace("/cvs");
      });
    } else if (pathname.startsWith("/cvs/editor")) {
      queueMicrotask(() => {
        setActiveView("editor");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (pathname.startsWith("/cvs")) {
      queueMicrotask(() => {
        setActiveView("cvs");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "templates") {
      queueMicrotask(() => {
        router.replace("/templates");
      });
    } else if (pathname.startsWith("/templates")) {
      queueMicrotask(() => {
        setActiveView("templates");
        setActiveAnalysisId(null);
        setActiveAnalysis(null);
      });
    } else if (view === "editor") {
      queueMicrotask(() => {
        const legacyCvId = searchParams.get("cv");
        router.replace(
          legacyCvId
            ? `/cvs/editor/${encodeURIComponent(legacyCvId)}`
            : "/cvs/editor",
        );
      });
    } else if (view === "questions") {
      queueMicrotask(() => {
        const nextParams = new URLSearchParams();
        const cv = searchParams.get("cv");
        const offer = searchParams.get("offer");
        if (cv) nextParams.set("cv", cv);
        if (offer) nextParams.set("offer", offer);
        const query = nextParams.toString();
        router.replace(
          query ? `/interview-questions?${query}` : "/interview-questions",
        );
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

  const handleOpenHome = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView("home");
    setActiveAnalysisId(null);
    setActiveAnalysis(null);
    router.push("/");
  };

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
    const firstTemplateId = CV_TEMPLATES[0]?.templateId;
    router.push(firstTemplateId ? `/templates/${firstTemplateId}` : "/templates");
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
    router.push(
      targetCvId ? `/cvs/editor/${encodeURIComponent(targetCvId)}` : "/cvs/editor",
    );
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
    lastCVAnalysesHrefRef.current = "/cv-analysis";
    router.push("/cv-analysis");
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

  const handleNavigate = (view: SidebarActiveView) => {
    const handlers: Record<string, () => void> = {
      home: handleOpenHome,
      "cv-analyses": handleOpenCVAnalyses,
      "job-analyses": handleOpenJobAnalyses,
      cvs: handleOpenCVs,
      templates: handleOpenTemplates,
      editor: () => handleOpenEditor(),
      questions: () => handleOpenQuestions(),
      journal: handleOpenJournal,
      objectives: handleOpenObjectives,
      "received-feedback": handleOpenReceivedFeedback,
      "feedback-notes": handleOpenFeedbackNotes,
      settings: handleOpenSettings,
      admin: handleOpenAdmin,
      new: handleNewAnalysis,
    };
    handlers[view]?.();
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
    <div className="flex h-screen overflow-hidden bg-canvas">
      <div className="app-glow" aria-hidden="true" />

      <Sidebar
        activeView={activeView}
        onOpenHome={handleOpenHome}
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
        userEmail={userEmail}
        isAdmin={isAdmin}
      />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
        <AppShellContent
          activeView={activeView}
          activeAnalysis={activeAnalysis}
          loadingDetail={loadingDetail}
          viewTab={viewTab}
          aiProvider={aiProvider}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          userEmail={userEmail}
          isAdmin={isAdmin}
          interviewQuestions={interviewQuestions}
          onOpenSettings={handleOpenSettings}
          onOpenQuestions={handleOpenQuestions}
          onNewAnalysis={handleNewAnalysis}
          onOpenAnalysis={handleSelect}
          onOpenEditor={handleOpenEditor}
          onOpenTemplates={handleOpenTemplates}
          onOpenCVs={handleOpenCVs}
          onTabChange={setViewTab}
          onAIAnalysisComplete={handleAIComplete}
          onDelete={handleDelete}
          onUpdateAnalysis={fetchAnalysisDetail}
          onInterviewQuestionCreated={fetchInterviewQuestions}
          onAISettingsChange={(settings) => {
            setAIProvider(settings.provider);
            setAIApiKey(settings.apiKey);
            setAIModel(settings.model);
          }}
          onNavigate={handleNavigate}
        />
      </main>
    </div>
  );
}
