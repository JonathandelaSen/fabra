import { expect, test } from "@playwright/test";
import { messages } from "../src/i18n/messages";
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

  await page.goto("/?view=templates");
  await expect(
    page.getByRole("heading", { name: tTemplates.title }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: tTemplates.useTemplate })
    .first()
    .click();
  await page.getByPlaceholder(tTemplates.searchCv).fill("template-copy-paste");
  await page.getByRole("button", { name: /template-copy-paste/ }).click();

  await expect(
    page.getByRole("button", { name: tTemplates.structureWithExternalChat }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: tTemplates.structureWithExternalChat })
    .click();

  await expect(
    page.getByRole("heading", { name: tProfile.title }),
  ).toBeVisible();
  await expect(page.getByText(tCopyPaste.privacyNotice)).toBeVisible();
  await expect(page.locator("textarea").first()).toContainText(
    "Extract this CV text",
  );

  await page.getByRole("button", { name: tCopyPaste.continue }).click();
  await page.getByLabel(tCopyPaste.pasteResponseLabel).fill("not json");
  await page
    .getByRole("button", { name: tCopyPaste.validateResponse })
    .click();
  await expect(page.getByText("not valid JSON")).toBeVisible();

  await page
    .getByLabel(tCopyPaste.pasteResponseLabel)
    .fill(validProfileResponse);
  await page
    .getByRole("button", { name: tCopyPaste.validateResponse })
    .click();
  await expect(page.getByText("Ada Lovelace")).toBeVisible();
  await expect(page.getByText("100/100")).toBeVisible();

  await page.getByRole("button", { name: tProfile.applyProfile }).click();
  await expect(page).toHaveURL(/view=editor/);
  await expect(page.locator('a[href="mailto:ada@example.com"]')).toBeVisible();
});

test("Copy Paste prepares prompt for a stored CV without previous extraction", async ({
  page,
}) => {
  const user = await createConfirmedUser("cv-template-copy-paste-unextracted");
  await loginViaUI(page, user);
  const cv = await createStoredCVWithoutExtractedText(user.id);
  const tTemplates = messages.en.analysisFlow.templates;
  const tProfile = messages.en.analysisFlow.cvProfileCopyPaste;

  await page.goto("/?view=templates");
  await page
    .getByRole("button", { name: tTemplates.useTemplate })
    .first()
    .click();
  await page.getByPlaceholder(tTemplates.searchCv).fill(cv.name);
  await page.getByRole("button", { name: cv.name }).click();
  await page
    .getByRole("button", { name: tTemplates.structureWithExternalChat })
    .click();

  await expect(
    page.getByRole("heading", { name: tProfile.title }),
  ).toBeVisible();
  await expect(page.locator("textarea").first()).toContainText(
    "Extract this CV text",
  );
});
