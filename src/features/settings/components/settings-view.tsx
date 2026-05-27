"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { AISettingsPanel } from "./ai-settings-panel";
import { AccountSecurityPanel } from "./account-security-panel";
import { DeleteAccountPanel } from "./delete-account-panel";
import { LanguageSettingsPanel } from "./language-settings-panel";

interface SettingsViewProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  onAISettingsChange: (settings: {
    provider: StoredAIProvider;
    apiKey: string;
    model: string;
  }) => void;
  userEmail: string | null;
}

export default function SettingsView({
  aiProvider,
  aiApiKey,
  aiModel,
  onAISettingsChange,
  userEmail,
}: SettingsViewProps) {
  const t = useTranslations("settings");

  return (
    <FeatureScreenShell
      title={t("title")}
      bodyClassName="overflow-auto"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
        >
          <LanguageSettingsPanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <AISettingsPanel
            aiProvider={aiProvider}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            onAISettingsChange={onAISettingsChange}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <AccountSecurityPanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <DeleteAccountPanel userEmail={userEmail} />
        </motion.div>
      </div>
    </FeatureScreenShell>
  );
}
