import type {
  ActivityContextSuggestionResponse,
  CreateActivityContextResponse,
} from "../responses";

export type {
  ActivityContextResponse,
  ActivityContextSuggestionResponse,
  CreateActivityContextResponse,
} from "../responses";
export {
  toActivityContextResponse,
  toActivityContextSuggestionResponse,
} from "../responses";

export interface ListActivityContextSuggestionsResponse {
  suggestions: ActivityContextSuggestionResponse[];
}

export interface DismissActivityContextSuggestionResponse {
  ok: true;
}

export type HandleActivityContextSuggestionResponse =
  | CreateActivityContextResponse
  | DismissActivityContextSuggestionResponse;
