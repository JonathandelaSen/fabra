"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Code, FileJson, FileText } from "lucide-react";
import type { CVProfilePrimitives } from "@/lib/cv-profile";
import { ProfileSection } from "./cv-library-profile-section";
import { SyntaxHighlightedJson } from "./syntax-highlighted-json";

type ViewMode = "formatted" | "raw";

interface CVLibraryJsonPreviewProps {
  profile: CVProfilePrimitives | null;
}

export function CVLibraryJsonPreview({ profile }: CVLibraryJsonPreviewProps) {
  const t = useTranslations("jsonResumeImport.preview");
  const [view, setView] = useState<ViewMode>("formatted");

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center text-text-muted">
        <FileJson className="mr-2 h-5 w-5" />
        <span className="text-sm">{t("noProfile")}</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col bg-field-code">
      <div className="flex items-center justify-end gap-1 border-b border-line-default/60 px-4 py-1.5">
        <button
          onClick={() => setView("formatted")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            view === "formatted"
              ? "bg-panel-control text-text-on-bright"
              : "text-text-muted hover:text-text-soft"
          }`}
        >
          <FileText className="h-3 w-3" />
          {t("formatted")}
        </button>
        <button
          onClick={() => setView("raw")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            view === "raw"
              ? "bg-panel-control text-text-on-bright"
              : "text-text-muted hover:text-text-soft"
          }`}
        >
          <Code className="h-3 w-3" />
          JSON
        </button>
      </div>

      {view === "raw" ? (
        <div className="p-6">
          <SyntaxHighlightedJson value={profile} />
        </div>
      ) : (
        <FormattedProfile profile={profile} t={t} />
      )}
    </div>
  );
}

function FormattedProfile({
  profile,
  t,
}: {
  profile: CVProfilePrimitives;
  t: ReturnType<typeof useTranslations<"jsonResumeImport.preview">>;
}) {
  return (
    <div className="p-6">
      <ProfileSection title={profile.basics?.name ?? "CV"}>
        {profile.basics?.headline && (
          <p className="text-sm text-action-text">{profile.basics.headline}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
          {profile.basics?.email && <span>{profile.basics.email}</span>}
          {profile.basics?.phone && <span>{profile.basics.phone}</span>}
          {profile.basics?.location && <span>{profile.basics.location}</span>}
        </div>
        {profile.basics?.links && profile.basics.links.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-text-muted">
            {profile.basics.links.map((link, i) => (
              <span key={i}>{link.label ?? link.url}</span>
            ))}
          </div>
        )}
      </ProfileSection>

      {profile.summary && (
        <ProfileSection title={t("summary")}>
          <p className="text-sm text-text-soft">{profile.summary}</p>
        </ProfileSection>
      )}

      {profile.experience && profile.experience.length > 0 && (
        <ProfileSection title={t("experience")}>
          {profile.experience.map((exp, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-text-soft">
                  {exp.role}{exp.company ? ` · ${exp.company}` : ""}
                </span>
                {exp.dates && (
                  <span className="shrink-0 text-xs text-text-faint">
                    {exp.dates.start}
                    {exp.dates.end
                      ? ` – ${exp.dates.end}`
                      : exp.dates.current
                        ? ` – ${t("present")}`
                        : ""}
                  </span>
                )}
              </div>
              {exp.location && <p className="text-xs text-text-muted">{exp.location}</p>}
              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-text-muted">
                  {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </ProfileSection>
      )}

      {profile.education && profile.education.length > 0 && (
        <ProfileSection title={t("education")}>
          {profile.education.map((edu, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <span className="text-sm font-medium text-text-soft">
                {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
              </span>
              {edu.institution && (
                <span className="text-sm text-text-muted"> · {edu.institution}</span>
              )}
              {edu.dates && (
                <span className="ml-2 text-xs text-text-faint">
                  {edu.dates.start}{edu.dates.end ? ` – ${edu.dates.end}` : ""}
                </span>
              )}
            </div>
          ))}
        </ProfileSection>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <ProfileSection title={t("skills")}>
          {profile.skills.map((group, i) => (
            <div key={i} className="mb-1 last:mb-0">
              {group.name && (
                <span className="text-xs font-medium text-text-soft">{group.name}: </span>
              )}
              <span className="text-xs text-text-muted">
                {group.items?.join(", ")}
              </span>
            </div>
          ))}
        </ProfileSection>
      )}

      {profile.languages && profile.languages.length > 0 && (
        <ProfileSection title={t("languages")}>
          <div className="flex flex-wrap gap-x-4 text-xs text-text-muted">
            {profile.languages.map((lang, i) => (
              <span key={i}>
                {lang.name}{lang.level ? ` (${lang.level})` : ""}
              </span>
            ))}
          </div>
        </ProfileSection>
      )}

      {profile.certifications && profile.certifications.length > 0 && (
        <ProfileSection title={t("certifications")}>
          {profile.certifications.map((cert, i) => (
            <p key={i} className="text-xs text-text-muted">
              {cert.name}{cert.issuer ? ` · ${cert.issuer}` : ""}
            </p>
          ))}
        </ProfileSection>
      )}
    </div>
  );
}

