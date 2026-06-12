import type { Metadata } from "next";
import Link from "next/link";
import { Download, Quote } from "lucide-react";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CVTemplatePreview } from "@/features/cv-templates";
import { cvLibraryModule } from "@/lib/container";
import { buildPublicCVPath } from "@/modules/cv-library";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCVTemplate, type CVTemplateId, type CVTemplateLocale } from "@/lib/cv-templates";
import { presentCVDocument } from "@/modules/cv-library";
import { getMessages } from "@/i18n/messages";
import { resolveInterfaceLanguage } from "@/i18n/server";
import { PublicFeedbackForm, PublicCVNotesOverlay } from "@/features/public-cv";

type PublicCVPageProps = {
  params: Promise<{
    publicId: string;
    slug: string;
  }>;
};

const getPublicCV = cache(async (publicId: string) => {
  const supabase = createAdminClient();
  const cv = await cvLibraryModule
    .bindRequest(supabase)
    .getPublishedCVDocument.execute({ publicId });
  return cv ? presentCVDocument(cv) : null;
});

const getPublicNotes = cache(async (cvId: string) => {
  const supabase = createAdminClient();
  cvLibraryModule.bindRequest(supabase);
  return cvLibraryModule.listPublishedCVPublicNotes.execute(cvId);
});

export async function generateMetadata({
  params,
}: PublicCVPageProps): Promise<Metadata> {
  const { publicId } = await params;
  const interfaceLocale = await resolveInterfaceLanguage();
  const messages = getMessages(interfaceLocale);
  const cv = await getPublicCV(publicId);
  const name = cv?.profile?.basics?.name ?? cv?.name ?? messages.publicCv.fallbackName;

  return {
    title: `${name} | Fabra`,
    description: messages.publicCv.metadataDescription,
    robots: { index: false, follow: false },
  };
}

export default async function PublicCVPage({ params }: PublicCVPageProps) {
  const { publicId, slug } = await params;
  const interfaceLocale = await resolveInterfaceLanguage();
  const messages = getMessages(interfaceLocale);
  const cv = await getPublicCV(publicId);

  if (!cv?.profile || !cv.template_id || !cv.public_slug || !cv.public_id) {
    notFound();
  }

  if (slug !== cv.public_slug) {
    notFound();
  }

  const template = getCVTemplate(cv.template_id);
  if (!template) {
    notFound();
  }

  const locale = template.locales.includes(cv.template_locale as CVTemplateLocale)
    ? (cv.template_locale as CVTemplateLocale)
    : "es";
  const notes = await getPublicNotes(cv.id);
  const noteValues = notes.map((note) => note.toPrimitives());

  return (
    <main className="public-cv-page min-h-screen bg-[#f4f1ec] text-zinc-950">
      <header className="border-b border-zinc-200/85 bg-[#f4f1ec]/90 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-zinc-950 transition-opacity hover:opacity-85">
            <img src="/brand/fabra-logo.svg" alt="Fabra Logo" className="h-5 w-5 object-contain" />
            <span>Fabra</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <a
              href={`${buildPublicCVPath(cv.public_id, cv.public_slug)}/pdf`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white/70 px-4 text-xs font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-white hover:text-zinc-950 hover:shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{messages.publicCv.downloadPdf}</span>
              <span className="sm:hidden">PDF</span>
            </a>
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-300 bg-white/70 px-4 text-xs font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-white hover:text-zinc-950 hover:shadow-sm"
            >
              {messages.publicCv.createMyCv}
            </Link>
          </div>
        </div>
      </header>

      <section className="public-cv-stage mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <div className="public-cv-document relative">
          <CVTemplatePreview
            profile={cv.profile}
            templateId={template.templateId as CVTemplateId}
            locale={locale}
          />
          {noteValues.length > 0 && (
            <PublicCVNotesOverlay notes={noteValues} />
          )}
        </div>

        {cv.public_feedback_enabled && (
          <div className="mt-8">
            <PublicFeedbackForm publicId={cv.public_id} />
          </div>
        )}
      </section>
    </main>
  );
}
