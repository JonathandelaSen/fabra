"use client";

import { TabsContent } from "@/components/ui/tabs";
import TabSummary from "./tabs/tab-summary";
import { CVLibraryChat } from "@/features/cv-library";

interface AnalysisTabsContentProps {
  improvements: string[];
  keywords: string[];
  cvId: string | null;
  additionalContext?: string;
}

export function AnalysisTabsContent({
  improvements,
  keywords,
  cvId,
  additionalContext,
}: AnalysisTabsContentProps) {
  return (
    <div className="min-h-0">
      <TabsContent value="resumen">
        <TabSummary
          improvements={improvements}
          keywords={keywords}
          additionalContext={additionalContext}
        />
      </TabsContent>

      {cvId && (
        <TabsContent value="chat">
          <CVLibraryChat cvId={cvId} />
        </TabsContent>
      )}
    </div>
  );
}
