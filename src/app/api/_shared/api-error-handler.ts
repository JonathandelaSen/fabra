import { telemetry } from "@/lib/telemetry";
import { createApiErrorHandler } from "@/backend/modules/shared";

export const handleApiError = createApiErrorHandler(telemetry);
