interface CVTemplatesLoaderState {
  isResolvingCvs: boolean;
  pathname: string;
  templateCount: number;
  templateId: string | null;
}

export function shouldShowCVTemplatesLoader({
  isResolvingCvs,
  pathname,
  templateCount,
  templateId,
}: CVTemplatesLoaderState) {
  return isResolvingCvs || (pathname === "/templates" && !templateId && templateCount > 0);
}
