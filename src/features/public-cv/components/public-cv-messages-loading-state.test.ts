import { describe, expect, it } from "vitest";
import { shouldShowPublicCVMessagesLoader } from "./public-cv-messages-loading-state";

describe("shouldShowPublicCVMessagesLoader", () => {
  it("keeps the skeleton visible while the initial CV is being resolved", () => {
    expect(shouldShowPublicCVMessagesLoader({ cvsPending: false, feedbackPending: false, cvId: null, publicCVCount: 1, desktop: true, messageId: null, messageCount: 0 })).toBe(true);
  });
  it("shows empty state after the selected CV feedback finishes loading", () => {
    expect(shouldShowPublicCVMessagesLoader({ cvsPending: false, feedbackPending: false, cvId: "cv-1", publicCVCount: 1, desktop: true, messageId: null, messageCount: 0 })).toBe(false);
  });
  it("keeps the skeleton visible while selecting the first desktop message", () => {
    expect(shouldShowPublicCVMessagesLoader({ cvsPending: false, feedbackPending: false, cvId: "cv-1", publicCVCount: 1, desktop: true, messageId: null, messageCount: 2 })).toBe(true);
  });
});
