import type { CVSummaryForSuggestions } from "../value-objects/cv-summary-for-suggestions.value-object";

export interface CVDataRepository {
  listCVs(userId: string): Promise<CVSummaryForSuggestions[]>;
}
