import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CVInlineMarkdown } from "./cv-inline-markdown";

describe("CVInlineMarkdown", () => {
  it("renders plain text without formatting elements", () => {
    render(<p><CVInlineMarkdown text="Plain text" /></p>);

    expect(screen.getByText("Plain text")).toBeInTheDocument();
    expect(document.querySelector("strong")).toBeNull();
    expect(document.querySelector("em")).toBeNull();
  });

  it("renders supported inline formatting", () => {
    render(<p><CVInlineMarkdown text="Led **AI** and *product* with ***focus***." /></p>);

    expect(screen.getByText("AI").tagName).toBe("STRONG");
    expect(screen.getByText("product").tagName).toBe("EM");
    expect(screen.getByText("focus").tagName).toBe("EM");
    expect(screen.getByText("focus").parentElement?.tagName).toBe("STRONG");
  });

  it("renders explicit links with external-link attributes", () => {
    render(<p><CVInlineMarkdown text="See [Fabra](https://fabra.app)." /></p>);

    const link = screen.getByRole("link", { name: "Fabra" });
    expect(link).toHaveAttribute("href", "https://fabra.app");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders incomplete markdown, HTML, unsafe links, and ambiguous nested markers as literal text", () => {
    render(
      <p>
        <CVInlineMarkdown text="Broken **bold, <strong>HTML</strong>, [bad](javascript:alert(1)), and ***AI **nested** text***." />
      </p>
    );

    expect(screen.getByText(/Broken \*\*bold/)).toBeInTheDocument();
    expect(screen.getByText(/<strong>HTML<\/strong>/)).toBeInTheDocument();
    expect(screen.getByText(/\[bad\]\(javascript:alert\(1\)\)/)).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*AI \*\*nested\*\* text\*\*\*/)).toBeInTheDocument();
    expect(document.querySelector("strong")).toBeNull();
    expect(document.querySelector("a")).toBeNull();
  });
});
