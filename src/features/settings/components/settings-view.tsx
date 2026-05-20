"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import type { StoredAIProvider } from "@/lib/browser-preferences";
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
    <div className="flex-1 overflow-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-5 border-b border-white/[0.06] pb-6"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
              <KeyRound className="h-3.5 w-3.5" />
              {t("badge")}
            </div>
            <h1 className="text-2xl font-semibold text-zinc-100">
              {t("title")}
            </h1>
          </div>
        </motion.div>

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
    </div>
  );
}
