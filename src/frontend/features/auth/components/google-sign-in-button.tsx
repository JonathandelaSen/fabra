"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="var(--brand-google-blue)"
        d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5a4.7 4.7 0 0 1-2 3.1v2.4h3.2c1.9-1.7 3.1-4.3 3.1-7.2Z"
      />
      <path
        fill="var(--brand-google-green)"
        d="M12 22c2.7 0 5-.9 6.7-2.4L15.5 17c-.9.6-2 1-3.5 1a5.9 5.9 0 0 1-5.5-4.1H3.2v2.5A10.1 10.1 0 0 0 12 22Z"
      />
      <path
        fill="var(--brand-google-yellow)"
        d="M6.5 13.9a6 6 0 0 1 0-3.8V7.6H3.2a10 10 0 0 0 0 8.8l3.3-2.5Z"
      />
      <path
        fill="var(--brand-google-red)"
        d="M12 6c1.6 0 3 .5 4.2 1.6l3.1-3.1A10 10 0 0 0 3.2 7.6l3.3 2.5A5.9 5.9 0 0 1 12 6Z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  const t = useTranslations("auth.google");

  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={onClick}
      className="h-11 w-full border-line/[0.12] bg-panel/[0.05] font-semibold text-text-main hover:bg-panel/[0.09] hover:text-text-on-bright"
    >
      <GoogleIcon />
      {loading ? t("redirecting") : t("continue")}
    </Button>
  );
}
