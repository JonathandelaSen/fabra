export const WORK_JOURNAL_SUGGESTION_ACTIONS = {
  PROMOTE: "promote",
  HIDE: "hide",
} as const;

export type WorkJournalSuggestionAction =
  (typeof WORK_JOURNAL_SUGGESTION_ACTIONS)[keyof typeof WORK_JOURNAL_SUGGESTION_ACTIONS];
