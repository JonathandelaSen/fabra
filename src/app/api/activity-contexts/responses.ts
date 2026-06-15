import { ACTIVITY_CONTEXT_STATUSES, ACTIVITY_CONTEXT_TYPES } from "@/shared/activity-context/constants";

export type ActivityContextResponseType =
  (typeof ACTIVITY_CONTEXT_TYPES)[keyof typeof ACTIVITY_CONTEXT_TYPES];
export type ActivityContextResponseStatus =
  (typeof ACTIVITY_CONTEXT_STATUSES)[keyof typeof ACTIVITY_CONTEXT_STATUSES];

export interface ActivityContextResponse {
  id: string;
  userId: string;
  name: string;
  type: ActivityContextResponseType;
  status: ActivityContextResponseStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ListActivityContextsResponse = {
  contexts: ActivityContextResponse[];
  suggestions?: ActivityContextSuggestionResponse[];
};

export type CreateActivityContextResponse = ActivityContextResponse;

export interface ActivityContextSuggestionResponse {
  type: ActivityContextResponseType;
  name: string;
  roleOrLabel: string | null;
}

interface ActivityContextPresenterOutput {
  id: string;
  userId: string;
  name: string;
  type: ActivityContextResponseType;
  status: ActivityContextResponseStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toActivityContextResponse(
  input: ActivityContextPresenterOutput
): ActivityContextResponse {
  return {
    id: input.id,
    userId: input.userId,
    name: input.name,
    type: input.type,
    status: input.status,
    isDefault: input.isDefault,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function toActivityContextSuggestionResponse(
  input: ActivityContextSuggestionResponse
): ActivityContextSuggestionResponse {
  return input;
}
