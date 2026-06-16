import type { ListActivityContextsResponse } from "@/app/api/activity-contexts/responses";
import type { ListReceivedFeedbackResponse } from "@/app/api/received-feedback/responses";

export type ReceivedFeedbackItem = ListReceivedFeedbackResponse[number];
export type ActivityContext = ListActivityContextsResponse["contexts"][number];
