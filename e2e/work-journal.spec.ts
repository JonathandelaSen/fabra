import { expect, test } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";
import { createConfirmedUser } from "./helpers/supabase";
import { uniqueLabel } from "./helpers/env";
import { messages } from "../src/i18n/messages";

const t = messages.en.workJournal;

test("user can create, edit, and delete work journal entries", async ({ page }) => {
  const user = await createConfirmedUser("journal");
  await loginViaUI(page, user);

  const contextName = uniqueLabel("journal-context");
  const contextResponse = await page.request.post("/api/activity-contexts", {
    data: { type: "project", name: contextName },
  });
  expect(contextResponse.ok()).toBeTruthy();

  await page.goto("/work-journal");
  await expect(page.getByRole("heading", { name: t.title })).toBeVisible();

  await page.getByRole("button", { name: t.newEntry }).click();

  // Wait for React Query to load contexts (it can take a second after the POST)
  await page.getByLabel(t.context).waitFor({ state: "visible" });
  await page.getByLabel(t.context).selectOption({ label: contextName });

  const notesContent = "Completed the first part of the E2E testing framework.";
  await page.getByPlaceholder(t.notesPlaceholder).fill(notesContent);

  const createEntryResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/work-journal/entries") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: t.saveChanges }).click();
  await createEntryResponse;

  await expect(
    page.getByRole("article").getByText(notesContent),
  ).toBeVisible();

  await page.getByTitle(t.editEntry).click({ force: true });

  const finalDraftInput = page.locator("textarea").first();
  await expect(finalDraftInput).toHaveValue(notesContent);

  const updatedContent = "Updated: Completed E2E testing framework.";
  await finalDraftInput.fill(updatedContent);
  await expect(finalDraftInput).toHaveValue(updatedContent);

  await page.getByRole("button", { name: t.saveChanges }).click();

  await expect(
    page.getByRole("article").getByText(updatedContent),
  ).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTitle(t.deleteEntry).click({ force: true });

  await expect(
    page.getByRole("article").getByText(updatedContent),
  ).not.toBeVisible();
});
