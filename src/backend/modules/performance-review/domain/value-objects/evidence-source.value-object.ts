import { ErrorCode } from "@/shared/error-codes";
import { DomainError, ValueObject } from "@/backend/modules/shared";

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

export class InvalidEvidenceSourceError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_EVIDENCE_SOURCE, `Invalid evidence source: ${value}`, { value });
    this.name = "InvalidEvidenceSourceError";
  }
}

export class EvidenceSource extends ValueObject<EvidenceSourceValue> {
  private constructor(private readonly value: EvidenceSourceValue) {
    super();
  }

  static fromPrimitives(value: string): EvidenceSource {
    if (!EVIDENCE_SOURCES.includes(value as EvidenceSourceValue)) {
      throw new InvalidEvidenceSourceError(value);
    }
    return new EvidenceSource(value as EvidenceSourceValue);
  }

  static journalEntry(): EvidenceSource {
    return new EvidenceSource(EVIDENCE_SOURCE.journalEntry);
  }

  static receivedFeedback(): EvidenceSource {
    return new EvidenceSource(EVIDENCE_SOURCE.receivedFeedback);
  }

  static commitment(): EvidenceSource {
    return new EvidenceSource(EVIDENCE_SOURCE.commitment);
  }

  static custom(): EvidenceSource {
    return new EvidenceSource(EVIDENCE_SOURCE.custom);
  }

  isJournalEntry(): boolean {
    return this.value === EVIDENCE_SOURCE.journalEntry;
  }

  isReceivedFeedback(): boolean {
    return this.value === EVIDENCE_SOURCE.receivedFeedback;
  }

  isCommitment(): boolean {
    return this.value === EVIDENCE_SOURCE.commitment;
  }

  isCustom(): boolean {
    return this.value === EVIDENCE_SOURCE.custom;
  }

  toPrimitives(): EvidenceSourceValue {
    return this.value;
  }
}
