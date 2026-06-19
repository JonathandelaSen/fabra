import { createRef } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { ChatMessagesArea } from "./chat-messages-area";

const messages = getMessages("en");

describe("ChatMessagesArea", () => {
  it("hides the empty chat state while the first message is sending", () => {
    renderWithProviders(
      <ChatMessagesArea
        messages={[]}
        isLoading={false}
        isSending
        activeConversationId="conversation-id"
        onNewConversation={vi.fn()}
        formatTime={(date) => date}
        scrollRef={createRef<HTMLDivElement>()}
      />,
    );

    expect(
      screen.queryByText(messages.analysisDetail.chat.firstQuestion),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(messages.analysisDetail.chat.thinking),
    ).toBeInTheDocument();
  });
});
