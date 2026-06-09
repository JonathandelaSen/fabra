import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ProcessingEventResponse } from "@/app/api/admin/processing-events/responses";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { ObservabilityEventItem } from "./observability-event-item";

const NO_SOURCE_LABEL = getMessages("en").admin.noSource;

function createEvent(
  overrides: Partial<ProcessingEventResponse> = {},
): ProcessingEventResponse {
  return {
    id: "evt-1",
    userId: "user-1",
    cvId: null,
    analysisId: null,
    requestId: "req-123",
    stage: "cv-extraction",
    status: "success",
    source: "upload",
    durationMs: 120,
    fileSize: 2048,
    textLength: 500,
    errorCode: null,
    errorMessage: null,
    metadata: {},
    createdAt: "2026-06-09T10:30:00.000Z",
    ...overrides,
  };
}

describe("ObservabilityEventItem", () => {
  it("renders the stage, source and request id", () => {
    renderWithProviders(
      <ObservabilityEventItem
        event={createEvent()}
        isSelected={false}
        onClick={vi.fn()}
        dateLocale="en-US"
      />,
    );

    expect(screen.getByText("cv-extraction")).toBeInTheDocument();
    expect(screen.getByText(/upload · req-123/)).toBeInTheDocument();
  });

  it("falls back to the localized no-source label when source is missing", () => {
    renderWithProviders(
      <ObservabilityEventItem
        event={createEvent({ source: null })}
        isSelected={false}
        onClick={vi.fn()}
        dateLocale="en-US"
      />,
    );

    expect(
      screen.getByText(`${NO_SOURCE_LABEL} · req-123`),
    ).toBeInTheDocument();
  });

  it("shows the error code only when present", () => {
    const { rerender } = renderWithProviders(
      <ObservabilityEventItem
        event={createEvent({ errorCode: null })}
        isSelected={false}
        onClick={vi.fn()}
        dateLocale="en-US"
      />,
    );
    expect(screen.queryByText("EXTRACTION_FAILED")).not.toBeInTheDocument();

    rerender(
      <ObservabilityEventItem
        event={createEvent({ errorCode: "EXTRACTION_FAILED" })}
        isSelected={false}
        onClick={vi.fn()}
        dateLocale="en-US"
      />,
    );
    expect(screen.getByText("EXTRACTION_FAILED")).toBeInTheDocument();
  });

  it("applies the selected styling when selected", () => {
    renderWithProviders(
      <ObservabilityEventItem
        event={createEvent()}
        isSelected
        onClick={vi.fn()}
        dateLocale="en-US"
      />,
    );

    expect(screen.getByRole("button")).toHaveClass("border-indigo-500/40");
  });

  it("invokes onClick when the item is pressed", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <ObservabilityEventItem
        event={createEvent()}
        isSelected={false}
        onClick={onClick}
        dateLocale="en-US"
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
