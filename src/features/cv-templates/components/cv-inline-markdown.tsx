import { parseCVInlineMarkdown } from "@/lib/cv-inline-markdown";

interface CVInlineMarkdownProps {
  text: string;
}

export function CVInlineMarkdown({ text }: CVInlineMarkdownProps) {
  return (
    <>
      {parseCVInlineMarkdown(text).map((token, index) => {
        if (token.type === "strong") return <strong key={index}>{token.text}</strong>;
        if (token.type === "emphasis") return <em key={index}>{token.text}</em>;
        if (token.type === "strongEmphasis") {
          return (
            <strong key={index}>
              <em>{token.text}</em>
            </strong>
          );
        }
        if (token.type === "link") {
          return (
            <a key={index} href={token.href} target="_blank" rel="noopener noreferrer">
              {token.text}
            </a>
          );
        }
        return token.text;
      })}
    </>
  );
}
