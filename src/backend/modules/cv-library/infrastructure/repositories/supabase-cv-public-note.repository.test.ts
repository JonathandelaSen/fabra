import { describe, expect, it } from "vitest";
import { createTestCV } from "@/backend/modules/test-helpers/cv-fixtures";
import { createTestUser, getSupabaseClient } from "@/backend/modules/test-helpers/setup";
import { UserId } from "@/backend/modules/shared";
import { CVPublicNote } from "../../domain/entities/cv-public-note.entity";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { SupabaseCVPublicNoteRepository } from "./supabase-cv-public-note.repository";

describe("SupabaseCVPublicNoteRepository", () => {
  it("replaces and lists owner notes", async () => {
    const user = await createTestUser("cv-public-notes");
    const supabase = getSupabaseClient();
    const cv = await createTestCV(supabase, { id: crypto.randomUUID(), user_id: user.id, name: "Public notes CV", type: "template" });
    const repo = new SupabaseCVPublicNoteRepository(); repo.bindRequest(supabase);
    const now = new Date().toISOString();
    const notes = await repo.replaceForOwner({
      cvId: CVDocumentId.fromPrimitives(cv.id),
      userId: UserId.fromPrimitives(user.id),
      notes: [CVPublicNote.fromPrimitives({ id: crypto.randomUUID(), cvId: cv.id, userId: user.id, anchorType: "presentation", sectionId: null, anchorId: null, body: "Hello", createdAt: now, updatedAt: now })],
    });
    expect(notes.map((note) => note.toPrimitives().body)).toEqual(["Hello"]);
  });
});
