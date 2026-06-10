import { BoundSupabaseRepository } from "@/modules/shared";
import { normalizeStandardCVProfile } from "@/lib/cv-profile";
import type { CVDataRepository } from "../../domain/repositories/cv-data.repository";
import { CVSummaryForSuggestions } from "../../domain/value-objects/cv-summary-for-suggestions.value-object";

export class SupabaseCVDataRepository
  extends BoundSupabaseRepository
  implements CVDataRepository
{
  async listCVs(userId: string): Promise<CVSummaryForSuggestions[]> {
    const { data, error } = await this.client
      .from("cvs")
      .select("name, filename, type, profile, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => CVSummaryForSuggestions.fromPrimitives({
      name: row.name as string,
      filename: row.filename as string | null,
      type: row.type as string,
      profile: row.profile ? normalizeStandardCVProfile(row.profile) : null,
    }));
  }
}
