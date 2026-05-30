import { expect, test } from "@playwright/test";
import { messages } from "../src/i18n/messages";
import { loginViaUI } from "./helpers/auth";
import { uniqueLabel } from "./helpers/env";
import { createConfirmedUser } from "./helpers/supabase";

const t = messages.en.feedbackNotes;
const launcher = messages.en.aiLauncher;
const cp = t.copyPaste;
const pastedFeedback =
  "Great collaboration and clear communication throughout the project. Keep it up.";

async function seedFeedbackWithEntry(
  page: import("@playwright/test").Page,
  personName: string,
  contextLabel: string
) {
  const contextResponse = await page.request.post("/api/activity-contexts", {
    data: { type: "project", name: uniqueLabel(contextLabel) },
  });
  expect(contextResponse.ok()).toBeTruthy();
  const context = (await contextResponse.json()) as { id: string };

  const feedbackResponse = await page.request.post(
    "/api/feedback-notes/feedbacks",
    {
      data: { personName, activityContextId: context.id },
    }
  );
  expect(feedbackResponse.ok()).toBeTruthy();
  const feedback = (await feedbackResponse.json()) as { id: string };

  const entryResponse = await page.request.post(
    `/api/feedback-notes/feedbacks/${feedback.id}/entries`,
    { data: { content: "Very helpful during code reviews." } }
  );
  expect(entryResponse.ok()).toBeTruthy();

  return feedback;
}

test.describe("Feedback notes copy-paste workflow", () => {
  test("user can generate final feedback via Copy Paste flow", async ({
    page,
  }) => {
    const user = await createConfirmedUser("feedback-copy-paste");
    await loginViaUI(page, user);

    const feedback = await seedFeedbackWithEntry(
      page,
      "Copy Paste Test Person",
      "fb-cp-ctx"
    );

    await page.goto(`/feedback-notes/${feedback.id}`);
    await page.context().grantPermissions(["clipboard-write"]);
    await expect(page.getByText("Copy Paste Test Person")).toBeVisible();
    await page.getByRole("button", { name: t.actions.edit, exact: true }).click();

    await page.getByRole("button", { name: t.final.generate }).click();
    await expect(page.getByText(launcher.externalLabel)).toBeVisible();

    await page.getByRole("button", { name: launcher.openFlow }).click();

    const dialog = page.getByRole("dialog", { name: cp.title });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(cp.privacyNotice)).toBeVisible();

    await dialog.getByRole("button", { name: cp.copyPrompt }).click();
    await expect(
      dialog.getByRole("button", { name: cp.promptCopied })
    ).toBeVisible();

    await dialog.getByLabel(cp.pasteResponseLabel).fill(pastedFeedback);
    await dialog.getByRole("button", { name: cp.usePastedText }).click();
    await expect(dialog).not.toBeVisible();

    const finalTextarea = page.getByPlaceholder(t.final.placeholder);
    await expect(finalTextarea).toHaveValue(pastedFeedback);

    const editedFeedback = `${pastedFeedback} Also improved documentation.`;
    await finalTextarea.fill(editedFeedback);

    await page.getByRole("button", { name: t.final.save }).click();
    await page.waitForTimeout(1000);

    await page.reload();
    await expect(
      page.getByText(editedFeedback)
    ).toBeVisible();
  });

  test("Copy Paste is available without API key", async ({ page }) => {
    const user = await createConfirmedUser("feedback-cp-no-key");
    await loginViaUI(page, user);

    const feedback = await seedFeedbackWithEntry(
      page,
      "No Key Person",
      "fb-cp-nokey"
    );

    await page.goto(`/feedback-notes/${feedback.id}`);
    await expect(
      page.getByRole("heading", { name: "No Key Person" }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: t.actions.edit, exact: true }).click();

    await expect(
      page.getByRole("button", { name: t.final.generate })
    ).toBeVisible();

    await page.getByRole("button", { name: t.final.generate }).click();
    await expect(page.getByText(launcher.externalLabel)).toBeVisible();
    await expect(
      page.getByRole("button", { name: launcher.openFlow })
    ).toBeVisible();
  });

  test("integrated generation section is visible in launcher", async ({
    page,
  }) => {
    const user = await createConfirmedUser("feedback-cp-integrated");
    await loginViaUI(page, user);

    const feedback = await seedFeedbackWithEntry(
      page,
      "Integrated Person",
      "fb-cp-int"
    );

    await page.goto(`/feedback-notes/${feedback.id}`);
    await expect(
      page.getByRole("heading", { name: "Integrated Person" }).first()
    ).toBeVisible();

    await page.getByRole("button", { name: t.actions.edit, exact: true }).click();

    await page.getByRole("button", { name: t.final.generate }).click();

    await expect(page.getByText(launcher.insideLabel)).toBeVisible();
    await expect(page.getByText(launcher.externalLabel)).toBeVisible();
  });
});
