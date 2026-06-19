import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/testing/render";
import { ChatMarkdown } from "./chat-markdown";

describe("ChatMarkdown", () => {
  it("renders simple paragraph markdown correctly", () => {
    renderWithProviders(<ChatMarkdown content="Hello World" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("Hello World").tagName).toBe("P");
  });

  it("renders headers and blockquotes styled correctly", () => {
    renderWithProviders(
      <ChatMarkdown content={"# Heading 1\n\n## Heading 2\n\n> Simple Quote"} />
    );

    const h1 = screen.getByRole("heading", { level: 1, name: "Heading 1" });
    expect(h1).toBeInTheDocument();

    const h2 = screen.getByRole("heading", { level: 2, name: "Heading 2" });
    expect(h2).toBeInTheDocument();

    const blockquote = screen.getByText("Simple Quote");
    expect(blockquote.closest("blockquote")).toBeInTheDocument();
  });

  it("renders code block and inline code styled correctly", () => {
    renderWithProviders(
      <ChatMarkdown content={"Use `sample inline code` inline.\n\n```text\nsample block content\n```"} />
    );

    const inlineCode = screen.getByText("sample inline code");
    expect(inlineCode).toBeInTheDocument();

    const blockCode = screen.getByText("sample block content");
    expect(blockCode).toBeInTheDocument();
  });
});
