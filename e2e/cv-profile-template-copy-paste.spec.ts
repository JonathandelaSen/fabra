import { expect, test } from "@playwright/test";
import { messages } from "../src/frontend/i18n/messages";
import { loginViaUI } from "./helpers/auth";
import {
  createFixtureViaApi,
  createStoredCVWithoutExtractedText,
} from "./helpers/cv";
import { createConfirmedUser } from "./helpers/supabase";

test.setTimeout(120_000);

const validProfileResponse = JSON.stringify({
  workflowId: "cv_profile.structure_for_template",
  schemaVersion: "1",
  result: {
    basics: {
      name: "Ada Lovelace",
      headline: "Senior Software Engineer",
      email: "ada@example.com",
      location: "London",
    },
    summary: "Builds reliable product platforms with strong delivery habits.",
    experience: [
      {
        company: "Analytical Engines",
        role: "Lead Engineer",
        bullets: ["Delivered production systems with measurable impact."],
      },
    ],
    skills: [{ name: "Core", items: ["TypeScript", "React"] }],
    technicalSkills: ["Next.js", "PostgreSQL"],
  },
});

test("user can create a template CV profile with Copy Paste", async ({
  page,
}) => {
  const user = await createConfirmedUser("cv-template-copy-paste");
  await loginViaUI(page, user);
  await createFixtureViaApi(page.request, "template-copy-paste");
  const tTemplates = messages.en.analysisFlow.templates;
  const tCopyPaste = messages.en.analysisFlow.copyPaste;
  const tProfile = messages.en.analysisFlow.cvProfileCopyPaste;

  await page.goto("/templates");
  await page.context().grantPermissions(["clipboard-write"]);
  await expect(
    page.getByRole("heading", { name: tTemplates.title }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Linea" }).click();

  await expect(
    page.getByRole("heading", { name: "Linea" }).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: /template-copy-paste/ }).click();

  await page.getByRole("button", { name: tTemplates.createVersion }).click();
  await expect(page.getByText(messages.en.aiLauncher.externalLabel)).toBeVisible();
  await page.getByRole("button", { name: messages.en.aiLauncher.openFlow }).click();
  const dialog = page.getByRole("dialog", { name: tProfile.title });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(tCopyPaste.privacyNotice)).toBeVisible();
  await expect(dialog.locator("textarea").first()).toContainText(
    "Extract this CV text",
  );

  await dialog.getByRole("button", { name: tCopyPaste.continue }).click();
  await dialog.getByLabel(tCopyPaste.pasteResponseLabel).fill("}{");
  await dialog
    .getByRole("button", { name: tCopyPaste.validateResponse })
    .click();
  await expect(dialog.getByText("not valid JSON")).toBeVisible();

  await dialog
    .getByLabel(tCopyPaste.pasteResponseLabel)
    .fill(validProfileResponse);
  await dialog
    .getByRole("button", { name: tCopyPaste.validateResponse })
    .click();
  await expect(dialog.getByText("Ada Lovelace")).toBeVisible();
  await expect(dialog.getByText("100/100")).toBeVisible();

  await dialog.getByRole("button", { name: tProfile.applyProfile }).click();
  await expect(page).toHaveURL(/\/cvs\/editor\//);
  await expect(page.getByRole("button", { name: messages.en.cvEditor.editorTabs.ai, exact: true })).toBeVisible();
});

test("Copy Paste prepares prompt for a stored CV without previous extraction", async ({
  page,
}) => {
  const user = await createConfirmedUser("cv-template-copy-paste-unextracted");
  await loginViaUI(page, user);
  const cv = await createStoredCVWithoutExtractedText(user.id);
  const tTemplates = messages.en.analysisFlow.templates;
  const tProfile = messages.en.analysisFlow.cvProfileCopyPaste;

  await page.goto("/templates");
  await page.context().grantPermissions(["clipboard-write"]);
  await page.getByRole("button", { name: "Linea" }).first().click();
  await page.getByRole("button", { name: cv.name }).click();

  await page.getByRole("button", { name: tTemplates.createVersion }).click();
  await expect(page.getByText(messages.en.aiLauncher.externalLabel)).toBeVisible();
  await page.getByRole("button", { name: messages.en.aiLauncher.openFlow }).click();
  const dialog = page.getByRole("dialog", { name: tProfile.title });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("textarea").first()).toContainText(
    "Extract this CV text",
  );
});
