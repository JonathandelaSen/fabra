"use client";

import { useCallback, useState } from "react";
import type { CVProfilePrimitives } from "@/lib/cv-profile";

type ProfileUpdater = (prev: CVProfilePrimitives) => CVProfilePrimitives;
type ProfileHistorySource = "manual" | "instant";

const MAX_HISTORY_ITEMS = 50;
const MANUAL_HISTORY_GROUP_MS = 900;

interface ProfileHistoryState {
  past: CVProfilePrimitives[];
  present: CVProfilePrimitives | null;
  future: CVProfilePrimitives[];
  lastManualChangeAt: number;
}

function cloneProfile(profile: CVProfilePrimitives): CVProfilePrimitives {
  return structuredClone(profile);
}

function serializeProfile(profile: CVProfilePrimitives | null): string {
  return JSON.stringify(profile);
}

function toProfile(value: CVProfilePrimitives | null | undefined) {
  return value ? cloneProfile(value) : null;
}

export function useProfileHistory(initialProfile: CVProfilePrimitives | null | undefined) {
  const [state, setState] = useState<ProfileHistoryState>(() => ({
    past: [],
    present: toProfile(initialProfile),
    future: [],
    lastManualChangeAt: 0,
  }));

  const reset = useCallback((profile: CVProfilePrimitives | null | undefined) => {
    setState({
      past: [],
      present: toProfile(profile),
      future: [],
      lastManualChangeAt: 0,
    });
  }, []);

  const setProfile = useCallback((
    updater: CVProfilePrimitives | ProfileUpdater,
    source: ProfileHistorySource = "manual"
  ) => {
    setState((current) => {
      if (!current.present) return current;

      const nextProfile =
        typeof updater === "function"
          ? (updater as ProfileUpdater)(current.present)
          : updater;
      const next = cloneProfile(nextProfile);
      if (serializeProfile(next) === serializeProfile(current.present)) {
        return current;
      }

      const now = Date.now();
      const shouldGroupManualChange =
        source === "manual" &&
        current.lastManualChangeAt > 0 &&
        now - current.lastManualChangeAt <= MANUAL_HISTORY_GROUP_MS;

      return {
        past: shouldGroupManualChange
          ? current.past
          : [...current.past, current.present].slice(-MAX_HISTORY_ITEMS),
        present: next,
        future: [],
        lastManualChangeAt: source === "manual" ? now : 0,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((current) => {
      const previous = current.past.at(-1);
      if (!previous || !current.present) return current;

      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future].slice(0, MAX_HISTORY_ITEMS),
        lastManualChangeAt: 0,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      const next = current.future[0];
      if (!next || !current.present) return current;

      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY_ITEMS),
        present: next,
        future: current.future.slice(1),
        lastManualChangeAt: 0,
      };
    });
  }, []);

  return {
    past: state.past,
    present: state.present,
    future: state.future,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    reset,
    setProfile,
    undo,
    redo,
  };
}
