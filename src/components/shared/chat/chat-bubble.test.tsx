import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatBubble } from "./chat-bubble";
import type { ChatMessage } from "./chat-types";

function createMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    role: "assistant",
    content: "Hello there",
    created_at: "2026-06-09T10:30:00.000Z",
    ...overrides,
  };
}

const formatTime = (date: string) => `formatted:${date}`;

describe("ChatBubble", () => {
  it("renders the message content and the formatted timestamp", () => {
    const message = createMessage({ content: "Plain message" });
    render(<ChatBubble message={message} formatTime={formatTime} />);

    expect(screen.getByText("Plain message")).toBeInTheDocument();
    expect(
      screen.getByText(`formatted:${message.created_at}`),
    ).toBeInTheDocument();
  });

  it("passes the raw created_at value to formatTime", () => {
    const format = vi.fn(() => "10:30 AM");
    const message = createMessage();
    render(<ChatBubble message={message} formatTime={format} />);

    expect(format).toHaveBeenCalledWith(message.created_at);
    expect(screen.getByText("10:30 AM")).toBeInTheDocument();
  });

  it("renders assistant content as markdown", () => {
    const message = createMessage({
      role: "assistant",
      content: "**bold** and `code`",
    });
    render(<ChatBubble message={message} formatTime={formatTime} />);

    const bold = screen.getByText("bold");
    expect(bold.tagName).toBe("STRONG");

    const code = screen.getByText("code");
    expect(code.tagName).toBe("CODE");
  });

  it("renders user content as plain text without markdown parsing", () => {
    const message = createMessage({
      role: "user",
      content: "**not bold** literal",
    });
    render(<ChatBubble message={message} formatTime={formatTime} />);

    expect(screen.getByText("**not bold** literal")).toBeInTheDocument();
    expect(screen.queryByText("not bold")).not.toBeInTheDocument();
  });

  it("preserves whitespace and newlines in user messages", () => {
    const message = createMessage({
      role: "user",
      content: "line one\nline two",
    });
    render(<ChatBubble message={message} formatTime={formatTime} />);

    const node = screen.getByText(/line one/);
    expect(node).toHaveClass("whitespace-pre-wrap");
    expect(node.textContent).toBe("line one\nline two");
  });
});
