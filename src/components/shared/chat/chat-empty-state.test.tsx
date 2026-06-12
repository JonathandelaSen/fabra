import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { ChatEmptyState } from "./chat-empty-state";

const messages = getMessages("en");
const START_TITLE = messages.analysisDetail.chat.startTitle;
const START_DESCRIPTION = messages.analysisDetail.chat.startDescription;
const NEW_CONVERSATION = messages.analysisDetail.chat.newConversation;

describe("ChatEmptyState", () => {
  it("renders correctly with localized text", () => {
    const handleNew = vi.fn();
    renderWithProviders(<ChatEmptyState onNew={handleNew} />);

    expect(screen.getByText(START_TITLE)).toBeInTheDocument();
    expect(screen.getByText(START_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: NEW_CONVERSATION })).toBeInTheDocument();
  });

  it("calls onNew when click action is triggered", async () => {
    const handleNew = vi.fn();
    const { user } = renderWithProviders(<ChatEmptyState onNew={handleNew} />);

    const button = screen.getByRole("button", { name: NEW_CONVERSATION });
    await user.click(button);

    expect(handleNew).toHaveBeenCalledTimes(1);
  });
});
