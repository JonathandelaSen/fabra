import { readFileSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { uniqueLabel } from "./env";
import { adminClient } from "./supabase";

export interface CreatedAnalysisFixture {
  cv: {
    id: string;
  };
  analysis: {
    id: string;
    cv_id: string;
  };
}

interface AnalysisResponse {
  id: string;
  cv_id: string;
}

export async function createExtractionViaUI(page: Page) {
  const cvName = uniqueLabel("ui-cv");
  const analysisTitle = uniqueLabel("ui-analysis");

  await page.goto("/cv-analysis?mode=new");
  await page.getByTestId("new-analysis-upload-source").click();
  await page
    .getByTestId("new-analysis-file-input")
    .setInputFiles(path.resolve(process.cwd(), "test.pdf"));
  await page.getByPlaceholder("Frontend CV April").fill(cvName);
  await page.getByPlaceholder("React Frontend - Factorial").fill(analysisTitle);

  const analysisResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/cv-analyses") &&
      response.request().method() === "POST"
  );
  await page.getByTestId("new-analysis-submit").click();
  const analysisResponse = await analysisResponsePromise;
  expect(analysisResponse.ok()).toBeTruthy();
  const analysis = (await analysisResponse.json()) as AnalysisResponse;

  await expect(page).toHaveURL(new RegExp(`/cv-analysis/${analysis.id}`));

  return { cvName, analysisTitle, analysis };
}

export async function createFixtureViaApi(
  request: APIRequestContext,
  prefix = "api"
): Promise<CreatedAnalysisFixture> {
  const cvName = uniqueLabel(`${prefix}-cv`);
  const analysisTitle = uniqueLabel(`${prefix}-analysis`);
  const pdf = readFileSync(path.resolve(process.cwd(), "test.pdf"));

  const cvResponse = await request.post("/api/cvs", {
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
  const cv = (await cvResponse.json()) as CreatedAnalysisFixture["cv"];

  const analysisResponse = await request.post("/api/cv-analyses", {
    data: {
      cvId: cv.id,
      title: analysisTitle,
    },
  });
  expect(analysisResponse.ok()).toBeTruthy();
  const analysis =
    (await analysisResponse.json()) as CreatedAnalysisFixture["analysis"];

  return { cv, analysis };
}

export async function createStoredCVWithoutExtractedText(userId: string) {
  const cvName = uniqueLabel("stored-unextracted-cv");
  const cvId = crypto.randomUUID();
  const pdf = readFileSync(path.resolve(process.cwd(), "test.pdf"));
  const pdfStoragePath = `${userId}/${cvId}-${cvName}.pdf`;

  const { error: uploadError } = await adminClient.storage
    .from("cv-pdfs")
    .upload(pdfStoragePath, pdf, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const now = new Date().toISOString();
  const { data, error } = await adminClient
    .from("cvs")
    .insert({
      id: cvId,
      user_id: userId,
      name: cvName,
      filename: `${cvName}.pdf`,
      file_size: pdf.length,
      pdf_storage_path: pdfStoragePath,
      type: "uploaded",
      source_cv_id: null,
      template_id: null,
      template_locale: null,
      schema_version: null,
      source_text_hash: null,
      ai_model: null,
      profile: null,
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
    })
    .select("id,name")
    .single();

  if (error) throw error;
  return data;
}
