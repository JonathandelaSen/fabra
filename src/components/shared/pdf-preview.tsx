"use client";

import { useEffect, useRef, useState } from "react";
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
  fitMobile?: boolean;
  mini?: boolean;
}

export function PDFPreview({
  url,
  expanded = false,
  fitMobile = false,
  mini = false,
}: PDFPreviewProps) {
  const [scale, setScale] = useState(0.85);
  const [urls, setUrls] = useState<string[]>([url]);
  const [numPagesMap, setNumPagesMap] = useState<Record<string, number>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUrls((prev) => {
        if (prev[prev.length - 1] === url) return prev;
        return [...prev.slice(-1), url];
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    if (!fitMobile || !containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [fitMobile]);

  function handleLoadSuccess(loadedUrl: string, numPages: number) {
    setNumPagesMap((prev) => ({ ...prev, [loadedUrl]: numPages }));
  }

  const mobilePageWidth =
    fitMobile && containerWidth > 0 && containerWidth < 768
      ? Math.max(240, containerWidth - 32)
      : undefined;
  const pageScale = mobilePageWidth ? scale / 0.85 : scale;

  if (mini) {
    return (
      <div className="w-full flex items-center justify-center">
        <Document
          file={url}
          externalLinkTarget="_blank"
          loading={
            <div className="flex items-center justify-center p-8 text-text-muted w-full aspect-[1/1.414]">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          }
          className="w-full flex flex-col items-center"
        >
          <div className="relative w-full overflow-hidden bg-pdf-canvas [&_.react-pdf__Page]:!w-full [&_.react-pdf__Page]:!h-auto [&_canvas]:!w-full [&_canvas]:!h-auto">
            <Page
              pageNumber={1}
              width={400}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={
                <div className="flex items-center justify-center text-text-muted bg-pdf-canvas w-full aspect-[1/1.414]">
                  <Loader2 className="h-4 w-4 animate-spin text-text-faint" />
                </div>
              }
            />
          </div>
        </Document>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full flex flex-col", expanded ? "" : "h-full")}
    >
      {!expanded && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-full border border-line-default bg-floating-toolbar p-1.5 shadow-xl backdrop-blur-md sm:bottom-6 sm:right-6">
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
        <div className={cn("grid min-h-full items-start p-4 sm:p-8", expanded ? "w-full justify-items-stretch justify-stretch" : "justify-center")}>
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
                        "relative overflow-hidden border border-line bg-panel shadow-[var(--ui-pdf-page-shadow)] max-w-full",
                        expanded 
                          ? "w-full [&_.react-pdf__Page]:!w-full [&_.react-pdf__Page]:!h-auto [&_.react-pdf__Page]:!min-w-0 [&_canvas]:!w-full [&_canvas]:!h-auto"
                          : ""
                      )}
                    >
                      <Page
                        pageNumber={index + 1}
                        width={expanded ? undefined : mobilePageWidth}
                        scale={expanded ? 2.0 : pageScale}
                        renderAnnotationLayer={true}
                        renderTextLayer={false}
                        loading={
                          urls.length === 1 ? (
                            <div
                              className="flex max-w-full items-center justify-center p-12 text-text-muted"
                              style={{
                                width: (mobilePageWidth ?? 595) * (expanded ? 2.0 : pageScale),
                                height: (mobilePageWidth ? mobilePageWidth * 1.415 : 842) * (expanded ? 2.0 : pageScale),
                              }}
                            >
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
