import type { CVSummaryForActivityContextSuggestions } from "../value-objects/cv-summary-for-activity-context-suggestions.value-object";

export interface CVDataRepository {
  listCVs(userId: string): Promise<CVSummaryForActivityContextSuggestions[]>;
}
