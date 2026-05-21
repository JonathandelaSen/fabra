export interface PrepareOfferChatCopyPasteResponse {
  workflowId: "offer_chat.assistant_response";
  schemaVersion: "1";
  prompt: string;
  expectedResponse: { kind: "plain_text" };
  privacyNotice: string;
}
