"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, X } from "lucide-react";
import { cn } from "@/frontend/utils/utils";

interface Note {
  id: string;
  anchorType: string;
  sectionId: string | null;
  anchorId: string | null;
  body: string;
}

export function PublicCVNotesOverlay({ notes }: { notes: Note[] }) {
  const t = useTranslations("publicCv");
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { top: number; left: number }>>({});
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const calculatePositions = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newPositions: Record<string, { top: number; left: number }> = {};

    notes.forEach((note) => {
      let targetEl: HTMLElement | null = null;

      if (note.anchorType === "presentation") {
        targetEl = container.parentElement?.querySelector(".cvp-header") || null;
      } else if (note.anchorId) {
        // Try finding by bullet ID or item ID
        targetEl = container.parentElement?.querySelector(`[data-bullet-id="${note.anchorId}"]`) ||
                   container.parentElement?.querySelector(`[data-item-id="${note.anchorId}"]`) || null;
      }

      if (!targetEl && note.sectionId) {
        // Try finding by section ID
        targetEl = container.parentElement?.querySelector(`[data-section="${note.sectionId}"]`) || null;
      }

      if (targetEl) {
        const targetRect = targetEl.getBoundingClientRect();
        // Position at top-left of the target, offset to float in the left margin
        const top = targetRect.top - containerRect.top + 4;
        
        // On desktop, we float 42px to the left of the element.
        // On mobile, if margins are small, we stay within bounds (at least 8px from left edge)
        const left = Math.max(8, targetRect.left - containerRect.left - 44);

        newPositions[note.id] = { top, left };
      }
    });

    setPositions(newPositions);
  };

  useEffect(() => {
    // Wait for hydration/rendering to complete
    const timer = setTimeout(() => {
      calculatePositions();
    }, 150);

    window.addEventListener("resize", calculatePositions);
    
    // Also recalculate if there's any layout change
    const observer = new MutationObserver(calculatePositions);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculatePositions);
      observer.disconnect();
    };
  }, [notes]);

  // Click outside listener to close active popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeNoteId && containerRef.current) {
        const target = event.target as HTMLElement;
        if (!containerRef.current.contains(target)) {
          setActiveNoteId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeNoteId]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-40"
    >
      {notes.map((note) => {
        const pos = positions[note.id];
        if (!pos) return null;

        const isActive = activeNoteId === note.id;

        return (
          <div
            key={note.id}
            className="absolute pointer-events-auto"
            style={{
              top: pos.top,
              left: pos.left,
            }}
          >
            {/* The Pin */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveNoteId(isActive ? null : note.id);
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-white shadow-lg transition-all hover:scale-110 active:scale-95 duration-200 cursor-pointer",
                isActive
                  ? "bg-amber-600 border-amber-400 scale-110 ring-4 ring-amber-500/20"
                  : "bg-amber-500 border-white hover:bg-amber-600"
              )}
              title={t("ownerNoteLabel")}
            >
              <MessageSquare className="h-4 w-4" fill="currentColor" />
            </button>

            {/* The Figma-style popover comment box */}
            {isActive && (
              <div
                className="absolute z-50 mt-3 w-72 rounded-2xl border border-line bg-panel p-4 shadow-xl text-text-on-bright animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto dark:border-border dark:bg-popover dark:text-popover-foreground"
                style={{
                  // Position relative to the pin
                  left: -12,
                  top: "100%",
                }}
              >
                {/* Caret pointing to pin */}
                <div className="absolute -top-1.5 left-4 h-3 w-3 rotate-45 border-t border-l border-line bg-panel dark:border-border dark:bg-popover" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-warning-text bg-warning-soft px-2 py-0.5 rounded-md dark:text-warning-text dark:bg-warning-soft">
                      {t("ownerNoteLabel")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveNoteId(null)}
                      className="rounded-lg p-0.5 text-text-muted hover:bg-panel-elevated hover:text-text-faint cursor-pointer dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-text-faint font-medium whitespace-pre-wrap dark:text-muted-foreground">
                    {note.body}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
