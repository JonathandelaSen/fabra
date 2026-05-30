import ExtractionParserTabs from "@/components/shared/extraction/extraction-parser-tabs";
import { ExtractionTextPanel as CvExtractionTextPanel } from "@/components/shared/extraction/extraction-text-panel";
import ExtractionPdfPreview from "./extraction-pdf-preview";
import { PARSERS, type ParserTab } from "./extraction-parser-config";

interface ExtractionWorkspaceProps {
  activeTab: ParserTab;
  copied: boolean;
  currentError: string | null;
  currentText: string | null;
  fullscreen: boolean;
  getErrorForTab: (tab: ParserTab) => string | null;
  getTextForTab: (tab: ParserTab) => string | null;
  onClosePdfPreview: () => void;
  onCopy: () => void;
  onTabChange: (tab: ParserTab) => void;
  onToggleFullscreen: () => void;
  pdfUrl: string;
  showPdfPreview: boolean;
}

export default function ExtractionWorkspace({
  activeTab,
  copied,
  currentError,
  currentText,
  fullscreen,
  getErrorForTab,
  getTextForTab,
  onClosePdfPreview,
  onCopy,
  onTabChange,
  onToggleFullscreen,
  pdfUrl,
  showPdfPreview,
}: ExtractionWorkspaceProps) {
  const activeParser = PARSERS.find((parser) => parser.key === activeTab);

  return (
    <>
      <ExtractionParserTabs
        parsers={PARSERS}
        activeTab={activeTab}
        onTabChange={onTabChange}
        getTextForTab={getTextForTab}
        getErrorForTab={getErrorForTab}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-0">
        <CvExtractionTextPanel
          activeTab={activeTab}
          currentText={currentText}
          currentError={currentError}
          copied={copied}
          fullscreen={fullscreen}
          parserColor={activeParser?.color}
          parserDescriptionKey={activeParser?.descriptionKey ?? "python"}
          onCopy={onCopy}
          onToggleFullscreen={onToggleFullscreen}
        />

        <ExtractionPdfPreview
          showPdfPreview={showPdfPreview}
          fullscreen={fullscreen}
          pdfUrl={pdfUrl}
          onClose={onClosePdfPreview}
        />
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/80 z-40"
          onClick={onToggleFullscreen}
        />
      )}
    </>
  );
}
