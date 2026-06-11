"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
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
  Award,
  Home,
  X,
} from "lucide-react";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import SidebarNavSection from "./sidebar-nav-section";
import SidebarFooter from "./sidebar-footer";
import type { SidebarActiveView } from "./sidebar-types";

interface SidebarProps {
  activeView: SidebarActiveView;
  onOpenHome: () => void;
  onOpenCVAnalyses: () => void;
  onOpenJobAnalyses: () => void;
  onOpenCVs: () => void;
  onOpenTemplates: () => void;
  onOpenEditor: () => void;
  onOpenQuestions: () => void;
  onOpenJournal: () => void;
  onOpenObjectives: () => void;
  onOpenReceivedFeedback: () => void;
  onOpenReviews: () => void;
  onOpenFeedbackNotes: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  userEmail: string | null;
  isAdmin?: boolean;
}

export default function Sidebar({
  activeView,
  onOpenHome,
  onOpenCVAnalyses,
  onOpenJobAnalyses,
  onOpenCVs,
  onOpenTemplates,
  onOpenEditor,
  onOpenQuestions,
  onOpenJournal,
  onOpenObjectives,
  onOpenReceivedFeedback,
  onOpenReviews,
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
  const [viewportWidth, setViewportWidth] = useState(0);
  const [cvSectionOpen, setCvSectionOpen] = useState(true);
  const [jobSectionOpen, setJobSectionOpen] = useState(true);

  const collapsed = internalCollapsed;

  const setCollapsed = (val: boolean) => {
    setInternalCollapsed(val);
  };

  const handleNavigationClick = (navigate: () => void) => {
    navigate();
    if (isMobile) {
      setCollapsed(true);
    }
  };

  useEffect(() => {
    let previousWidth = window.innerWidth;
    let previousMobile = previousWidth < 768;

    const checkMobile = (initial = false) => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);

      if (width !== previousWidth || initial) {
        setViewportWidth(width);
      }

      if (mobile && (initial || !previousMobile)) {
        setCollapsed(true);
      }

      previousWidth = width;
      previousMobile = mobile;
    };

    checkMobile(true);
    const onResize = () => checkMobile();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
            className="md:hidden fixed bottom-6 right-6 z-[60] w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-900/30 active:scale-95 transition-transform cursor-pointer"
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
          width: isMobile ? viewportWidth : collapsed ? 56 : 280,
          x: isMobile && collapsed ? -viewportWidth : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`h-screen flex flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl shrink-0 overflow-hidden z-50 ${
          isMobile ? "fixed left-0 top-0 bottom-0 w-screen" : "relative"
        }`}
      >
        <div className="flex items-center justify-between p-3 h-14 shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <img
                  src="/brand/fabra-logo.svg"
                  alt="Fabra Logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="font-semibold text-sm text-sidebar-foreground truncate">
                {common("appName")}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="w-8 h-8 flex items-center justify-center shrink-0 hover:bg-panel-hover rounded-md transition-colors cursor-pointer"
              title={common("appName")}
            >
              <img
                src="/brand/fabra-logo.svg"
                alt="Fabra Logo"
                className="w-7 h-7 object-contain"
              />
            </button>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              aria-label={common("actions.close")}
              className={`rounded-md flex items-center justify-center text-text-muted hover:text-text-soft hover:bg-panel-hover transition-colors shrink-0 cursor-pointer ${
                isMobile ? "w-9 h-9" : "w-7 h-7"
              }`}
            >
              {isMobile ? (
                <X className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <div className="px-2 pb-2 flex-1 min-h-0 overflow-y-auto space-y-1">
          <button
            onClick={() => handleNavigationClick(onOpenHome)}
            className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors ${
              activeView === "home"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-text-muted hover:bg-panel-hover hover:text-text-soft"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <Home className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t("home")}</span>}
          </button>
          <SidebarNavSection
            icon={FolderOpen}
            label={t("cvSection")}
            collapsed={collapsed}
            open={cvSectionOpen}
            onToggle={() => setCvSectionOpen((open) => !open)}
            items={[
              { icon: FileSearch, label: t("cvAnalyses"), active: activeView === "cv-analyses", onClick: () => handleNavigationClick(onOpenCVAnalyses) },
              { icon: FolderOpen, label: t("cvLibrary"), active: activeView === "cvs", onClick: () => handleNavigationClick(onOpenCVs) },
              { icon: LayoutTemplate, label: t("templates"), active: activeView === "templates", onClick: () => handleNavigationClick(onOpenTemplates) },
              { icon: Wand2, label: t("cvEditor"), active: activeView === "editor", onClick: () => handleNavigationClick(onOpenEditor) },
            ]}
          />
          <SidebarNavSection
            icon={Briefcase}
            label={t("careerSection")}
            collapsed={collapsed}
            open={jobSectionOpen}
            onToggle={() => setJobSectionOpen((open) => !open)}
            items={[
              { icon: Briefcase, label: t("jobAnalyses"), active: activeView === "job-analyses", onClick: () => handleNavigationClick(onOpenJobAnalyses) },
              { icon: MessageSquareQuote, label: t("interviewQuestions"), active: activeView === "questions", onClick: () => handleNavigationClick(onOpenQuestions) },
              { icon: BookOpenText, label: t("workJournal"), active: activeView === "journal", onClick: () => handleNavigationClick(onOpenJournal) },
              { icon: Target, label: t("objectives"), active: activeView === "objectives", onClick: () => handleNavigationClick(onOpenObjectives) },
              { icon: Inbox, label: t("receivedFeedback"), active: activeView === "received-feedback", onClick: () => handleNavigationClick(onOpenReceivedFeedback) },
              { icon: Award, label: t("reviews"), active: activeView === "reviews", onClick: () => handleNavigationClick(onOpenReviews) },
              { icon: NotebookPen, label: t("feedbackNotes"), active: activeView === "feedback-notes", onClick: () => handleNavigationClick(onOpenFeedbackNotes) },
            ]}
          />
        </div>
        <SidebarFooter
          activeView={activeView}
          collapsed={collapsed}
          isAdmin={isAdmin}
          userEmail={userEmail}
          settingsLabel={t("settings")}
          adminLabel={t("admin")}
          onOpenSettings={() => handleNavigationClick(onOpenSettings)}
          onOpenAdmin={() => handleNavigationClick(onOpenAdmin)}
        />
      </motion.aside>
    </>
  );
}
