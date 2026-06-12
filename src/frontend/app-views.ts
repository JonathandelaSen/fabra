export const APP_VIEWS = {
  home: "home",
  new: "new",
  cvAnalyses: "cv-analyses",
  jobAnalyses: "job-analyses",
  cvs: "cvs",
  templates: "templates",
  editor: "editor",
  questions: "questions",
  journal: "journal",
  objectives: "objectives",
  receivedFeedback: "received-feedback",
  publicCVMessages: "public-cv-messages",
  reviews: "reviews",
  activityContext: "activity-context",
  feedbackNotes: "feedback-notes",
  settings: "settings",
  admin: "admin",
} as const;

export type AppView = (typeof APP_VIEWS)[keyof typeof APP_VIEWS];
