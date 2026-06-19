import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/testing/render";
import AnalysisScoreCircle from "./analysis-score-circle";

describe("AnalysisScoreCircle", () => {
  it("renders the score and total", () => {
    renderWithProviders(
      <AnalysisScoreCircle
        score={85}
        textClassName="text-green-500"
        strokeClassName="stroke-green-500"
      />
    );

    // Score text
    const scoreElement = screen.getByText("85");
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveClass("text-green-500", "text-4xl", "font-black");

    // Total text
    expect(screen.getByText("/ 100")).toBeInTheDocument();
  });

  it("applies the custom strokeClassName to the motion.circle", () => {
    const { container } = renderWithProviders(
      <AnalysisScoreCircle
        score={42}
        textClassName="text-red-500"
        strokeClassName="stroke-red-500"
      />
    );

    // Framer motion uses standard SVG elements, so we can query for the circle
    // There are two circles: one background, one animated. The animated one has the custom class
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);

    const animatedCircle = circles[1];
    expect(animatedCircle).toHaveClass("stroke-red-500");
  });
});
