export function shouldShowPublicCVMessagesLoader(input: {
  cvsPending: boolean;
  feedbackPending: boolean;
  cvId: string | null;
  publicCVCount: number;
  desktop: boolean;
  messageId: string | null;
  messageCount: number;
}) {
  return input.cvsPending ||
    input.feedbackPending ||
    (!input.cvId && input.publicCVCount > 0) ||
    (input.desktop && Boolean(input.cvId) && !input.messageId && input.messageCount > 0);
}
