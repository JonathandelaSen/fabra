import { OFFER_STATUSES, type OfferStatus } from "@/lib/analysis-types";
import { parseAIRequestConfig, type AIRequestConfig } from "@/app/api/_shared/ai-request";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";
import { isInterfaceLanguage, type InterfaceLanguage } from "@/frontend/i18n/config";

type Result<TValue, TError> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

export interface HttpValidationError {
  message: string;
  status: 400;
}

export interface CreateJobMatchAnalysisHttpInput {
  cvId: string;
  title: string;
  jobDescription: string;
  jobUrl: string | null;
  model: string;
}

export interface ScoreJobMatchAnalysisHttpInput extends AIRequestConfig {
  jobDescription: string;
  jobUrl: string | null;
  language: InterfaceLanguage | null;
}

export interface UpdateJobMatchAnalysisHttpInput {
  allowedUpdates: { job_url?: string | null };
  followUpUpdates: {
    status?: OfferStatus;
  };
  includesOfferTracking: boolean;
}

function validationError(message: string): Result<never, HttpValidationError> {
  return { ok: false, error: { message, status: 400 } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  return value.trim() || null;
}

export function parseCreateJobMatchAnalysisRequest(
  body: unknown
): Result<CreateJobMatchAnalysisHttpInput, HttpValidationError> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");
  const cvId = text(body.cvId);
  const title = text(body.title);
  const jobDescription = text(body.jobDescription);
  const jobUrl = text(body.jobUrl) || null;
  const model = text(body.model) || DEFAULT_GEMINI_MODEL;
  if (!cvId) return validationError("cvId is required");
  if (!title) return validationError("Title is required");
  if (!jobDescription) return validationError("Job description is required for job match analysis");
  return { ok: true, value: { cvId, title, jobDescription, jobUrl, model } };
}

export function parseScoreJobMatchAnalysisRequest(
  body: unknown
): Result<ScoreJobMatchAnalysisHttpInput, HttpValidationError> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");
  const ai = parseAIRequestConfig(body);
  const jobDescription = text(body.jobDescription);
  const jobUrl = text(body.jobUrl) || null;
  if (!ai.ok) return validationError(ai.message);
  if (!jobDescription) return validationError("Job description is required for job match analysis");
  const language = isInterfaceLanguage(body.language) ? body.language : null;
  return { ok: true, value: { ...ai.value, jobDescription, jobUrl, language } };
}

export function parseUpdateJobMatchAnalysisRequest(
  body: unknown
): Result<UpdateJobMatchAnalysisHttpInput, HttpValidationError> {
  if (!isRecord(body)) return validationError("Request body must be a JSON object");
  const allowedUpdates: UpdateJobMatchAnalysisHttpInput["allowedUpdates"] = {};
  const followUpUpdates: UpdateJobMatchAnalysisHttpInput["followUpUpdates"] = {};

  if (body.job_url !== undefined) {
    const jobUrl = optionalText(body.job_url);
    if (jobUrl === undefined) return validationError("Invalid job URL");
    allowedUpdates.job_url = jobUrl;
  }
  if (body.offer_status !== undefined) {
    if (typeof body.offer_status !== "string" || !OFFER_STATUSES.includes(body.offer_status as OfferStatus)) {
      return validationError("Invalid offer status");
    }
    followUpUpdates.status = body.offer_status as OfferStatus;
  }
  const includesOfferTracking = followUpUpdates.status !== undefined;
  if (Object.keys(allowedUpdates).length === 0 && !includesOfferTracking) {
    return validationError("No valid fields to update");
  }
  return { ok: true, value: { allowedUpdates, followUpUpdates, includesOfferTracking } };
}
