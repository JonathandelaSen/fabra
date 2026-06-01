const COLORS = {
  key: "text-violet-400",
  string: "text-emerald-400",
  number: "text-amber-300",
  boolean: "text-sky-400",
  null: "text-zinc-500 italic",
  brace: "text-zinc-500",
  comma: "text-zinc-600",
};

function tokenize(json: string): { type: keyof typeof COLORS; value: string }[] {
  const tokens: { type: keyof typeof COLORS; value: string }[] = [];
  const regex =
    /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\]])|([,:])/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(json)) !== null) {
    if (match[1] !== undefined) {
      tokens.push({ type: "key", value: match[1] });
      tokens.push({ type: "comma", value: ":" });
    } else if (match[2] !== undefined) {
      tokens.push({ type: "string", value: match[2] });
    } else if (match[3] !== undefined) {
      tokens.push({ type: "number", value: match[3] });
    } else if (match[4] !== undefined) {
      tokens.push({ type: "boolean", value: match[4] });
    } else if (match[5] !== undefined) {
      tokens.push({ type: "null", value: match[5] });
    } else if (match[6] !== undefined) {
      tokens.push({ type: "brace", value: match[6] });
    } else if (match[7] !== undefined) {
      tokens.push({ type: "comma", value: match[7] });
    }
  }

  return tokens;
}

interface SyntaxHighlightedJsonProps {
  value: unknown;
}

export function SyntaxHighlightedJson({ value }: SyntaxHighlightedJsonProps) {
  const json = JSON.stringify(value, null, 2);
  const tokens = tokenize(json);

  const lines = json.split("\n");
  let tokenIdx = 0;

  return (
    <pre className="text-xs leading-relaxed font-mono">
      <code>
        {lines.map((line, lineNum) => {
          const lineTokens: React.ReactNode[] = [];
          let pos = 0;

          while (tokenIdx < tokens.length) {
            const token = tokens[tokenIdx];
            const idx = line.indexOf(token.value, pos);
            if (idx === -1) break;

            if (idx > pos) {
              lineTokens.push(line.slice(pos, idx));
            }

            lineTokens.push(
              <span key={`${lineNum}-${tokenIdx}`} className={COLORS[token.type]}>
                {token.value}
              </span>
            );

            pos = idx + token.value.length;
            tokenIdx++;
          }

          if (pos < line.length) {
            lineTokens.push(line.slice(pos));
          }

          return (
            <div key={lineNum} className="flex">
              <span className="mr-4 inline-block w-8 select-none text-right text-zinc-700">
                {lineNum + 1}
              </span>
              <span>{lineTokens}</span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}
