const PUBLIC_CV_SLUG_MAX_LENGTH = 72;

export function normalizePublicCVSlug(value: string | null | undefined) {
  const normalized = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]+/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, PUBLIC_CV_SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");

  return normalized || null;
}

export function buildPublicCVPath(publicId: string, slug: string) {
  return `/cv/${encodeURIComponent(publicId)}/${encodeURIComponent(slug)}`;
}
