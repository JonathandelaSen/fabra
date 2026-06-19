import type { ContentMetricsWindow } from "../value-objects/content-metrics-window.value-object";
import type { CVContentMetrics } from "../value-objects/cv-content-metrics.value-object";
import type { AnalysisContentMetrics } from "../value-objects/analysis-content-metrics.value-object";
import type { OpportunitiesContentMetrics } from "../value-objects/opportunities-content-metrics.value-object";
import type { FeedbackContentMetrics } from "../value-objects/feedback-content-metrics.value-object";
import type { WorkspaceContentMetrics } from "../value-objects/workspace-content-metrics.value-object";

export interface ContentMetricsRepository {
  countCVContent(window: ContentMetricsWindow): Promise<CVContentMetrics>;
  countAnalysisContent(window: ContentMetricsWindow): Promise<AnalysisContentMetrics>;
  countOpportunitiesContent(window: ContentMetricsWindow): Promise<OpportunitiesContentMetrics>;
  countFeedbackContent(window: ContentMetricsWindow): Promise<FeedbackContentMetrics>;
  countWorkspaceContent(window: ContentMetricsWindow): Promise<WorkspaceContentMetrics>;
}
