export const ACTIVITY_CONTEXT_SUGGESTION_ACTIONS = {
  PROMOTE: "promote",
  HIDE: "hide",
} as const;

export type ActivityContextSuggestionAction =
  (typeof ACTIVITY_CONTEXT_SUGGESTION_ACTIONS)[keyof typeof ACTIVITY_CONTEXT_SUGGESTION_ACTIONS];
