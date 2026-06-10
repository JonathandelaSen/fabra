import { telemetry } from "@/lib/telemetry";
import { createApiErrorHandler } from "@/modules/shared";

export const handleApiError = createApiErrorHandler(telemetry);
