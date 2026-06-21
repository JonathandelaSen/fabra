import type {
  CVProfile,
  CVProfilePrimitives,
} from "../value-objects/cv-profile.value-object";
import type { CVTemplateId, CVTemplateLocale } from "../cv-templates";
import type { AIProvider } from "@/backend/modules/shared";
import type { StructuredCVProfileData } from "../value-objects/structured-cv-profile-data.value-object";

export interface StructuredCVProfileResult {
  schemaVersion: string;
  profile: CVProfilePrimitives;
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
    profile: CVProfilePrimitives;
    instruction: string;
    templateId?: CVTemplateId;
    locale?: CVTemplateLocale;
    recommendations?: string[];
  }): Promise<CVProfile>;
}

export interface CVProfileEditingAIServiceFactory {
  create(config: {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): CVProfileEditingAIService;
}
