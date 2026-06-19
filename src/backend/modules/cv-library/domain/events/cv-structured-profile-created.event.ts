import type { DomainEvent } from "@/backend/modules/shared";

export class CVStructuredProfileCreatedEvent
  implements DomainEvent<{ profileId: string; cvDocumentId: string }>
{
  readonly eventName = "cv_structured_profile_created";
  readonly occurredAt = new Date();

  constructor(
    private readonly profileId: string,
    private readonly cvDocumentId: string
  ) {}

  toPrimitives(): { profileId: string; cvDocumentId: string } {
    return { profileId: this.profileId, cvDocumentId: this.cvDocumentId };
  }
}
