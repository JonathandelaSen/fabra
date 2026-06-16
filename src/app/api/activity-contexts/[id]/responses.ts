export type { ActivityContextResponse as UpdateActivityContextResponse } from "../responses";
export { toActivityContextResponse } from "../responses";

export interface DeleteActivityContextResponse {
  reassignedRecords: number;
}
