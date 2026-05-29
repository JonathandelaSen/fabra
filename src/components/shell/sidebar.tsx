"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Briefcase,
  FolderOpen,
  Menu,
  LayoutTemplate,
  Wand2,
  MessageSquareQuote,
  BookOpenText,
  NotebookPen,
  Inbox,
  Target,
} from "lucide-react";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import SidebarNavSection from "./sidebar-nav-section";
import SidebarFooter from "./sidebar-footer";
import type { SidebarActiveView } from "./sidebar-types";

interface SidebarProps {
  activeView: SidebarActiveView;
  onNewAnalysis: () => void;
  onOpenCVAnalyses: () => void;
  onOpenJobAnalyses: () => void;
  onOpenCVs: () => void;
  onOpenTemplates: () => void;
  onOpenEditor: () => void;
  onOpenQuestions: () => void;
  onOpenJournal: () => void;
  onOpenObjectives: () => void;
  onOpenReceivedFeedback: () => void;
  onOpenFeedbackNotes: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  userEmail: string | null;
  isAdmin?: boolean;
}

export default function Sidebar({
  activeView,
  onNewAnalysis,
  onOpenCVAnalyses,
  onOpenJobAnalyses,
  onOpenCVs,
  onOpenTemplates,
  onOpenEditor,
  onOpenQuestions,
  onOpenJournal,
  onOpenObjectives,
  onOpenReceivedFeedback,
  onOpenFeedbackNotes,
  onOpenSettings,
  onOpenAdmin,
  userEmail,
  isAdmin = false,
}: SidebarProps) {
  const t = useTranslations("navigation");
  const common = useTranslations("common");
  useInterfaceLanguage();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cvSectionOpen, setCvSectionOpen] = useState(true);
  const [jobSectionOpen, setJobSectionOpen] = useState(true);

  const collapsed = internalCollapsed;

  const setCollapsed = (val: boolean) => {
    setInternalCollapsed(val);
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  



  return (
    <>
      <AnimatePresence>
        {isMobile && collapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setCollapsed(false)}
            className="md:hidden fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-900/30 active:scale-95 transition-transform"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCollapsed(true)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (collapsed ? 0 : 280) : collapsed ? 56 : 280,
          x: isMobile && collapsed ? -280 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`h-screen flex flex-col border-r border-white/[0.06] bg-[#0d0d14]/95 backdrop-blur-xl shrink-0 overflow-hidden z-50 ${
          isMobile ? "fixed left-0 top-0 bottom-0" : "relative"
        }`}
      >
        <div className="flex items-center justify-between p-3 h-14 shrink-0">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 min-w-0"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-sm text-zinc-100 truncate">
                  {common("appName")}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="px-2 pb-2 shrink-0">
          <button
            onClick={onNewAnalysis}
            className={`
            w-full flex items-center gap-2 rounded-lg font-medium transition-all duration-150
            bg-gradient-to-r from-primary-1 to-primary-2 text-white shadow-lg shadow-primary-1/30
            hover:brightness-110 active:scale-[0.97]
            ${collapsed ? "justify-center p-2" : "px-3 py-2.5 text-sm"}
          `}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t("newAnalysis")}</span>}
          </button>
        </div>

        <div className="px-2 pb-2 shrink-0 space-y-1">
          <SidebarNavSection
            id="cv-section"
            icon={FolderOpen}
            label={t("cvSection")}
            collapsed={collapsed}
            open={cvSectionOpen}
            onToggle={() => setCvSectionOpen((open) => !open)}
            items={[
              { icon: FileSearch, label: t("cvAnalyses"), active: activeView === "cv-analyses", onClick: onOpenCVAnalyses },
              { icon: FolderOpen, label: t("cvLibrary"), active: activeView === "cvs", onClick: onOpenCVs },
              { icon: LayoutTemplate, label: t("templates"), active: activeView === "templates", onClick: onOpenTemplates },
              { icon: Wand2, label: t("cvEditor"), active: activeView === "editor", onClick: onOpenEditor },
            ]}
          />
          <SidebarNavSection
            id="job-section"
            icon={Briefcase}
            label={t("careerSection")}
            collapsed={collapsed}
            open={jobSectionOpen}
            onToggle={() => setJobSectionOpen((open) => !open)}
            items={[
              { icon: Briefcase, label: t("jobAnalyses"), active: activeView === "job-analyses", onClick: onOpenJobAnalyses },
              { icon: MessageSquareQuote, label: t("interviewQuestions"), active: activeView === "questions", onClick: onOpenQuestions },
              { icon: BookOpenText, label: t("workJournal"), active: activeView === "journal", onClick: onOpenJournal },
              { icon: Target, label: t("objectives"), active: activeView === "objectives", onClick: onOpenObjectives },
              { icon: Inbox, label: t("receivedFeedback"), active: activeView === "received-feedback", onClick: onOpenReceivedFeedback },
              { icon: NotebookPen, label: t("feedbackNotes"), active: activeView === "feedback-notes", onClick: onOpenFeedbackNotes },
            ]}
          />
        </div>
        <SidebarFooter
          activeView={activeView}
          collapsed={collapsed}
          isAdmin={isAdmin}
          userEmail={userEmail}
          settingsLabel={t("settings")}
          observabilityLabel={t("observability")}
          onOpenSettings={onOpenSettings}
          onOpenAdmin={onOpenAdmin}
        />
      </motion.aside>
    </>
  );
}
