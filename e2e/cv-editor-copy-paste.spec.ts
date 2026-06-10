import crypto from "node:crypto";
import { expect, test } from "@playwright/test";
import { messages } from "../src/i18n/messages";
import { loginViaUI } from "./helpers/auth";
import { uniqueLabel } from "./helpers/env";
import { adminClient, createConfirmedUser } from "./helpers/supabase";

test.setTimeout(120_000);

const tEditor = messages.en.cvEditor;
const tLauncher = messages.en.aiLauncher;
const tCopyPaste = messages.en.analysisFlow.copyPaste;
const tEditorCp = messages.en.cvEditor.copyPaste;

const sampleProfile = {
  basics: {
    name: "Test Person",
    headline: "Software Engineer",
    email: "test@example.com",
    location: "Madrid",
  },
  summary: "Experienced developer with strong delivery habits.",
  experience: [
    {
      company: "Acme Corp",
      role: "Senior Engineer",
      bullets: ["Delivered production features."],
    },
  ],
  skills: [{ name: "Core", items: ["TypeScript", "React"] }],
  technicalSkills: ["Next.js", "PostgreSQL"],
};

const editedProfile = {
  ...sampleProfile,
  basics: {
    ...sampleProfile.basics,
    name: "Test Person Edited",
    headline: "Staff Software Engineer",
  },
  summary: "Staff-level engineer leading platform initiatives.",
};

const validEditResponse = JSON.stringify({
  workflowId: "cv_editor.apply_instruction",
  schemaVersion: "1",
  result: editedProfile,
});

async function createTemplateCVForUser(userId: string) {
  const cvId = crypto.randomUUID();
  const name = uniqueLabel("editor-cp-cv");
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

test.describe("CV editor copy-paste workflow", () => {
  test("user can edit a CV profile via Copy Paste flow", async ({ page }) => {
    const user = await createConfirmedUser("cv-editor-cp");
    await loginViaUI(page, user);
    const cv = await createTemplateCVForUser(user.id);

    await page.goto(`/cvs/editor`);
    await page.context().grantPermissions(["clipboard-write"]);
    await page.getByText(cv.name).click();
    await expect(page.getByText(tEditor.aiEditor)).toBeVisible();

    await page
      .locator("textarea")
      .first()
      .fill("Make the headline Staff level");

    await page
      .getByRole("button", { name: tEditor.aiEditorAction })
      .click();
    await expect(page.getByText(tLauncher.externalLabel)).toBeVisible();

    await page.getByRole("button", { name: tLauncher.openFlow }).click();

    const dialog = page.getByRole("dialog", { name: tEditorCp.title });
    await expect(dialog).toBeVisible();

    const continueBtn = dialog.getByRole("button", { name: tCopyPaste.continue });
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    await dialog
      .getByLabel(tCopyPaste.pasteResponseLabel)
      .fill("}{");
    await dialog
      .getByRole("button", { name: tCopyPaste.validateResponse })
      .click();
    await expect(dialog.getByText(/not valid JSON|not include a usable/i)).toBeVisible();

    await dialog
      .getByLabel(tCopyPaste.pasteResponseLabel)
      .fill(validEditResponse);
    await dialog
      .getByRole("button", { name: tCopyPaste.validateResponse })
      .click();
    await expect(
      dialog.getByText("Test Person Edited"),
    ).toBeVisible();

    await dialog
      .getByRole("button", { name: tEditorCp.applyEdit })
      .click();
    await expect(dialog).not.toBeVisible();
  });

  test("Copy Paste option is available without API key", async ({ page }) => {
    const user = await createConfirmedUser("cv-editor-cp-nokey");
    await loginViaUI(page, user);
    const cv = await createTemplateCVForUser(user.id);

    await page.goto(`/cvs/editor`);
    await page.getByText(cv.name).click();

    await expect(page.getByText(tEditor.aiEditor)).toBeVisible();

    await page
      .locator("textarea")
      .first()
      .fill("Some instruction");

    await page
      .getByRole("button", { name: tEditor.aiEditorAction })
      .click();
    await expect(page.getByText(tLauncher.externalLabel)).toBeVisible();
    await expect(
      page.getByRole("button", { name: tLauncher.openFlow }),
    ).toBeVisible();
  });

  test("manual editor still works alongside Copy Paste", async ({ page }) => {
    const user = await createConfirmedUser("cv-editor-cp-manual");
    await loginViaUI(page, user);
    const cv = await createTemplateCVForUser(user.id);

    await page.goto(`/cvs/editor`);
    await page.getByText(cv.name).click();

    await page.getByRole("button", { name: tEditor.editorTabs.manual, exact: true }).click();
    await expect(page.getByText(tEditor.manual.title)).toBeVisible();
  });
});
