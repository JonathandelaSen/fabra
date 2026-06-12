import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
import { messages } from "../src/i18n/messages";
import { loginViaUI } from "./helpers/auth";
import { uniqueLabel } from "./helpers/env";
import { adminClient, createConfirmedUser } from "./helpers/supabase";

const tEditor = messages.en.cvEditor;

const sampleProfile = {
  basics: {
    name: "John Public Doe",
    headline: "Distinguished Public Speaker",
    email: "john.public@example.com",
    phone: "+34 600 000 000",
    location: "Barcelona, Spain",
    links: [{ label: "GitHub", url: "https://github.com" }],
  },
  summary: "Experienced speaker who loves sharing knowledge.",
  experience: [
    {
      id: "exp-1",
      company: "Public Talks Ltd",
      role: "Keynote Speaker",
      location: "Madrid",
      start: "Jan 2018",
      end: "Present",
      bullets: ["Delivered 50+ keynotes on web accessibility."],
      bulletIds: ["bullet-1"],
    },
  ],
  skills: [{ name: "Speaking", items: ["Storytelling", "Improvisation"] }],
  languages: [{ language: "English", level: "Native" }],
};

async function createTemplateCVForUser(userId: string) {
  const cvId = crypto.randomUUID();
  const name = uniqueLabel("public-cv-spec");
  const now = new Date().toISOString();

  const { error } = await adminClient.from("cvs").insert({
    id: cvId,
    user_id: userId,
    name,
    filename: null,
    file_size: null,
    pdf_storage_path: null,
    type: "template",
    source_cv_id: null,
    template_id: "compact",
    template_locale: "en",
    schema_version: "1",
    source_text_hash: null,
    ai_model: "mock",
    profile: sampleProfile,
    public_enabled: false,
    public_id: null,
    public_slug: null,
    public_published_at: null,
    text_python: null,
    text_pdfjs: null,
    text_node: null,
    extract_error_python: null,
    extract_error_pdfjs: null,
    extract_error_node: null,
    created_at: now,
    updated_at: now,
  });
  if (error) throw error;

  return { id: cvId, name };
}

test("user can publish a CV, set public slug/notes/feedback, and visitors can view the page and submit feedback", async ({
  page,
}) => {
  const user = await createConfirmedUser("public-cv");
  await loginViaUI(page, user);
  const cv = await createTemplateCVForUser(user.id);

  // Go to editor
  await page.goto(`/cvs/editor`);
  await page.getByText(cv.name).click();
  await expect(page.getByText(tEditor.aiEditor)).toBeVisible();

  // Set custom public slug
  const customSlug = `test-slug-${crypto.randomBytes(4).toString("hex")}`;
  const slugInput = page.locator('input[placeholder="cv-name"]');
  await slugInput.fill("");
  await slugInput.fill(customSlug);

  // Click Publish
  await page.getByRole("button", { name: tEditor.publicPage.publish }).click();

  // Confirm publish in the modal
  const publishModal = page.getByRole("dialog").or(page.locator(".fixed.inset-0"));
  await expect(publishModal.getByText(tEditor.publicModal.title)).toBeVisible();
  await publishModal.getByRole("button", { name: tEditor.publicModal.confirm }).click();

  // Verify URL is shown as copied/shared
  await expect(page.getByRole("button", { name: tEditor.publicPage.unpublish })).toBeVisible();

  // Add a presentation note and an anchored bullet note
  const notesEditor = page.locator("section", { hasText: tEditor.publicNotes.title });
  await expect(notesEditor).toBeVisible();

  // Click "Add Note" for presentation note
  await notesEditor.getByRole("button", { name: tEditor.publicNotes.add }).click();
  const noteBox1 = notesEditor.locator(".rounded-2xl").nth(0);
  await noteBox1.locator("select").first().selectOption("presentation");
  await noteBox1.locator("textarea").fill("This is my special presentation note.");

  // Click "Add Note" for bullet note
  await notesEditor.getByRole("button", { name: tEditor.publicNotes.add }).click();
  const noteBox2 = notesEditor.locator(".rounded-2xl").nth(1);
  await noteBox2.locator("select").first().selectOption("bullet");
  await noteBox2.locator("select").nth(1).selectOption("experience");
  await noteBox2.locator("select").nth(2).selectOption("exp-1");
  await noteBox2.locator("select").nth(3).selectOption("bullet-1");
  await noteBox2.locator("textarea").fill("This experience was amazing!");

  // Check the Accept private visitor feedback checkbox
  const feedbackCheckbox = notesEditor.getByLabel(tEditor.publicNotes.acceptFeedback);
  await feedbackCheckbox.check();

  // Save notes
  await notesEditor.getByRole("button", { name: tEditor.publicNotes.save }).click();
  await expect(notesEditor.getByRole("button", { name: tEditor.publicNotes.save })).toBeEnabled();

  // Get the public URL
  const publicUrlText = await page.locator(".flex.min-w-0.items-center.gap-2.rounded-xl span").innerText();
  const publicId = publicUrlText.replace(/\/cv\//g, "").replace(/\//g, "").trim();
  const publicPath = `/cv/${publicId}/${customSlug}`;

  // Log out/clear session to act as anonymous visitor, or just open a fresh context
  const visitorPage = await page.context().newPage();

  // Setup console error listener to catch any rendering errors
  const scriptTagErrors: string[] = [];
  visitorPage.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("Encountered a script tag") || text.includes("Scripts inside React components are never executed")) {
      scriptTagErrors.push(text);
    }
  });

  visitorPage.on("pageerror", (err) => {
    if (err.message.includes("Encountered a script tag")) {
      scriptTagErrors.push(err.message);
    }
  });

  // Navigate to public path
  await visitorPage.goto(publicPath);

  // Check if public elements are visible
  await expect(visitorPage.getByText("John Public Doe")).toBeVisible();
  await expect(visitorPage.getByText("Distinguished Public Speaker")).toBeVisible();

  // Verify there are exactly 2 notes pins
  const notePins = visitorPage.locator('button[title="Note from the owner"]');
  await expect(notePins).toHaveCount(2);

  // Click first pin (presentation note) and verify
  await notePins.nth(0).click();
  await expect(visitorPage.getByText("This is my special presentation note.")).toBeVisible();

  // Click second pin (bullet note) and verify (this closes/toggles the active state)
  await notePins.nth(1).click();
  await expect(visitorPage.getByText("This experience was amazing!")).toBeVisible();

  // Check if feedback form is visible
  const feedbackForm = visitorPage.locator("form", { hasText: messages.en.publicCv.feedback.title });
  await expect(feedbackForm).toBeVisible();

  // Fill in and submit the feedback
  await feedbackForm.locator('input[name="giverName"]').fill("Recruiter Jane");
  await feedbackForm.locator('input[name="giverContext"]').fill("Met at conference");
  await feedbackForm.locator('textarea[name="feedbackText"]').fill("Great CV presentation! Let's talk.");
  await feedbackForm.getByRole("button", { name: messages.en.publicCv.feedback.send }).click();

  // Verify success banner is shown
  await expect(visitorPage.getByText(messages.en.publicCv.feedback.sent)).toBeVisible();

  // Assert that we encountered NO script rendering errors!
  expect(scriptTagErrors).toEqual([]);
});
