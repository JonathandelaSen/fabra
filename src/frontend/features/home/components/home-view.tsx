"use client";

import { useTranslations } from "next-intl";
import {
  Upload,
  FileSearch,
  Briefcase,
  BookOpenText,
  Target,
  Inbox,
} from "lucide-react";
import { FeatureScreenShell } from "@/frontend/components/shared/feature-screen-shell";
import type { SidebarActiveView } from "@/frontend/components/shell/sidebar-types";
import HeroSection from "./hero-section";
import QuickActionsBlock from "./quick-actions-block";
import type { QuickAction } from "./quick-actions-block";

interface HomeViewProps {
  userEmail: string | null;
  onNavigate: (view: SidebarActiveView) => void;
}

export default function HomeView({ userEmail, onNavigate }: HomeViewProps) {
  const t = useTranslations("home");

  const cvActions: QuickAction[] = [
    {
      label: t("cvBlock.uploadCv"),
      description: t("cvBlock.uploadCvDescription"),
      icon: Upload,
      onClick: () => onNavigate("cvs"),
    },
    {
      label: t("cvBlock.analyzeCv"),
      description: t("cvBlock.analyzeCvDescription"),
      icon: FileSearch,
      onClick: () => onNavigate("cv-analyses"),
    },
    {
      label: t("cvBlock.compareOffers"),
      description: t("cvBlock.compareOffersDescription"),
      icon: Briefcase,
      onClick: () => onNavigate("job-analyses"),
    },
  ];

  const careerActions: QuickAction[] = [
    {
      label: t("careerBlock.workJournal"),
      description: t("careerBlock.workJournalDescription"),
      icon: BookOpenText,
      onClick: () => onNavigate("journal"),
    },
    {
      label: t("careerBlock.objectives"),
      description: t("careerBlock.objectivesDescription"),
      icon: Target,
      onClick: () => onNavigate("objectives"),
    },
    {
      label: t("careerBlock.feedback"),
      description: t("careerBlock.feedbackDescription"),
      icon: Inbox,
      onClick: () => onNavigate("received-feedback"),
    },
  ];

  return (
    <FeatureScreenShell
      title={t("title")}
      bodyClassName="overflow-y-auto"
    >
      <div className="space-y-10">
        <HeroSection userEmail={userEmail} />
        <div className="grid gap-8 md:grid-cols-2">
          <QuickActionsBlock title={t("cvBlock.title")} actions={cvActions} />
          <QuickActionsBlock
            title={t("careerBlock.title")}
            actions={careerActions}
          />
        </div>
      </div>
    </FeatureScreenShell>
  );
}
