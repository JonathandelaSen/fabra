import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import ExtractionParserTabs from "./extraction-parser-tabs";

const messages = getMessages("en");
const PYTHON_LABEL = messages.analysisFlow.extraction.parserLabels.python;
const PYTHON_BADGE = messages.analysisFlow.extraction.parserBadges.python;
const ERROR_TEXT = messages.analysisFlow.extraction.error;
const NO_RESULT_TEXT = messages.analysisFlow.extraction.noResult;

const testParsers = [
  {
    key: "python" as const,
    labelKey: "parserLabels.python",
    color: "bg-emerald-500",
    badgeKey: "parserBadges.python",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
];

describe("ExtractionParserTabs", () => {
  it("renders python tab with content correctly", () => {
    const handleTabChange = vi.fn();
    const getTextForTab = vi.fn().mockReturnValue("Some Extracted Text");
    const getErrorForTab = vi.fn().mockReturnValue(null);

    renderWithProviders(
      <ExtractionParserTabs
        parsers={testParsers}
        activeTab="python"
        onTabChange={handleTabChange}
        getTextForTab={getTextForTab}
        getErrorForTab={getErrorForTab}
      />
    );

    expect(screen.getByText(PYTHON_LABEL)).toBeInTheDocument();
    expect(screen.getByText(PYTHON_BADGE)).toBeInTheDocument();
    expect(screen.getByText("19 chars")).toBeInTheDocument();
  });

  it("renders python tab with error correctly", () => {
    const handleTabChange = vi.fn();
    const getTextForTab = vi.fn().mockReturnValue(null);
    const getErrorForTab = vi.fn().mockReturnValue("Some Error");

    renderWithProviders(
      <ExtractionParserTabs
        parsers={testParsers}
        activeTab="python"
        onTabChange={handleTabChange}
        getTextForTab={getTextForTab}
        getErrorForTab={getErrorForTab}
      />
    );

    expect(screen.getByText(ERROR_TEXT)).toBeInTheDocument();
  });

  it("renders python tab with no result correctly", () => {
    const handleTabChange = vi.fn();
    const getTextForTab = vi.fn().mockReturnValue(null);
    const getErrorForTab = vi.fn().mockReturnValue(null);

    renderWithProviders(
      <ExtractionParserTabs
        parsers={testParsers}
        activeTab="python"
        onTabChange={handleTabChange}
        getTextForTab={getTextForTab}
        getErrorForTab={getErrorForTab}
      />
    );

    expect(screen.getByText(NO_RESULT_TEXT)).toBeInTheDocument();
  });

  it("calls onTabChange when tab is clicked", async () => {
    const handleTabChange = vi.fn();
    const getTextForTab = vi.fn().mockReturnValue("Some text");
    const getErrorForTab = vi.fn().mockReturnValue(null);

    const { user } = renderWithProviders(
      <ExtractionParserTabs
        parsers={testParsers}
        activeTab="pdfjs" // Make activeTab different so python is clickable
        onTabChange={handleTabChange}
        getTextForTab={getTextForTab}
        getErrorForTab={getErrorForTab}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleTabChange).toHaveBeenCalledWith("python");
  });
});
