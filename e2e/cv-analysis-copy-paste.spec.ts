import { expect, test } from "@playwright/test";
import { messages } from "../src/i18n/messages";
import { loginViaUI } from "./helpers/auth";
import { createFixtureViaApi } from "./helpers/cv";
import { createConfirmedUser } from "./helpers/supabase";

test.setTimeout(90_000);

const validExternalChatResponse = JSON.stringify({
  workflowId: "cv_analysis.score",
  schemaVersion: "1",
  result: {
    score: 88,
    feedback: "Buen CV con fortalezas claras y mejoras accionables.",
    keywords: ["TypeScript", "React"],
    improvements: ["Añade métricas de impacto"],
  },
});

test("user can score and replace a CV analysis with Copy Paste", async ({
  page,
}) => {
  const user = await createConfirmedUser("cv-copy-paste");
  await loginViaUI(page, user);
  const { analysis } = await createFixtureViaApi(page.request, "copy-paste");

  await page.goto(`/cv-analysis/${analysis.id}`);
  await page
    .getByRole("button", { name: messages.en.analysisFlow.modeSelector.generalTitle })
    .click();

  await expect(
    page.getByRole("button", {
      name: messages.en.analysisFlow.forms.analyzeCV,
    }),
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: messages.en.analysisFlow.forms.analyzeCV,
    })
    .click();
    
  await expect(page.getByText(messages.en.aiLauncher.externalLabel)).toBeVisible();
  await page.getByRole("button", { name: messages.en.aiLauncher.openFlow }).click();
  await expect(
    page.getByRole("heading", {
      name: messages.en.analysisFlow.copyPaste.title,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(messages.en.analysisFlow.copyPaste.privacyNotice),
  ).toBeVisible();

  await page
    .getByRole("button", { name: messages.en.analysisFlow.copyPaste.continue })
    .click();
  await page
    .getByLabel(messages.en.analysisFlow.copyPaste.pasteResponseLabel)
    .fill("not json");
  await page
    .getByRole("button", {
      name: messages.en.analysisFlow.copyPaste.validateResponse,
    })
    .click();
  await expect(page.getByText("not valid JSON")).toBeVisible();
  await expect(
    page.getByLabel(messages.en.analysisFlow.copyPaste.pasteResponseLabel),
  ).toHaveValue("not json");
  await expect(
    page.getByRole("button", {
      name: messages.en.analysisFlow.copyPaste.copyCorrection,
    }),
  ).toBeVisible();

  await page
    .getByLabel(messages.en.analysisFlow.copyPaste.pasteResponseLabel)
    .fill(validExternalChatResponse);
  await page
    .getByRole("button", {
      name: messages.en.analysisFlow.copyPaste.validateResponse,
    })
    .click();
  await expect(page.getByText("88/100")).toBeVisible();
  await expect(
    page.getByText(messages.en.analysisFlow.copyPaste.externalChat, {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: messages.en.analysisFlow.copyPaste.applyAnalysis,
    })
    .click();

  await expect(
    page.getByText("Buen CV con fortalezas claras y mejoras accionables."),
  ).toBeVisible();
});
