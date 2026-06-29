import { describe, expect, it } from "vitest";
import {
  parseCreateFollowUpEntryRequest,
  parseUpdateFollowUpEntryRequest,
} from "./validation";

describe("follow-up entry validation", () => {
  it("accepts a minimal same-status update", () => {
    expect(
      parseCreateFollowUpEntryRequest({
        status: "interview",
        occurredAt: "2026-06-29T10:00:00.000Z",
        updateCurrentStatus: false,
      }),
    ).toEqual({
      ok: true,
      value: {
        status: "interview",
        title: null,
        notes: null,
        nextAction: null,
        nextActionAt: null,
        occurredAt: "2026-06-29T10:00:00.000Z",
        updateCurrentStatus: false,
      },
    });
  });

  it("rejects a next-action date without text", () => {
    const result = parseCreateFollowUpEntryRequest({
      status: "interesting",
      occurredAt: "2026-06-29T10:00:00.000Z",
      updateCurrentStatus: false,
      nextActionAt: "2026-07-01T10:00:00.000Z",
    });

    expect(result).toMatchObject({
      ok: false,
      error: { status: 400 },
    });
  });

  it("does not allow editing an entry to change the current status", () => {
    const result = parseUpdateFollowUpEntryRequest({
      status: "applied",
      occurredAt: "2026-06-29T10:00:00.000Z",
      updateCurrentStatus: true,
    });

    expect(result).toMatchObject({ ok: false, error: { status: 400 } });
  });
});
