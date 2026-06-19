import { renderWithProviders } from "@/frontend/testing/render";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ReviewEvidencePanel } from "./review-evidence-panel";

describe("ReviewEvidencePanel", () => {
  it("renders candidate tabs without entering an update loop", () => {
    expect(() =>
      renderWithProviders(
        createElement(ReviewEvidencePanel, {
          contextName: null,
          candidates: [],
          evidence: [],
          isSaving: false,
          onAddCandidate: vi.fn(),
          onAddCustomEvidence: vi.fn(),
          onToggleHighlight: vi.fn(),
          onRemove: vi.fn(),
          onReorder: vi.fn(),
        }),
      ),
    ).not.toThrow();
  });
});
