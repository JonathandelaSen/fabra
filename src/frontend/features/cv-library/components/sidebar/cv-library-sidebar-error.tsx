"use client";

import { AlertBanner, ALERT_BANNER_TONES } from "@/frontend/components/shared/alert-banner";

interface CVLibrarySidebarErrorProps {
  error: string | null;
}

export function CVLibrarySidebarError({ error }: CVLibrarySidebarErrorProps) {
  if (!error) return null;

  return (
    <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>
      <p>{error}</p>
    </AlertBanner>
  );
}
