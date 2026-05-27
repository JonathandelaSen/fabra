"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-100">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-zinc-300">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="text-zinc-300">{children}</li>,
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-emerald-300">
                {children}
              </code>
            );
          }
          return (
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-emerald-300">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="mb-3 last:mb-0">{children}</pre>,
        h1: ({ children }) => (
          <h1 className="mb-2 text-base font-bold text-zinc-100">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 text-sm font-bold text-zinc-100">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1.5 text-sm font-semibold text-zinc-200">
            {children}
          </h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-2 border-cyan-500/30 pl-3 italic text-zinc-400 last:mb-0">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-white/10" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
