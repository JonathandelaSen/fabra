"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Save, Globe, MessageSquare, ArrowRight } from "lucide-react";
import type { StandardCVProfile } from "@/lib/cv-profile";
import type { PublicCVNoteResponse } from "@/app/api/cvs/[id]/public-notes/responses";
import { usePublicCVNotes } from "@/features/public-cv";
import { cn } from "@/lib/utils";

import { getSectionItems, getAvailableSections } from "./cv-public-notes-helpers";

type Draft = Omit<PublicCVNoteResponse, "id">;

export function CVPublicNotesEditor({ cvId, profile, feedbackEnabled }: { cvId: string; profile: StandardCVProfile; feedbackEnabled: boolean }) {
  const t = useTranslations("cvEditor.publicNotes");
  const publicNotes = usePublicCVNotes(cvId);
  const [notes, setNotes] = useState<Draft[]>([]);

  useEffect(() => {
    if (publicNotes.query.data) {
      setNotes(publicNotes.query.data.map(({ anchorType, sectionId, anchorId, body }) => ({ anchorType, sectionId, anchorId, body })));
    }
  }, [publicNotes.query.data]);

  const add = () => {
    setNotes((current) => [...current, { anchorType: "section", sectionId: "summary", anchorId: null, body: "" }]);
  };

  const updateNote = (index: number, updatedFields: Partial<Draft>) => {
    setNotes((current) => current.map((x, i) => i === index ? { ...x, ...updatedFields } : x));
  };

  const removeNote = (index: number) => {
    setNotes((current) => current.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-4 border-t border-white/5 pt-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
          <Globe className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
          <p className="text-[11px] text-zinc-600">{t("description")}</p>
        </div>
      </div>

      <label className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-zinc-300 transition-colors hover:bg-white/10 cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={feedbackEnabled}
          onChange={(event) => publicNotes.setFeedbackEnabled.mutate(event.target.checked)}
          className="rounded border-zinc-700 bg-zinc-900 text-sky-600 focus:ring-sky-600"
        />
        <span className="select-none font-medium">{t("acceptFeedback")}</span>
      </label>

      <div className="space-y-3">
        {notes.map((note, index) => {
          const availableSections = getAvailableSections(note.anchorType, profile);
          const items = getSectionItems(note.sectionId ?? "", profile);

          let selectedItemId = "";
          let selectedBulletId = "";

          if (note.anchorType === "item") {
            selectedItemId = note.anchorId ?? "";
          } else if (note.anchorType === "bullet" && note.anchorId) {
            const found = items.find((it) => it.bulletIds.includes(note.anchorId!));
            if (found) {
              selectedItemId = found.id;
              selectedBulletId = note.anchorId;
            }
          }

          return (
            <div key={index} className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t("anchorTypeLabel")}</label>
                  <select
                    value={note.anchorType}
                    onChange={(e) => {
                      const nextType = e.target.value as Draft["anchorType"];
                      const nextSections = getAvailableSections(nextType, profile);
                      const nextSection = nextSections[0] || null;
                      const nextItems = nextSection ? getSectionItems(nextSection, profile) : [];
                      
                      let nextAnchorId: string | null = null;
                      if (nextType === "item" && nextItems.length > 0) {
                        nextAnchorId = nextItems[0].id;
                      } else if (nextType === "bullet" && nextItems.length > 0) {
                        nextAnchorId = nextItems[0].bulletIds[0] || null;
                      }

                      updateNote(index, {
                        anchorType: nextType,
                        sectionId: nextSection,
                        anchorId: nextAnchorId,
                      });
                    }}
                    className="w-full rounded-xl border border-white/5 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                  >
                    <option value="presentation">{t("presentation")}</option>
                    <option value="section">{t("section")}</option>
                    <option value="item">{t("item")}</option>
                    <option value="bullet">{t("bullet")}</option>
                  </select>
                </div>

                {note.anchorType !== "presentation" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t("sectionLabel")}</label>
                    <select
                      value={note.sectionId ?? ""}
                      onChange={(e) => {
                        const nextSection = e.target.value;
                        const nextItems = getSectionItems(nextSection, profile);
                        let nextAnchorId: string | null = null;

                        if (note.anchorType === "item" && nextItems.length > 0) {
                          nextAnchorId = nextItems[0].id;
                        } else if (note.anchorType === "bullet" && nextItems.length > 0) {
                          nextAnchorId = nextItems[0].bulletIds[0] || null;
                        }

                        updateNote(index, {
                          sectionId: nextSection,
                          anchorId: nextAnchorId,
                        });
                      }}
                      className="w-full rounded-xl border border-white/5 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                    >
                      {availableSections.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {note.anchorType === "item" && items.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t("targetItemLabel")}</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => updateNote(index, { anchorId: e.target.value })}
                    className="w-full rounded-xl border border-white/5 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                  >
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {note.anchorType === "bullet" && items.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t("targetItemLabel")}</label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => {
                        const itemId = e.target.value;
                        const item = items.find((it) => it.id === itemId);
                        const firstBulletId = item?.bulletIds[0] || null;
                        updateNote(index, { anchorId: firstBulletId });
                      }}
                      className="w-full rounded-xl border border-white/5 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-sky-500 col-span-1"
                    >
                      <option value="">{t("chooseItemLabel")}</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t("targetBulletLabel")}</label>
                    <select
                      value={selectedBulletId}
                      disabled={!selectedItemId}
                      onChange={(e) => updateNote(index, { anchorId: e.target.value })}
                      className="w-full rounded-xl border border-white/5 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-sky-500 col-span-1"
                    >
                      <option value="">{t("chooseBulletLabel")}</option>
                      {(() => {
                        const item = items.find((it) => it.id === selectedItemId);
                        if (!item) return null;
                        return item.bullets.map((b: string, bIdx: number) => {
                          const bId = item.bulletIds[bIdx] || `bullet-${bIdx}`;
                          const trunc = b.length > 40 ? b.slice(0, 40) + "..." : b;
                          return (
                            <option key={bId} value={bId}>
                              {trunc}
                            </option>
                          );
                        });
                      })()}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t("noteContentLabel")}</label>
                <textarea
                  value={note.body}
                  onChange={(e) => updateNote(index, { body: e.target.value })}
                  placeholder={t("notePlaceholderText")}
                  className="min-h-24 w-full rounded-xl border border-white/5 bg-zinc-900 p-3 text-xs text-white outline-none focus:border-sky-500 placeholder:text-zinc-600 resize-y"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeNote(index)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 active:bg-rose-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("remove")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={add}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-xs font-medium text-white transition-all hover:bg-white/10 active:bg-white/15 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t("add")}
        </button>
        <button
          type="button"
          onClick={() => publicNotes.replace.mutate(notes)}
          disabled={publicNotes.replace.isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Save className="h-4 w-4" />
          {publicNotes.replace.isPending ? t("saving") : t("save")}
        </button>
      </div>

      {feedbackEnabled && (
        <Link href={`/public-cv-messages/${encodeURIComponent(cvId)}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
            <MessageSquare className="h-3.5 w-3.5" />
            {t("receivedFeedbackTitle")}
          </span>
          <ArrowRight className="h-4 w-4 text-zinc-500" />
        </Link>
      )}
    </section>
  );
}
