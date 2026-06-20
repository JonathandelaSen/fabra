import {
  AggregateRoot,
  EntityId,
  LongText,
  StringList,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { JobOpportunityCreatedEvent } from "../events/job-opportunity-created.event";
import { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";

export interface JobOpportunityPrimitives {
  id: string;
  userId: string;
  title: string | null;
  company: string | null;
  location: string | null;
  remote: string | null;
  salary: string | null;
  seniority: string | null;
  contractType: string | null;
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  notablePoints: string[];
  description: string | null;
  url: string | null;
  sourceJobMatchAnalysisId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobOpportunityCreateParams {
  id: JobOpportunityId;
  userId: UserIdType;
  title: string | null;
  company: string | null;
  location: string | null;
  remote: string | null;
  salary: string | null;
  seniority: string | null;
  contractType: string | null;
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  notablePoints: string[];
  description: string | null;
  url: string | null;
  sourceJobMatchAnalysisId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class JobOpportunity extends AggregateRoot {
  private constructor(
    private readonly opportunityId: JobOpportunityId,
    private readonly ownerId: UserIdType,
    private readonly opportunityTitle: string | null,
    private readonly opportunityCompany: string | null,
    private readonly opportunityLocation: string | null,
    private readonly opportunityRemote: string | null,
    private readonly opportunitySalary: string | null,
    private readonly opportunitySeniority: string | null,
    private readonly opportunityContractType: string | null,
    private readonly opportunityBenefits: string[],
    private readonly opportunityRequirements: string[],
    private readonly opportunityResponsibilities: string[],
    private readonly opportunityNotablePoints: string[],
    private readonly opportunityDescription: string | null,
    private readonly opportunityUrl: string | null,
    private readonly opportunitySourceJobMatchAnalysisId: string | null,
    private readonly opportunityCreatedAt: Timestamp,
    private readonly opportunityUpdatedAt: Timestamp
  ) {
    super();
  }

  static create(params: JobOpportunityCreateParams): JobOpportunity {
    const opportunity = new JobOpportunity(
      params.id,
      params.userId,
      params.title,
      params.company,
      params.location,
      params.remote,
      params.salary,
      params.seniority,
      params.contractType,
      params.benefits,
      params.requirements,
      params.responsibilities,
      params.notablePoints,
      params.description,
      params.url,
      params.sourceJobMatchAnalysisId,
      params.createdAt,
      params.updatedAt
    );
    opportunity.recordDomainEvent(new JobOpportunityCreatedEvent(opportunity.id));
    return opportunity;
  }

  static fromPrimitives(primitives: JobOpportunityPrimitives): JobOpportunity {
    return new JobOpportunity(
      JobOpportunityId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      primitives.title,
      primitives.company,
      primitives.location,
      primitives.remote,
      primitives.salary,
      primitives.seniority,
      primitives.contractType,
      primitives.benefits,
      primitives.requirements,
      primitives.responsibilities,
      primitives.notablePoints,
      primitives.description,
      primitives.url,
      primitives.sourceJobMatchAnalysisId,
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt)
    );
  }

  get id(): string {
    return this.opportunityId.toPrimitives();
  }

  get userId(): string {
    return this.ownerId.toPrimitives();
  }

  toPrimitives(): JobOpportunityPrimitives {
    return {
      id: this.opportunityId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      title: this.opportunityTitle
        ? LongText.fromPrimitives(this.opportunityTitle).toPrimitives()
        : null,
      company: this.opportunityCompany
        ? LongText.fromPrimitives(this.opportunityCompany).toPrimitives()
        : null,
      location: this.opportunityLocation
        ? LongText.fromPrimitives(this.opportunityLocation).toPrimitives()
        : null,
      remote: this.opportunityRemote
        ? LongText.fromPrimitives(this.opportunityRemote).toPrimitives()
        : null,
      salary: this.opportunitySalary
        ? LongText.fromPrimitives(this.opportunitySalary).toPrimitives()
        : null,
      seniority: this.opportunitySeniority
        ? LongText.fromPrimitives(this.opportunitySeniority).toPrimitives()
        : null,
      contractType: this.opportunityContractType
        ? LongText.fromPrimitives(this.opportunityContractType).toPrimitives()
        : null,
      benefits: StringList.fromPrimitives(this.opportunityBenefits).toPrimitives(),
      requirements: StringList.fromPrimitives(this.opportunityRequirements).toPrimitives(),
      responsibilities: StringList.fromPrimitives(this.opportunityResponsibilities).toPrimitives(),
      notablePoints: StringList.fromPrimitives(this.opportunityNotablePoints).toPrimitives(),
      description: this.opportunityDescription
        ? LongText.fromPrimitives(this.opportunityDescription).toPrimitives()
        : null,
      url: this.opportunityUrl
        ? LongText.fromPrimitives(this.opportunityUrl).toPrimitives()
        : null,
      sourceJobMatchAnalysisId: this.opportunitySourceJobMatchAnalysisId
        ? EntityId.fromPrimitives(this.opportunitySourceJobMatchAnalysisId).toPrimitives()
        : null,
      createdAt: this.opportunityCreatedAt.toPrimitives(),
      updatedAt: this.opportunityUpdatedAt.toPrimitives(),
    };
  }
}
