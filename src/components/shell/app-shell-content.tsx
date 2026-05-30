"use client";

import type { ReactNode } from "react";
import { CVEditorView } from "@/features/cv-editor";
import { CVLibraryView } from "@/features/cv-library";
import { CVTemplatesView } from "@/features/cv-templates";
import {
  CVAnalysisDetailView,
  CVAnalysisView,
  type CVAnalysisDetail,
  type CVAnalysisDetailTab,
} from "@/features/cv-analysis";
import { InterviewQuestionsView } from "@/features/interview-questions";
import { WorkJournalView } from "@/features/work-journal";
import { ObjectivesView } from "@/features/objectives";
import { FeedbackNotesView } from "@/features/feedback-notes";
import { ReceivedFeedbackView } from "@/features/received-feedback";
import { ActivityContextView } from "@/features/activity-context";
import { AdminObservabilityView } from "@/features/admin-observability";
import { HomeView } from "@/features/home";
import { JobMatchAnalysisView } from "@/features/job-match-analysis";
import { SettingsView } from "@/features/settings";
import type { InterviewQuestionResponse as InterviewQuestionSummary } from "@/app/api/interview-questions/responses";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import type { SidebarActiveView } from "./sidebar-types";

interface AppShellContentProps {
  activeView: SidebarActiveView;
  activeEditorCvId: string | null;
  activeAnalysis: CVAnalysisDetail | null;
  loadingDetail: boolean;
  viewTab: CVAnalysisDetailTab;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  userEmail: string | null;
  isAdmin: boolean;
  interviewQuestions: InterviewQuestionSummary[];
  onOpenSettings: () => void;
  onOpenQuestions: (options?: { cvId?: string | null; analysisId?: string | null }) => void;
  onNewAnalysis: () => void;
  onOpenAnalysis: (id: string) => void;
  onOpenEditor: (cvId?: string | null) => void;
  onOpenTemplates: () => void;
  onOpenCVs: () => void;
  onTabChange: (tab: CVAnalysisDetailTab) => void;
  onAIAnalysisComplete: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateAnalysis: (id: string) => void;
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
  activeEditorCvId,
  activeAnalysis,
  loadingDetail,
  viewTab,
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
  onTabChange,
  onAIAnalysisComplete,
  onDelete,
  onUpdateAnalysis,
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
          onNewAnalysis={onNewAnalysis}
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
          activeVersionId={activeEditorCvId}
          onOpenTemplates={onOpenTemplates}
          onOpenSettings={onOpenSettings}
          onStartAnalysis={onNewAnalysis}
          onOpenVersion={onOpenEditor}
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
          onOpenAnalysis={onOpenAnalysis}
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
      <ViewFrame frameKey="admin-observability">
        <AdminObservabilityView userEmail={userEmail} />
      </ViewFrame>
    );
  }

  return (
    <CVAnalysisDetailView
      analysis={activeAnalysis}
      loading={loadingDetail}
      activeTab={viewTab}
      aiProvider={aiProvider}
      aiApiKey={aiApiKey}
      aiModel={aiModel}
      hasAIApiKey={hasAIApiKey}
      interviewQuestions={interviewQuestions}
      onTabChange={onTabChange}
      onAIAnalysisComplete={onAIAnalysisComplete}
      onDelete={onDelete}
      onUpdate={onUpdateAnalysis}
      onInterviewQuestionCreated={onInterviewQuestionCreated}
      onOpenQuestions={onOpenQuestions}
      onOpenSettings={onOpenSettings}
    />
  );
}
