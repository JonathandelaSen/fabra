"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Document, Page, pdfjs } from "react-pdf";
import { ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import {
  ActionIconButton,
  ACTION_ICON_BUTTON_SIZES,
} from "@/components/shared/action-buttons";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PDFPreviewProps {
  url: string;
  expanded?: boolean;
}

export function PDFPreview({ url, expanded = false }: PDFPreviewProps) {
  const [scale, setScale] = useState(0.85);
  const [urls, setUrls] = useState<string[]>([url]);
  const [numPagesMap, setNumPagesMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setUrls((prev) => {
        if (prev[prev.length - 1] === url) return prev;
        return [...prev.slice(-1), url];
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [url]);

  function handleLoadSuccess(loadedUrl: string, numPages: number) {
    setNumPagesMap((prev) => ({ ...prev, [loadedUrl]: numPages }));
  }

  return (
    <div className={cn("relative w-full flex flex-col", expanded ? "" : "h-full")}>
      {!expanded && (
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 rounded-full border border-line-default bg-floating-toolbar p-1.5 shadow-xl backdrop-blur-md">
          <ActionIconButton
            icon={ZoomOut}
            buttonSize={ACTION_ICON_BUTTON_SIZES.MD}
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
          />
          <span className="w-12 text-center text-xs font-medium text-text-soft">
            {Math.round(scale * 100)}%
          </span>
          <ActionIconButton
            icon={ZoomIn}
            buttonSize={ACTION_ICON_BUTTON_SIZES.MD}
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
          />
        </div>
      )}

      <div className={cn("bg-pdf-canvas pb-20", expanded ? "" : "flex-1 overflow-auto scrollbar-thin")}>
        <div className={cn("grid min-h-full items-start p-8", expanded ? "w-full justify-items-stretch justify-stretch" : "justify-center")}>
          {urls.map((u, i) => {
            const isLatest = i === urls.length - 1;
            const isOld = !isLatest;
            const pagesToRender = numPagesMap[u] || 1;

            return (
              <div 
                key={u} 
                className={cn("col-start-1 row-start-1 transition-opacity duration-300", expanded ? "w-full" : "")}
                style={{ 
                  zIndex: isLatest ? 10 : 1,
                  opacity: isOld ? 0.4 : 1,
                  filter: isOld ? "grayscale(100%) blur(2px)" : "none",
                }}
              >
                <Document
                  file={u}
                  onLoadSuccess={({ numPages }) => handleLoadSuccess(u, numPages)}
                  externalLinkTarget="_blank"
                  loading={
                    urls.length === 1 ? (
                      <div className="flex items-center justify-center p-12 text-text-muted">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : null
                  }
                  className={cn("flex flex-col gap-4", expanded ? "w-full items-stretch" : "items-center")}
                >
                  {Array.from(new Array(pagesToRender), (el, index) => (
                    <div 
                      key={`page_${index + 1}`} 
                      className={cn(
                        "relative overflow-hidden border border-line bg-white shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-full",
                        expanded 
                          ? "w-full [&_.react-pdf__Page]:!w-full [&_.react-pdf__Page]:!h-auto [&_.react-pdf__Page]:!min-w-0 [&_canvas]:!w-full [&_canvas]:!h-auto"
                          : ""
                      )}
                    >
                      <Page
                        pageNumber={index + 1}
                        scale={expanded ? 2.0 : scale}
                        renderAnnotationLayer={true}
                        renderTextLayer={false}
                        loading={
                          urls.length === 1 ? (
                            <div className="flex items-center justify-center p-12 text-text-muted max-w-full" style={{ width: 595 * (expanded ? 2.0 : scale), height: 842 * (expanded ? 2.0 : scale) }}>
                              <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                          ) : null
                        }
                      />
                    </div>
                  ))}
                </Document>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
