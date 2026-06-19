import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/backend/modules/shared";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/backend/modules/test-helpers/setup";
import { createTestCV } from "@/backend/modules/test-helpers/cv-fixtures";
import { ChatMessage } from "../../domain/entities/chat-message.entity";
import { CVChatContent } from "../../domain/value-objects/cv-chat-content.value-object";
import { CVChatConversationId } from "../../domain/value-objects/cv-chat-conversation-id.value-object";
import { CVChatMessageId } from "../../domain/value-objects/cv-chat-message-id.value-object";
import { CVDocumentReference } from "../../domain/value-objects/cv-document-reference.value-object";
import { SupabaseCVChatConversationRepository } from "./supabase-conversation.repository";
import { SupabaseCVChatMessageRepository } from "./supabase-chat-message.repository";

const supabase = getSupabaseClient();
const conversationRepo = new SupabaseCVChatConversationRepository();
conversationRepo.bindRequest(supabase);
const messageRepo = new SupabaseCVChatMessageRepository();
messageRepo.bindRequest(supabase);

async function createCV(userId: string) {
  return createTestCV(supabase, { id: crypto.randomUUID(), user_id: userId, name: testLabel("cv"), filename: "cv.pdf", file_size: 100, pdf_storage_path: null, text_python: "CV text", text_pdfjs: null, text_node: null, extract_error_python: null, extract_error_pdfjs: null, extract_error_node: null });
}

describe("SupabaseCVChatMessageRepository", () => {
  it("saves, lists, finds, and deletes messages", async () => {
    const user = await createTestUser("cv-chat-msg");
    const cv = await createCV(user.id);
    const conversation = await conversationRepo.create({
      user_id: user.id,
      cv_id: cv.id,
      title: "Chat",
    });
    const message = ChatMessage.createAssistantMessage({
      id: CVChatMessageId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(user.id),
      cvDocumentReference: CVDocumentReference.fromPrimitives({
        id: cv.id,
      }),
      conversationId: CVChatConversationId.fromPrimitives(
        conversation.id,
      ),
      content: CVChatContent.fromPrimitives("Respuesta"),
      model: "gemini",
      metadata: { requestId: "req-1" },
      createdAt: Timestamp.fromPrimitives(new Date().toISOString()),
    });

    const saved = await messageRepo.save(message);
    expect(saved.toPrimitives()).toMatchObject({
      userId: user.id,
      conversationId: conversation.id,
      role: "assistant",
      content: "Respuesta",
      model: "gemini",
      metadata: { requestId: "req-1" },
    });

    const listed = await messageRepo.search({
      userId: UserId.fromPrimitives(user.id),
      conversationId: CVChatConversationId.fromPrimitives(
        conversation.id,
      ),
    });
    expect(listed.map((item) => item.id)).toContain(saved.id);

    const found = await messageRepo.findById(
      CVChatMessageId.fromPrimitives(saved.id),
      UserId.fromPrimitives(user.id),
    );
    expect(found?.toPrimitives().content).toBe("Respuesta");

    await messageRepo.delete(
      CVChatMessageId.fromPrimitives(saved.id),
      UserId.fromPrimitives(user.id),
    );
    await expect(
      messageRepo.findById(
        CVChatMessageId.fromPrimitives(saved.id),
        UserId.fromPrimitives(user.id),
      ),
    ).resolves.toBeNull();
  });
});
