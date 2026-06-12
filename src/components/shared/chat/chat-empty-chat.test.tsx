import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { ChatEmptyChat } from "./chat-empty-chat";

const messages = getMessages("en");
const FIRST_QUESTION = messages.analysisDetail.chat.firstQuestion;
const FIRST_QUESTION_DESCRIPTION = messages.analysisDetail.chat.firstQuestionDescription;

describe("ChatEmptyChat", () => {
  it("renders correctly with localized text", () => {
    const { container } = renderWithProviders(<ChatEmptyChat />);

    expect(screen.getByText(FIRST_QUESTION)).toBeInTheDocument();
    expect(screen.getByText(FIRST_QUESTION_DESCRIPTION)).toBeInTheDocument();

    // Verify SVG icon is rendered
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
