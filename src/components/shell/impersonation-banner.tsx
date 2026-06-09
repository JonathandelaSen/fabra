"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  clearImpersonationMarker,
  getImpersonationMarker,
} from "@/frontend/impersonation-storage";

interface ImpersonationBannerProps {
  userEmail: string | null;
}

export function ImpersonationBanner({ userEmail }: ImpersonationBannerProps) {
  const t = useTranslations("admin.impersonation");
  const [marker, setMarker] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setMarker(getImpersonationMarker());
  }, []);

  if (!marker || !userEmail || marker !== userEmail) {
    return null;
  }

  const handleExit = async () => {
    setExiting(true);
    try {
      await createClient().auth.signOut();
    } finally {
      clearImpersonationMarker();
      window.location.assign("/login");
    }
  };

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm text-amber-200">
      <div className="flex min-w-0 items-center gap-2">
        <UserRound className="h-4 w-4 shrink-0" />
        <span className="truncate">{t("banner", { email: userEmail })}</span>
      </div>
      <button
        type="button"
        onClick={handleExit}
        disabled={exiting}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-amber-400/40 px-2.5 py-1 text-xs font-medium text-amber-100 transition hover:bg-amber-500/20 disabled:opacity-60"
      >
        <LogOut className="h-3.5 w-3.5" />
        {t("exit")}
      </button>
    </div>
  );
}
