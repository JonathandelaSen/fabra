"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/frontend/utils/utils";

interface AnalysisMarkdownProps {
  content: string;
  className?: string;
}

export function AnalysisMarkdown({
  content,
  className,
}: AnalysisMarkdownProps) {
  return (
    <div className={cn("text-text-soft", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text-main">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-text-soft">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-2 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 ml-5 list-decimal space-y-1 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5 leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h1 className="mb-2 text-lg font-semibold text-text-main">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 text-base font-semibold text-text-main">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 font-semibold text-text-main">{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-line-strong pl-3 text-text-muted last:mb-0">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-field-code/50 px-1 py-0.5 text-[0.9em] text-success-text">
              {children}
            </code>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-info-text underline decoration-info-text underline-offset-2 hover:text-info-text"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
