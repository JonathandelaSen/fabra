export type CVInlineMarkdownToken =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "emphasis"; text: string }
  | { type: "strongEmphasis"; text: string }
  | { type: "link"; text: string; href: string };

const tokenPattern =
  /(\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)|\*\*\*([^*\n]+)\*\*\*|\*\*(?!\*)([^*\n]+)\*\*(?!\*)|\*(?!\*)([^*\n]+)\*(?!\*))/g;

function isBoundary(value: string, index: number) {
  if (index <= 0 || index >= value.length) return true;
  return /\s|[([{"'“‘]/.test(value[index - 1] ?? "");
}

function pushText(tokens: CVInlineMarkdownToken[], text: string) {
  if (!text) return;
  const previous = tokens[tokens.length - 1];
  if (previous?.type === "text") {
    previous.text += text;
    return;
  }
  tokens.push({ type: "text", text });
}

export function parseCVInlineMarkdown(value: string): CVInlineMarkdownToken[] {
  if (!value) return [];

  const tokens: CVInlineMarkdownToken[] = [];
  let cursor = 0;

  for (const match of value.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    const raw = match[0] ?? "";

    if (!isBoundary(value, index)) continue;

    pushText(tokens, value.slice(cursor, index));

    if (match[2] && match[3]) {
      tokens.push({ type: "link", text: match[2], href: match[3] });
    } else if (match[4]) {
      tokens.push({ type: "strongEmphasis", text: match[4] });
    } else if (match[5]) {
      tokens.push({ type: "strong", text: match[5] });
    } else if (match[6]) {
      tokens.push({ type: "emphasis", text: match[6] });
    } else {
      pushText(tokens, raw);
    }

    cursor = index + raw.length;
  }

  pushText(tokens, value.slice(cursor));
  return tokens;
}
