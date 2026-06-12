import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisMarkdown } from "./analysis-markdown";

describe("AnalysisMarkdown", () => {
  it("renders markdown emphasis and lists", () => {
    render(<AnalysisMarkdown content={"**Focus**\n\n- First\n- Second"} />);

    expect(screen.getByText("Focus").tagName).toBe("STRONG");
    expect(screen.getByText("First").closest("li")).toBeInTheDocument();
    expect(screen.getByText("Second").closest("li")).toBeInTheDocument();
  });

  it("renders plain text without changing its content", () => {
    render(<AnalysisMarkdown content="A clear plain-text assessment." />);

    expect(screen.getByText("A clear plain-text assessment.").tagName).toBe("P");
  });

  it("does not render raw html", () => {
    const { container } = render(
      <AnalysisMarkdown content={"<script></script>Safe"} />,
    );

    expect(container.querySelector("script")).not.toBeInTheDocument();
  });
});
