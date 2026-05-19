import { normalizeStandardCVProfile } from "@/lib/cv-profile";
import { BoundSupabaseRepository } from "@/modules/shared";
import type {
  CVDataRepository,
  CVSummaryForActivityContextSuggestions,
} from "../../domain/repositories/cv-data.repository";

export class SupabaseCVDataRepository
  extends BoundSupabaseRepository
  implements CVDataRepository
{
  async listCVs(userId: string): Promise<CVSummaryForActivityContextSuggestions[]> {
    const { data: cvRows, error: cvError } = await this.client
      .from("cvs")
      .select("id, type, profile, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (cvError) throw cvError;

    const cvIds = (cvRows ?? []).map((row) => row.id as string);
    const structuredByCvId = new Map<string, unknown>();

    if (cvIds.length > 0) {
      const { data: structuredRows, error: structuredError } = await this.client
        .from("cv_structured_profiles")
        .select("cv_id, profile, updated_at")
        .eq("user_id", userId)
        .in("cv_id", cvIds)
        .order("updated_at", { ascending: false });

      if (structuredError) throw structuredError;

      for (const row of structuredRows ?? []) {
        const cvId = row.cv_id as string;
        if (!structuredByCvId.has(cvId)) {
          structuredByCvId.set(cvId, row.profile);
        }
      }
    }

    return (cvRows ?? []).map((row) => {
      const profile = row.profile ?? structuredByCvId.get(row.id as string) ?? null;
      return {
      type: row.type as string,
        profile: profile ? normalizeStandardCVProfile(profile) : null,
      };
    });
  }
}
