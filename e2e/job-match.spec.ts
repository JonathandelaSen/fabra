import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";
import { createConfirmedUser } from "./helpers/supabase";
import { uniqueLabel } from "./helpers/env";
import { messages } from "../src/i18n/messages";

test.setTimeout(90_000);

const tForms = messages.en.analysisFlow.forms;
const tLauncher = messages.en.aiLauncher;

test("user can score a job match analysis with integrated AI and view the results", async ({
  page,
}) => {
  // Seed AI preferences so the integrated (in-app) AI path is available on
  // every page load (provider gemini + a stored key => hasAIApiKey === true).
  await page.addInitScript(() => {
    localStorage.setItem("fabra.aiProvider", "gemini");
    localStorage.setItem("fabra.aiApiKey.gemini", "test-api-key");
  });

  const user = await createConfirmedUser("job-match");
  await loginViaUI(page, user);

  // Create a CV and a job match analysis through the API.
  const pdf = readFileSync(path.resolve(process.cwd(), "test.pdf"));
  const cvName = uniqueLabel("job-match-cv");
  const cvResponse = await page.request.post("/api/cvs", {
    multipart: {
      name: cvName,
      file: { name: `${cvName}.pdf`, mimeType: "application/pdf", buffer: pdf },
    },
  });
  expect(cvResponse.ok()).toBeTruthy();
  const cv = (await cvResponse.json()) as { id: string };

  const jobDescription =
    "We are looking for a Senior React Developer with 5+ years of experience in Next.js.";
  const analysisResponse = await page.request.post("/api/job-match-analyses", {
    data: {
      cvId: cv.id,
      title: uniqueLabel("job-match-analysis"),
      jobDescription,
    },
  });
  expect(analysisResponse.ok()).toBeTruthy();
  const analysis = (await analysisResponse.json()) as { id: string };

  // Mock the integrated scoring endpoint so the test never calls a real AI
  // provider. The score mutation applies this response straight to the cache.
  const scoredDetail = {
    id: analysis.id,
    userId: "user-id",
    cvId: cv.id,
    title: "Job Match Test",
    filename: `${cvName}.pdf`,
    fileSize: 1000,
    pdfStoragePath: "path",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiModel: "gemini-2.5-flash",
    jobDescription,
    jobUrl: null,
    offerStatus: null,
    offerNotes: null,
    offerNextAction: null,
    offerNextActionAt: null,
    aiScore: 85,
    aiFeedback: "Great match for the position.",
    aiKeywords: JSON.stringify(["React", "Next.js"]),
    aiImprovements: JSON.stringify(["Add more tests to your CV"]),
    aiAnalyzedAt: new Date().toISOString(),
    jobKeyData: null,
    jobKeywords: JSON.stringify(["React", "Next.js", "TypeScript"]),
    cvKeywords: JSON.stringify(["React", "Next.js"]),
    matchingKeywords: JSON.stringify(["React", "Next.js"]),
    missingKeywords: JSON.stringify(["TypeScript"]),
    textPython: "John Doe CV\nExperience: Developer",
    textPdfjs: null,
    textNode: null,
    extractErrorPython: null,
    extractErrorPdfjs: null,
    extractErrorNode: null,
    cv: { id: cv.id, name: cvName, filename: `${cvName}.pdf` },
  };
  await page.route(/\/api\/job-match-analyses\/[^/]+\/score$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(scoredDetail),
    });
  });

  await page.goto(`/job-analyses/${analysis.id}`);

  // Open the analysis tab and run the integrated comparison.
  const extractionTab = page.getByRole("tab", {
    name: messages.en.analysisFlow.appShell.extractionTab,
  });
  const analysisTab = page.getByRole("tab", {
    name: messages.en.analysisFlow.appShell.analysisTab,
  });
  await expect(extractionTab).toHaveAttribute("aria-selected", "true");
  await analysisTab.click();
  await expect(page).toHaveURL(/\/job-analyses\/[^/?]+\/analysis(?:\?|$)/);
  await expect(analysisTab).toHaveAttribute("aria-selected", "true");

  // The comparison launcher stays disabled until a job description is entered.
  const jobDescriptionInput = page.getByPlaceholder(
    tForms.jobDescriptionPlaceholder,
  );
  await expect(jobDescriptionInput).toBeVisible();
  await jobDescriptionInput.fill(jobDescription);

  const compareButton = page.getByRole("button", { name: tForms.compareOffer });
  const continueButton = page.getByRole("button", { name: tLauncher.continue });
  await expect(async () => {
    if (!(await continueButton.isVisible())) {
      await compareButton.click();
    }
    await expect(continueButton).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await continueButton.click();

  await expect(page.getByText("Great match for the position.")).toBeVisible();
});
