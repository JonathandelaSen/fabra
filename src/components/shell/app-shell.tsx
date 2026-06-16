"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { AnalysisMode } from "@/lib/analysis-types";
import Sidebar from "@/components/shell/sidebar";
import { createClient } from "@/lib/supabase/client";
import type { InterviewQuestionResponse as InterviewQuestionSummary } from "@/app/api/interview-questions/responses";
import {
  AI_SETTINGS_CHANGED_EVENT,
  getStoredAIApiKey,
  getStoredAIModel,
  getStoredAIProvider,
  type StoredAIProvider,
} from "@/lib/browser-preferences";
import AppShellContent from "./app-shell-content";
import { ImpersonationBanner } from "./impersonation-banner";
import type { SidebarActiveView } from "./sidebar-types";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import { APP_VIEWS, type AppView } from "@/frontend/app-views";

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

function resetUserCaches() {
  userEmailRequest = null;
  adminStatusRequest = null;
}

interface AppShellProps {
  initialView?: AppView;
  initialUserEmail?: string | null;
  initialIsAdmin?: boolean;
}

function resolveViewFromLocation(pathname: string): AppView {
  if (pathname === "/") return APP_VIEWS.home;
  if (pathname.startsWith("/cv-analysis")) return APP_VIEWS.cvAnalyses;
  if (pathname.startsWith("/job-analyses")) return APP_VIEWS.jobAnalyses;
  if (pathname.startsWith("/cvs/editor")) return APP_VIEWS.editor;
  if (pathname.startsWith("/cvs")) return APP_VIEWS.cvs;
  if (pathname.startsWith("/templates")) return APP_VIEWS.templates;
  if (pathname.startsWith("/work-journal")) return APP_VIEWS.journal;
  if (pathname.startsWith("/objectives")) return APP_VIEWS.objectives;
  if (pathname.startsWith("/feedback-notes")) return APP_VIEWS.feedbackNotes;
  if (pathname.startsWith("/received-feedback")) return APP_VIEWS.receivedFeedback;
  if (pathname.startsWith("/public-cv-messages")) return APP_VIEWS.publicCVMessages;
  if (pathname.startsWith("/reviews")) return APP_VIEWS.reviews;
  if (pathname.startsWith("/interview-questions")) return APP_VIEWS.questions;
  if (pathname.startsWith("/activity-contexts")) return APP_VIEWS.activityContext;
  if (pathname.startsWith("/settings")) return APP_VIEWS.settings;
  if (pathname.startsWith("/admin")) return APP_VIEWS.admin;
  return APP_VIEWS.home;
}

export default function AppShell({
  initialView,
  initialUserEmail = null,
  initialIsAdmin = false,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [interviewQuestions, setInterviewQuestions] = useState<
    InterviewQuestionSummary[]
  >([]);
  const [activeView, setActiveView] = useState<AppView>(
    () => initialView ?? resolveViewFromLocation(pathname),
  );
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [hasLoadedAdminStatus, setHasLoadedAdminStatus] = useState(initialIsAdmin);
  const [aiProvider, setAIProvider] = useState<StoredAIProvider>("gemini");
  const [aiApiKey, setAIApiKey] = useState("");
  const [aiModel, setAIModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const authedUserIdRef = useRef<string | null>(null);
  const lastFeedbackNotesHrefRef = useRef("/feedback-notes");
  const lastReceivedFeedbackHrefRef = useRef("/received-feedback");
  const lastWorkJournalHrefRef = useRef("/work-journal");
  const lastObjectivesHrefRef = useRef("/objectives");
  const lastInterviewQuestionsHrefRef = useRef("/interview-questions");
  const lastCVAnalysesHrefRef = useRef("/cv-analysis");
  const lastJobAnalysesHrefRef = useRef("/job-analyses");
  const lastCVLibraryHrefRef = useRef("/cvs");
  const hasLoadedInterviewQuestionsRef = useRef(false);
  const interviewQuestionsRequestRef = useRef<Promise<void> | null>(null);

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
    if (activeView === APP_VIEWS.jobAnalyses) {
      void ensureInterviewQuestions();
    }
  }, [activeView, ensureInterviewQuestions]);

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
      if (!cancelled) {
        setIsAdmin(admin);
        setHasLoadedAdminStatus(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialIsAdmin]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;
      if (nextUserId === authedUserIdRef.current) return;
      authedUserIdRef.current = nextUserId;

      resetUserCaches();

      if (!nextUserId) {
        setUserEmail(null);
        setIsAdmin(false);
        setHasLoadedAdminStatus(false);
        return;
      }

      setUserEmail(session?.user?.email ?? null);
      loadAdminStatus().then((admin) => {
        setIsAdmin(admin);
        setHasLoadedAdminStatus(true);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin") && hasLoadedAdminStatus && !isAdmin) {
      router.replace("/");
    }
  }, [hasLoadedAdminStatus, isAdmin, pathname, router]);

  useEffect(() => {
    const syncAISettings = () => {
      setAIProvider(getStoredAIProvider());
      setAIApiKey(getStoredAIApiKey());
      setAIModel(getStoredAIModel());
    };

    syncAISettings();
    window.addEventListener("storage", syncAISettings);
    window.addEventListener(AI_SETTINGS_CHANGED_EVENT, syncAISettings);

    return () => {
      window.removeEventListener("storage", syncAISettings);
      window.removeEventListener(AI_SETTINGS_CHANGED_EVENT, syncAISettings);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActiveView(resolveViewFromLocation(window.location.pathname));
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
    if (
      window.location.pathname.startsWith("/cvs") &&
      !window.location.pathname.startsWith("/cvs/editor")
    ) {
      lastCVLibraryHrefRef.current = `${window.location.pathname}${window.location.search}`;
    }
  }, []);

  useEffect(() => {
    const view = searchParams.get("view");

    if (pathname === "/" && !view) {
      queueMicrotask(() => setActiveView(APP_VIEWS.home));
    } else if (pathname.startsWith("/cv-analysis/")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.cvAnalyses));
    } else if (view === APP_VIEWS.cvs) {
      queueMicrotask(() => router.replace("/cvs"));
    } else if (pathname.startsWith("/cvs/editor")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.editor));
    } else if (pathname.startsWith("/cvs")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.cvs));
    } else if (view === APP_VIEWS.templates) {
      queueMicrotask(() => router.replace("/templates"));
    } else if (pathname.startsWith("/templates")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.templates));
    } else if (view === APP_VIEWS.editor) {
      queueMicrotask(() => {
        const legacyCvId = searchParams.get("cv");
        router.replace(
          legacyCvId
            ? `/cvs/editor/${encodeURIComponent(legacyCvId)}`
            : "/cvs/editor",
        );
      });
    } else if (view === APP_VIEWS.questions) {
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
      queueMicrotask(() => setActiveView(APP_VIEWS.questions));
    } else if (view === APP_VIEWS.journal) {
      queueMicrotask(() => router.replace("/work-journal"));
    } else if (pathname.startsWith("/work-journal")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.journal));
    } else if (view === APP_VIEWS.objectives) {
      queueMicrotask(() => router.replace("/objectives"));
    } else if (pathname.startsWith("/objectives")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.objectives));
    } else if (view === APP_VIEWS.feedbackNotes) {
      queueMicrotask(() => router.replace("/feedback-notes"));
    } else if (pathname.startsWith("/feedback-notes")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.feedbackNotes));
    } else if (view === APP_VIEWS.cvAnalyses) {
      queueMicrotask(() => router.replace("/cv-analysis"));
    } else if (pathname === "/cv-analysis") {
      queueMicrotask(() => setActiveView(APP_VIEWS.cvAnalyses));
    } else if (view === APP_VIEWS.jobAnalyses) {
      queueMicrotask(() => router.replace("/job-analyses"));
    } else if (pathname.startsWith("/job-analyses")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.jobAnalyses));
    } else if (view === APP_VIEWS.receivedFeedback) {
      queueMicrotask(() => router.replace("/received-feedback"));
    } else if (pathname.startsWith("/received-feedback")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.receivedFeedback));
    } else if (pathname.startsWith("/public-cv-messages")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.publicCVMessages));
    } else if (pathname.startsWith("/reviews")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.reviews));
    } else if (view === APP_VIEWS.reviews) {
      queueMicrotask(() => router.replace("/reviews"));
    } else if (pathname.startsWith("/activity-contexts")) {
      queueMicrotask(() => setActiveView(APP_VIEWS.activityContext));
    } else if (view === APP_VIEWS.settings) {
      queueMicrotask(() => router.replace("/settings"));
    } else if (pathname === "/settings") {
      queueMicrotask(() => setActiveView(APP_VIEWS.settings));
    } else if (pathname.startsWith("/admin") || view === APP_VIEWS.admin) {
      queueMicrotask(() => setActiveView(APP_VIEWS.admin));
    }
  }, [router, pathname, searchParams]);

  const handleSelect = (id: string, mode?: AnalysisMode) => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVAnalysesLocation();
    rememberCVLibraryLocation();

    if (mode === "job_match") {
      setActiveView(APP_VIEWS.jobAnalyses);
      router.push(`/job-analyses/${encodeURIComponent(id)}`);
    } else {
      setActiveView(APP_VIEWS.cvAnalyses);
      router.push(`/cv-analysis/${encodeURIComponent(id)}`);
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
    setActiveView(APP_VIEWS.home);
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
    setActiveView(APP_VIEWS.cvAnalyses);
    router.push("/cv-analysis?mode=new");
  };

  const handleOpenCVs = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    setActiveView(APP_VIEWS.cvs);
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
    setActiveView(APP_VIEWS.templates);
    router.push("/templates");
  };

  const handleOpenEditor = (cvId?: string | null) => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberCVLibraryLocation();
    const targetCvId = cvId !== undefined ? cvId : null;
    setActiveView(APP_VIEWS.editor);
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
    setActiveView(APP_VIEWS.questions);
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
    setActiveView(APP_VIEWS.journal);
    router.push(lastWorkJournalHrefRef.current);
  };

  const handleOpenObjectives = () => {
    rememberWorkJournalLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView(APP_VIEWS.objectives);
    router.push(lastObjectivesHrefRef.current);
  };

  const handleOpenFeedbackNotes = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView(APP_VIEWS.feedbackNotes);
    router.push(lastFeedbackNotesHrefRef.current);
  };

  const handleOpenReceivedFeedback = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView(APP_VIEWS.receivedFeedback);
    router.push(lastReceivedFeedbackHrefRef.current);
  };

  const handleOpenReviews = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView(APP_VIEWS.reviews);
    router.push("/reviews");
  };

  const handleOpenCVAnalyses = () => {
    rememberWorkJournalLocation();
    rememberObjectivesLocation();
    rememberFeedbackNotesLocation();
    rememberReceivedFeedbackLocation();
    rememberInterviewQuestionsLocation();
    rememberJobAnalysesLocation();
    rememberCVLibraryLocation();
    setActiveView(APP_VIEWS.cvAnalyses);
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
    setActiveView(APP_VIEWS.jobAnalyses);
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
    setActiveView(APP_VIEWS.settings);
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
    setActiveView(APP_VIEWS.admin);
    router.push("/admin/dashboard");
  };

  const handleNavigate = (view: SidebarActiveView) => {
    const handlers: Partial<Record<AppView, () => void>> = {
      [APP_VIEWS.home]: handleOpenHome,
      [APP_VIEWS.cvAnalyses]: handleOpenCVAnalyses,
      [APP_VIEWS.jobAnalyses]: handleOpenJobAnalyses,
      [APP_VIEWS.cvs]: handleOpenCVs,
      [APP_VIEWS.templates]: handleOpenTemplates,
      [APP_VIEWS.editor]: () => handleOpenEditor(),
      [APP_VIEWS.questions]: () => handleOpenQuestions(),
      [APP_VIEWS.journal]: handleOpenJournal,
      [APP_VIEWS.objectives]: handleOpenObjectives,
      [APP_VIEWS.receivedFeedback]: handleOpenReceivedFeedback,
      [APP_VIEWS.reviews]: handleOpenReviews,
      [APP_VIEWS.feedbackNotes]: handleOpenFeedbackNotes,
      [APP_VIEWS.settings]: handleOpenSettings,
      [APP_VIEWS.admin]: handleOpenAdmin,
      [APP_VIEWS.new]: handleNewAnalysis,
    };
    handlers[view]?.();
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <div className="app-glow" aria-hidden="true" />

      <ImpersonationBanner userEmail={userEmail} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
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
          onOpenReviews={handleOpenReviews}
          onOpenFeedbackNotes={handleOpenFeedbackNotes}
          onOpenSettings={handleOpenSettings}
          onOpenAdmin={handleOpenAdmin}
          userEmail={userEmail}
          isAdmin={isAdmin}
        />

        <main className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
          <AppShellContent
            activeView={activeView}
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
    </div>
  );
}
