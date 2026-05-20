import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { messages } from "../src/i18n/messages";
import { loginViaUI } from "./helpers/auth";
import { uniqueLabel } from "./helpers/env";
import { createConfirmedUser, getProcessingEvents } from "./helpers/supabase";

test.setTimeout(90_000);

const validExternalChatResponse = JSON.stringify({
  workflowId: "job_match_analysis.score",
  schemaVersion: "1",
  result: {
    score: 74,
    feedback: "Buena coincidencia con la oferta de trabajo.",
    aiKeywords: ["React", "TypeScript"],
    improvements: ["Añade experiencia en testing"],
    jobKeyData: null,
    jobKeywords: ["React", "TypeScript", "Node"],
    cvKeywords: ["React", "TypeScript"],
    matchingKeywords: ["React", "TypeScript"],
    missingKeywords: ["Node"],
  },
});

const tForms = messages.en.analysisFlow.forms;
const tCopyPaste = messages.en.analysisFlow.copyPaste;
const tJobCopyPaste = messages.en.jobMatchCopyPaste;

async function createJobMatchAnalysisFixture(
  page: import("@playwright/test").Page,
) {
  const user = await createConfirmedUser("jm-copy-paste");
  await loginViaUI(page, user);

  const pdf = readFileSync(path.resolve(process.cwd(), "test.pdf"));
  const cvName = uniqueLabel("jm-copy-paste-cv");
  const cvResponse = await page.request.post("/api/cvs", {
    multipart: {
      name: cvName,
      file: {
        name: `${cvName}.pdf`,
        mimeType: "application/pdf",
        buffer: pdf,
      },
    },
  });
  expect(cvResponse.ok()).toBeTruthy();
  const cv = (await cvResponse.json()) as { id: string };

  const analysisResponse = await page.request.post("/api/job-match-analyses", {
    data: {
      cvId: cv.id,
      title: uniqueLabel("jm-copy-paste-analysis"),
      jobDescription: "Senior React Dev with TypeScript. Experience with Node.js required.",
    },
  });
  expect(analysisResponse.ok()).toBeTruthy();
  const analysis = (await analysisResponse.json()) as { id: string };

  await page.goto(`/job-analyses/${analysis.id}`);

  return { user, analysis };
}

test("user can score a job match analysis with Copy Paste", async ({
  page,
}) => {
  const { user, analysis } = await createJobMatchAnalysisFixture(page);

  const jobDescription =
    "Senior React Dev with TypeScript. Experience with Node.js required.";
  const jobDescriptionInput = page.locator("textarea").first();
  await expect(jobDescriptionInput).toBeVisible();
  await jobDescriptionInput.fill(jobDescription);

  await expect(
    page.getByRole("button", { name: tForms.analyzeWithExternalChat }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: tForms.analyzeWithExternalChat })
    .click();

  await expect(
    page.getByRole("heading", { name: tCopyPaste.title }),
  ).toBeVisible();
  await expect(page.getByText(tCopyPaste.privacyNotice)).toBeVisible();

  await page.getByRole("button", { name: tCopyPaste.continue }).click();

  await page.getByLabel(tCopyPaste.pasteResponseLabel).fill("not json");
  await page
    .getByRole("button", { name: tCopyPaste.validateResponse })
    .click();
  await expect(page.getByText("not valid JSON")).toBeVisible();
  await expect(page.getByLabel(tCopyPaste.pasteResponseLabel)).toHaveValue(
    "not json",
  );
  await expect(
    page.getByRole("button", { name: tCopyPaste.copyCorrection }),
  ).toBeVisible();

  await page
    .getByLabel(tCopyPaste.pasteResponseLabel)
    .fill(validExternalChatResponse);
  await page
    .getByRole("button", { name: tCopyPaste.validateResponse })
    .click();

  await expect(page.getByText("74/100")).toBeVisible();
  await expect(
    page.getByText(tCopyPaste.externalChat, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(tJobCopyPaste.matchingKeywords)).toBeVisible();

  await page
    .getByRole("button", { name: tCopyPaste.applyAnalysis })
    .click();

  await expect(
    page.getByText("Buena coincidencia con la oferta de trabajo."),
  ).toBeVisible();

  await page.waitForTimeout(1000);

  const events = await getProcessingEvents({
    userId: user.id,
    analysisId: analysis.id,
  });
  expect(events).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        stage: "job_match_copy_paste_result_applied",
        status: "success",
      }),
    ]),
  );
});

test("replacement warning appears when analysis already has a score", async ({
  page,
}) => {
  const { analysis } = await createJobMatchAnalysisFixture(page);

  const jobDescription = "Senior React Developer";
  const jobDescriptionInput = page.locator("textarea").first();
  await jobDescriptionInput.fill(jobDescription);

  await page
    .getByRole("button", { name: tForms.analyzeWithExternalChat })
    .click();
  await page.getByRole("button", { name: tCopyPaste.continue }).click();
  await page
    .getByLabel(tCopyPaste.pasteResponseLabel)
    .fill(validExternalChatResponse);
  await page
    .getByRole("button", { name: tCopyPaste.validateResponse })
    .click();
  await page
    .getByRole("button", { name: tCopyPaste.applyAnalysis })
    .click();

  await expect(
    page.getByText("Buena coincidencia con la oferta de trabajo."),
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: messages.en.analysisFlow.appShell.extractionTab,
    })
    .click();

  await jobDescriptionInput.fill(jobDescription);
  await page
    .getByRole("button", { name: tForms.analyzeWithExternalChat })
    .click();
  await page.getByRole("button", { name: tCopyPaste.continue }).click();
  await page
    .getByLabel(tCopyPaste.pasteResponseLabel)
    .fill(validExternalChatResponse);
  await page
    .getByRole("button", { name: tCopyPaste.validateResponse })
    .click();

  await expect(page.getByText(tCopyPaste.replacementWarning)).toBeVisible();
  await page
    .getByRole("button", { name: tCopyPaste.replaceAnalysis })
    .click();
});
