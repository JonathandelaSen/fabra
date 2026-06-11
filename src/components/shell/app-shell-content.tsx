"use client";

import type { ReactNode } from "react";
import { CVEditorView } from "@/features/cv-editor";
import { CVLibraryView } from "@/features/cv-library";
import { CVTemplatesView } from "@/features/cv-templates";
import { CVAnalysisView } from "@/features/cv-analysis";
import { InterviewQuestionsView } from "@/features/interview-questions";
import { WorkJournalView } from "@/features/work-journal";
import { ObjectivesView } from "@/features/objectives";
import { FeedbackNotesView } from "@/features/feedback-notes";
import { ReceivedFeedbackView } from "@/features/received-feedback";
import { PerformanceReviewView } from "@/features/performance-review";
import { ActivityContextView } from "@/features/activity-context";
import { AdminAreaView } from "@/features/admin";
import { HomeView } from "@/features/home";
import { JobMatchAnalysisView } from "@/features/job-match-analysis";
import { SettingsView } from "@/features/settings";
import type { InterviewQuestionResponse as InterviewQuestionSummary } from "@/app/api/interview-questions/responses";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import type { AnalysisMode } from "@/lib/analysis-types";
import type { SidebarActiveView } from "./sidebar-types";

interface AppShellContentProps {
  activeView: SidebarActiveView;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  userEmail: string | null;
  isAdmin: boolean;
  interviewQuestions: InterviewQuestionSummary[];
  onOpenSettings: () => void;
  onOpenQuestions: (options?: { cvId?: string | null; analysisId?: string | null }) => void;
  onNewAnalysis: () => void;
  onOpenAnalysis: (id: string, mode?: AnalysisMode) => void;
  onOpenEditor: (cvId?: string | null) => void;
  onOpenTemplates: () => void;
  onOpenCVs: () => void;
  onInterviewQuestionCreated: () => void;
  onAISettingsChange: (settings: {
    provider: StoredAIProvider;
    apiKey: string;
    model: string;
  }) => void;
  onNavigate: (view: SidebarActiveView) => void;
}

function ViewFrame({
  children,
  frameKey,
}: {
  children: ReactNode;
  frameKey: string;
}) {
  return (
    <div key={frameKey} className="flex-1 flex flex-col overflow-hidden min-h-0">
      {children}
    </div>
  );
}

export default function AppShellContent({
  activeView,
  aiProvider,
  aiApiKey,
  aiModel,
  userEmail,
  isAdmin,
  interviewQuestions,
  onOpenSettings,
  onOpenQuestions,
  onNewAnalysis,
  onOpenAnalysis,
  onOpenEditor,
  onOpenTemplates,
  onOpenCVs,
  onInterviewQuestionCreated,
  onAISettingsChange,
  onNavigate,
}: AppShellContentProps) {
  const hasAIApiKey = aiProvider === "mock" || aiApiKey.length > 0;

  if (activeView === "home") {
    return (
      <ViewFrame frameKey="home">
        <HomeView userEmail={userEmail} onNavigate={onNavigate} />
      </ViewFrame>
    );
  }

  if (activeView === "new" || activeView === "cv-analyses") {
    return (
      <ViewFrame frameKey={activeView === "new" ? "new-analysis" : "cv-analyses-list"}>
        <CVAnalysisView
          aiProvider={aiProvider}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          hasAIApiKey={hasAIApiKey}
          onOpenSettings={onOpenSettings}
          onOpenQuestions={(options) => onOpenQuestions(options)}
        />
      </ViewFrame>
    );
  }

  if (activeView === "job-analyses") {
    return (
      <ViewFrame frameKey="job-analyses-list">
        <JobMatchAnalysisView
          aiProvider={aiProvider}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          hasAIApiKey={hasAIApiKey}
          onOpenSettings={onOpenSettings}
          onOpenQuestions={(options) => onOpenQuestions(options)}
          interviewQuestions={interviewQuestions}
          onInterviewQuestionCreated={onInterviewQuestionCreated}
        />
      </ViewFrame>
    );
  }

  if (activeView === "cvs") {
    return (
      <ViewFrame frameKey="cv-library">
        <CVLibraryView
          onOpenAnalysis={onOpenAnalysis}
          onOpenEditor={onOpenEditor}
          onOpenQuestions={(cvId) => onOpenQuestions({ cvId })}
          onStartAnalysis={onNewAnalysis}
        />
      </ViewFrame>
    );
  }

  if (activeView === "templates") {
    return (
      <ViewFrame frameKey="templates">
        <CVTemplatesView
          onOpenSettings={onOpenSettings}
          onOpenEditor={onOpenEditor}
          onOpenUpload={onNewAnalysis}
        />
      </ViewFrame>
    );
  }

  if (activeView === "editor") {
    return (
      <ViewFrame frameKey="editor">
        <CVEditorView
          onOpenTemplates={onOpenTemplates}
          onOpenSettings={onOpenSettings}
          onStartAnalysis={onNewAnalysis}
          onBackToLibrary={onOpenCVs}
        />
      </ViewFrame>
    );
  }

  if (activeView === "questions") {
    return (
      <ViewFrame frameKey="interview-questions">
        <InterviewQuestionsView
          aiProvider={aiProvider}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          hasAIApiKey={hasAIApiKey}
          onOpenSettings={onOpenSettings}
          onOpenAnalysis={(id) => onOpenAnalysis(id, "job_match")}
        />
      </ViewFrame>
    );
  }

  if (activeView === "journal") {
    return (
      <ViewFrame frameKey="work-journal">
        <WorkJournalView
          aiProvider={aiProvider}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          hasAIApiKey={hasAIApiKey}
          onOpenSettings={onOpenSettings}
        />
      </ViewFrame>
    );
  }

  if (activeView === "objectives") {
    return (
      <ViewFrame frameKey="objectives">
        <ObjectivesView />
      </ViewFrame>
    );
  }

  if (activeView === "feedback-notes") {
    return (
      <ViewFrame frameKey="feedback-notes">
        <FeedbackNotesView
          aiProvider={aiProvider}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          hasAIApiKey={hasAIApiKey}
          onOpenSettings={onOpenSettings}
        />
      </ViewFrame>
    );
  }

  if (activeView === "received-feedback") {
    return (
      <ViewFrame frameKey="received-feedback">
        <ReceivedFeedbackView />
      </ViewFrame>
    );
  }

  if (activeView === "reviews") {
    return (
      <ViewFrame frameKey="reviews">
        <PerformanceReviewView
          aiProvider={aiProvider}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          hasAIApiKey={hasAIApiKey}
          onOpenSettings={onOpenSettings}
        />
      </ViewFrame>
    );
  }

  if (activeView === "activity-context") {
    return (
      <ViewFrame frameKey="activity-context">
        <ActivityContextView />
      </ViewFrame>
    );
  }

  if (activeView === "settings") {
    return (
      <ViewFrame frameKey="settings">
        <SettingsView
          aiProvider={aiProvider}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          onAISettingsChange={onAISettingsChange}
          userEmail={userEmail}
        />
      </ViewFrame>
    );
  }

  if (activeView === "admin" && isAdmin) {
    return (
      <ViewFrame frameKey="admin-area">
        <AdminAreaView userEmail={userEmail} />
      </ViewFrame>
    );
  }

  return null;
}
