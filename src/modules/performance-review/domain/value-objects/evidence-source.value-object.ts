import { DomainError, ValueObject } from "@/modules/shared";

export const EVIDENCE_SOURCE = {
  journalEntry: "journal_entry",
  receivedFeedback: "received_feedback",
  commitment: "commitment",
  custom: "custom",
} as const;

export const EVIDENCE_SOURCES = [
  EVIDENCE_SOURCE.journalEntry,
  EVIDENCE_SOURCE.receivedFeedback,
  EVIDENCE_SOURCE.commitment,
  EVIDENCE_SOURCE.custom,
] as const;

export type EvidenceSourceValue = (typeof EVIDENCE_SOURCES)[number];

export class EvidenceSource extends ValueObject<EvidenceSourceValue> {
  private constructor(private readonly value: EvidenceSourceValue) {
    super();
  }

  static fromPrimitives(value: string): EvidenceSource {
    if (!EVIDENCE_SOURCES.includes(value as EvidenceSourceValue)) {
      throw new DomainError(`Invalid evidence source: ${value}`);
    }
    return new EvidenceSource(value as EvidenceSourceValue);
  }

  toPrimitives(): EvidenceSourceValue {
    return this.value;
  }
}
