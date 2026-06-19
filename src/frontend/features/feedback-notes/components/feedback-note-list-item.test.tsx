import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import type { FeedbackListItem } from "../api/feedback-notes-api";
import { FeedbackNoteListItem } from "./feedback-note-list-item";

const CLOSED_LABEL = getMessages("en").feedbackNotes.status.closed;

function createFeedback(
  overrides: Partial<FeedbackListItem> = {},
): FeedbackListItem {
  return {
    id: "fb-1",
    userId: "user-1",
    activityContextId: "ctx-1",
    activityContextName: "Frontend role",
    personName: "Jane Doe",
    status: "active",
    finalFeedback: null,
    closedAt: null,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-09T10:00:00.000Z",
    entryCount: 2,
    ...overrides,
  };
}

describe("FeedbackNoteListItem", () => {
  it("renders the person name and activity context", () => {
    renderWithProviders(
      <FeedbackNoteListItem
        feedback={createFeedback()}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Frontend role")).toBeInTheDocument();
  });

  it("does not show the closed badge for active feedback", () => {
    renderWithProviders(
      <FeedbackNoteListItem
        feedback={createFeedback({ status: "active" })}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByText(CLOSED_LABEL)).not.toBeInTheDocument();
  });

  it("shows the closed badge for closed feedback", () => {
    renderWithProviders(
      <FeedbackNoteListItem
        feedback={createFeedback({ status: "closed" })}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText(CLOSED_LABEL)).toBeInTheDocument();
  });

  it("calls onSelect when the item is clicked", async () => {
    const onSelect = vi.fn();
    const { user } = renderWithProviders(
      <FeedbackNoteListItem
        feedback={createFeedback()}
        isSelected={false}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByText("Jane Doe"));

    expect(onSelect).toHaveBeenCalledOnce();
  });
});
