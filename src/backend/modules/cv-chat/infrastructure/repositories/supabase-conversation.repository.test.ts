import { describe, expect, it } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/backend/modules/test-helpers/setup";
import { createTestCV } from "@/backend/modules/test-helpers/cv-fixtures";
import { UserId } from "@/backend/modules/shared";
import { SupabaseCVChatConversationRepository } from "./supabase-conversation.repository";
import { CVChatConversationId } from "../../domain/value-objects/cv-chat-conversation-id.value-object";
import { CVDocumentReference } from "../../domain/value-objects/cv-document-reference.value-object";

const supabase = getSupabaseClient();
const repo = new SupabaseCVChatConversationRepository();
repo.bindRequest(supabase);

async function createCV(userId: string) {
  return createTestCV(supabase, { id: crypto.randomUUID(), user_id: userId, name: testLabel("cv"), filename: "cv.pdf", file_size: 100, pdf_storage_path: null, text_python: "CV text", text_pdfjs: null, text_node: null, extract_error_python: null, extract_error_pdfjs: null, extract_error_node: null });
}

describe("SupabaseCVChatConversationRepository", () => {
  it("creates, finds, searches, renames, and deletes conversations", async () => {
    const user = await createTestUser("cv-chat-conv");
    const cv = await createCV(user.id);
    const conversation = await repo.create({
      user_id: user.id,
      cv_id: cv.id,
      title: "Chat inicial",
    });

    expect(conversation.toPrimitives()).toMatchObject({
      userId: user.id,
      cvDocumentReference: { id: cv.id },
      title: "Chat inicial",
    });

    const found = await repo.findById(
      CVChatConversationId.fromPrimitives(conversation.id),
      UserId.fromPrimitives(user.id),
    );
    expect(found?.id).toBe(conversation.id);

    const listed = await repo.search({
      userId: UserId.fromPrimitives(user.id),
      cvDocumentReference: CVDocumentReference.fromPrimitives({
        id: cv.id,
      }),
    });
    expect(listed.map((item) => item.id)).toContain(conversation.id);

    found?.rename(
      await import("../../domain/value-objects/cv-chat-title.value-object").then(
        (mod) => mod.CVChatTitle.fromPrimitives("Renombrada"),
      ),
    );
    const updated = await repo.save(found!);
    expect(updated.toPrimitives().title).toBe("Renombrada");

    await repo.delete(
      CVChatConversationId.fromPrimitives(conversation.id),
      UserId.fromPrimitives(user.id),
    );
    await expect(
      repo.findById(
        CVChatConversationId.fromPrimitives(conversation.id),
        UserId.fromPrimitives(user.id),
      ),
    ).resolves.toBeNull();
  });
});
