import {
  AggregateRoot,
  Link,
  type LinkPrimitives,
  LongText,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { OpportunityPersonCreatedEvent } from "../events/opportunity-person-created.event";
import { OpportunityPersonDeletedEvent } from "../events/opportunity-person-deleted.event";
import { OpportunityPersonUpdatedEvent } from "../events/opportunity-person-updated.event";
import { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";
import { OpportunityPersonId } from "../value-objects/opportunity-person-id.value-object";
import { OpportunityPersonName } from "../value-objects/opportunity-person-name.value-object";
import { OpportunityPersonRole } from "../value-objects/opportunity-person-role.value-object";

export interface OpportunityPersonPrimitives {
  id: string;
  userId: string;
  jobOpportunityId: string;
  name: string;
  role: string;
  jobTitle: string | null;
  organization: string | null;
  email: string | null;
  phone: string | null;
  links: LinkPrimitives[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityPersonCreateParams {
  id: OpportunityPersonId;
  userId: UserIdType;
  jobOpportunityId: JobOpportunityId;
  name: OpportunityPersonName;
  role: OpportunityPersonRole;
  jobTitle: LongText | null;
  organization: LongText | null;
  email: LongText | null;
  phone: LongText | null;
  links: Link[];
  notes: LongText | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OpportunityPersonUpdateParams {
  name: OpportunityPersonName;
  role: OpportunityPersonRole;
  jobTitle: LongText | null;
  organization: LongText | null;
  email: LongText | null;
  phone: LongText | null;
  links: Link[];
  notes: LongText | null;
  updatedAt: Timestamp;
}

export class OpportunityPerson extends AggregateRoot {
  private constructor(
    private readonly personId: OpportunityPersonId,
    private readonly ownerId: UserIdType,
    private readonly opportunityId: JobOpportunityId,
    private personName: OpportunityPersonName,
    private personRole: OpportunityPersonRole,
    private personJobTitle: LongText | null,
    private personOrganization: LongText | null,
    private personEmail: LongText | null,
    private personPhone: LongText | null,
    private personLinks: Link[],
    private personNotes: LongText | null,
    private readonly personCreatedAt: Timestamp,
    private personUpdatedAt: Timestamp,
  ) {
    super();
  }

  static create(params: OpportunityPersonCreateParams): OpportunityPerson {
    const person = new OpportunityPerson(
      params.id,
      params.userId,
      params.jobOpportunityId,
      params.name,
      params.role,
      params.jobTitle,
      params.organization,
      params.email,
      params.phone,
      params.links,
      params.notes,
      params.createdAt,
      params.updatedAt,
    );
    person.recordDomainEvent(
      new OpportunityPersonCreatedEvent(
        person.id,
        params.jobOpportunityId.toPrimitives(),
      ),
    );
    return person;
  }

  static fromPrimitives(
    primitives: OpportunityPersonPrimitives,
  ): OpportunityPerson {
    return new OpportunityPerson(
      OpportunityPersonId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      JobOpportunityId.fromPrimitives(primitives.jobOpportunityId),
      OpportunityPersonName.fromPrimitives(primitives.name),
      OpportunityPersonRole.fromPrimitives(primitives.role),
      optionalText(primitives.jobTitle),
      optionalText(primitives.organization),
      optionalText(primitives.email),
      optionalText(primitives.phone),
      primitives.links.map(Link.fromPrimitives),
      optionalText(primitives.notes),
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt),
    );
  }

  update(params: OpportunityPersonUpdateParams): void {
    this.personName = params.name;
    this.personRole = params.role;
    this.personJobTitle = params.jobTitle;
    this.personOrganization = params.organization;
    this.personEmail = params.email;
    this.personPhone = params.phone;
    this.personLinks = params.links;
    this.personNotes = params.notes;
    this.personUpdatedAt = params.updatedAt;
    this.recordDomainEvent(new OpportunityPersonUpdatedEvent(this.id));
  }

  delete(): void {
    this.recordDomainEvent(new OpportunityPersonDeletedEvent(this.id));
  }

  get id(): string {
    return this.personId.toPrimitives();
  }

  toPrimitives(): OpportunityPersonPrimitives {
    return {
      id: this.personId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      jobOpportunityId: this.opportunityId.toPrimitives(),
      name: this.personName.toPrimitives(),
      role: this.personRole.toPrimitives(),
      jobTitle: this.personJobTitle?.toPrimitives() ?? null,
      organization: this.personOrganization?.toPrimitives() ?? null,
      email: this.personEmail?.toPrimitives() ?? null,
      phone: this.personPhone?.toPrimitives() ?? null,
      links: this.personLinks.map((link) => link.toPrimitives()),
      notes: this.personNotes?.toPrimitives() ?? null,
      createdAt: this.personCreatedAt.toPrimitives(),
      updatedAt: this.personUpdatedAt.toPrimitives(),
    };
  }
}

function optionalText(value: string | null): LongText | null {
  return value === null ? null : LongText.fromPrimitives(value);
}
