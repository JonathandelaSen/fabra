"use client";

import { useEffect, useState } from "react";

export function useImmediateAnalysisSelection(routeAnalysisId: string | null) {
  const [pendingAnalysisId, setPendingAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    if (pendingAnalysisId === routeAnalysisId) {
      setPendingAnalysisId(null);
    }
  }, [pendingAnalysisId, routeAnalysisId]);

  return {
    selectedAnalysisId: pendingAnalysisId ?? routeAnalysisId,
    selectImmediately: setPendingAnalysisId,
  };
}
