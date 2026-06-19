import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseAware } from "@/modules/shared/infrastructure/supabase-aware";
import type { CVChatContextReader } from "../../domain/repositories/cv-chat-context.repository";
import { CVChatContext } from "../../domain/value-objects/cv-chat-context.value-object";

export class CVChatContextRepository implements CVChatContextReader, SupabaseAware {
  private client!: SupabaseClient;

  bindRequest(client: SupabaseClient) {
    this.client = client;
  }

  async findByCVId(input: { cvId: string; userId: string }): Promise<CVChatContext | null> {
    const { data: cv, error } = await this.client
      .from("cvs")
      .select("*")
      .eq("id", input.cvId)
      .eq("user_id", input.userId)
      .maybeSingle();
    if (error) throw error;
    if (!cv) return null;

    return CVChatContext.fromPrimitives({
      cvId: input.cvId,
      cv,
      cvText: cv.text_python || cv.text_pdfjs || cv.text_node || null,
    });
  }
}
