import { EntityId, OptionalIsoDate, ValueObject } from "@/backend/modules/shared";
import { EvidenceContent } from "./evidence-content.value-object";
import {
  EvidenceSource,
  type EvidenceSourceValue,
} from "./evidence-source.value-object";

export interface EvidenceCandidatePrimitives {
  source: string;
  sourceId: string;
  date: string | null;
  content: string;
}

export class EvidenceCandidate extends ValueObject<EvidenceCandidatePrimitives> {
  private constructor(
    private readonly candidateSource: EvidenceSource,
    private readonly candidateSourceId: EntityId,
    private readonly candidateDate: OptionalIsoDate,
    private readonly candidateContent: EvidenceContent,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: EvidenceCandidatePrimitives,
  ): EvidenceCandidate {
    return new EvidenceCandidate(
      EvidenceSource.fromPrimitives(primitives.source),
      EntityId.fromPrimitives(primitives.sourceId),
      OptionalIsoDate.fromPrimitives(primitives.date),
      EvidenceContent.fromPrimitives(primitives.content),
    );
  }

  get source(): EvidenceSourceValue {
    return this.candidateSource.toPrimitives();
  }

  get sourceId(): string {
    return this.candidateSourceId.toPrimitives();
  }

  get date(): string | null {
    return this.candidateDate.toPrimitives();
  }

  get content(): string {
    return this.candidateContent.toPrimitives();
  }

  toPrimitives(): EvidenceCandidatePrimitives {
    return {
      source: this.candidateSource.toPrimitives(),
      sourceId: this.candidateSourceId.toPrimitives(),
      date: this.candidateDate.toPrimitives(),
      content: this.candidateContent.toPrimitives(),
    };
  }
}
