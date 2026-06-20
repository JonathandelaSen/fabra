import type { StandardCVProfile } from "../cv-profile";
import type { CVTemplateId, CVTemplateLocale } from "../cv-templates";
import type { AIProvider } from "@/backend/modules/shared";
import type { StructuredCVProfileData } from "../value-objects/structured-cv-profile-data.value-object";
import type { EditedCVProfile } from "../value-objects/edited-cv-profile.value-object";

export interface StructuredCVProfileResult {
  schemaVersion: string;
  profile: StandardCVProfile;
}

export interface CVProfileStructuringAIService {
  structure(input: { text: string }): Promise<StructuredCVProfileData>;
}

export interface CVProfileStructuringAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): CVProfileStructuringAIService;
}

export interface CVProfileEditingAIService {
  edit(input: {
    profile: StandardCVProfile;
    instruction: string;
    templateId?: CVTemplateId;
    locale?: CVTemplateLocale;
    recommendations?: string[];
  }): Promise<EditedCVProfile>;
}

export interface CVProfileEditingAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): CVProfileEditingAIService;
}
