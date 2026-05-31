import { expect, test } from "@playwright/test";
import { messages } from "../src/i18n/messages";
import { loginViaUI } from "./helpers/auth";
import { uniqueLabel } from "./helpers/env";
import { createConfirmedUser } from "./helpers/supabase";

const t = messages.en.workJournal;
const copyPaste = t.copyPaste;
const tLauncher = messages.en.aiLauncher;
const rawNotes =
  "Shipped copy paste workflow tests and aligned the journal editor.";
const pastedDraft =
  "I aligned the Work Journal copy paste workflow and kept the entry editable before saving.";

test("user can draft a work journal entry with Copy Paste", async ({ page }) => {
  const user = await createConfirmedUser("work-journal-copy-paste");
  await loginViaUI(page, user);

  const contextName = uniqueLabel("copy-paste-context");
  const contextResponse = await page.request.post("/api/activity-contexts", {
    data: {
      type: "project",
      name: contextName,
    },
  });
  expect(contextResponse.ok()).toBeTruthy();

  await page.goto("/work-journal");
  await page.context().grantPermissions(["clipboard-write"]);
  await expect(page.getByRole("heading", { name: t.title })).toBeVisible();

  await page.getByRole("button", { name: t.newEntry }).click();
  await page.getByLabel(t.context).waitFor({ state: "visible" });
  await page.getByLabel(t.context).selectOption({ label: contextName });
  await page.getByPlaceholder(t.topicPlaceholder).fill(uniqueLabel("copy-paste-topic"));
  await page
    .getByPlaceholder(t.aiNotesPlaceholder)
    .fill(rawNotes);

  await page.getByRole("button", { name: t.generateProfessionalDraft }).click();
  await page.getByRole("button", { name: tLauncher.openFlow }).click();

  const copyPasteDialog = page.getByRole("dialog", { name: copyPaste.title });
  await expect(copyPasteDialog).toBeVisible();
  await expect(page.getByText(copyPaste.privacyNotice)).toBeVisible();

  await copyPasteDialog.getByRole("button", { name: copyPaste.copyPrompt }).click();
  await expect(
    copyPasteDialog.getByRole("button", { name: copyPaste.promptCopied })
  ).toBeVisible();

  await copyPasteDialog.getByLabel(copyPaste.pasteResponseLabel).fill(pastedDraft);
  await copyPasteDialog.getByRole("button", { name: copyPaste.usePastedText }).click();
  await expect(copyPasteDialog).not.toBeVisible();

  const finalText = page.getByPlaceholder(t.notesPlaceholder);
  await expect(finalText).toBeVisible();
  await expect(finalText).toHaveValue(pastedDraft);

  const editedDraft = `${pastedDraft} I also verified the saved result.`;
  await finalText.fill(editedDraft);
  await page.getByRole("button", { name: t.saveChanges }).click();

  const savedEntry = page.getByRole("article").filter({ hasText: editedDraft });
  await expect(savedEntry).toBeVisible();
});

test("integrated AI drafting remains available when an API key is configured", async ({
  page,
}) => {
  const user = await createConfirmedUser("work-journal-integrated-ai");
  await loginViaUI(page, user);

  const contextName = uniqueLabel("integrated-ai-context");
  const contextResponse = await page.request.post("/api/activity-contexts", {
    data: { type: "project", name: contextName },
  });
  expect(contextResponse.ok()).toBeTruthy();

  await page.goto("/work-journal");
  await page.getByRole("button", { name: t.newEntry }).click();
  await page.getByLabel(t.context).waitFor({ state: "visible" });
  await page.getByLabel(t.context).selectOption({ label: contextName });
  await page.getByPlaceholder(t.aiNotesPlaceholder).fill("Some raw notes for AI");
  await page.getByRole("button", { name: t.generateProfessionalDraft }).click();

  await expect(
    page.getByText(tLauncher.insideLabel)
  ).toBeVisible();
});
