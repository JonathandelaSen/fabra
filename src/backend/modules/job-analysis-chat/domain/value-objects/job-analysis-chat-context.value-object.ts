import { EntityId, LongText, ValueObject } from "@/backend/modules/shared";
import { JobAnalysisChatSnapshot } from "./job-analysis-chat-snapshot.value-object";

export interface JobAnalysisChatContextPrimitives {
  analysisId: string;
  cvId: string | null;
  analysisMode: string;
  analysis: unknown;
  cv: unknown;
  cvText: string | null;
  people: JobAnalysisChatPersonPrimitives[];
}

export interface JobAnalysisChatPersonPrimitives {
  name: string;
  role: string;
  jobTitle: string | null;
  organization: string | null;
  links: Array<{ url: string; label: string | null }>;
  notes: string | null;
}

export class JobAnalysisChatContext extends ValueObject<JobAnalysisChatContextPrimitives> {
  private constructor(
    private readonly analysisIdValue: EntityId,
    private readonly cvIdValue: EntityId | null,
    private readonly analysisModeValue: LongText,
    private readonly analysisSnapshot: JobAnalysisChatSnapshot,
    private readonly cvSnapshot: JobAnalysisChatSnapshot,
    private readonly cvTextValue: LongText | null,
    private readonly peopleSnapshot: JobAnalysisChatSnapshot,
  ) {
    super();
  }

  static fromPrimitives(primitives: JobAnalysisChatContextPrimitives): JobAnalysisChatContext {
    return new JobAnalysisChatContext(
      EntityId.fromPrimitives(primitives.analysisId),
      primitives.cvId === null ? null : EntityId.fromPrimitives(primitives.cvId),
      LongText.fromPrimitives(primitives.analysisMode),
      JobAnalysisChatSnapshot.fromPrimitives(primitives.analysis),
      JobAnalysisChatSnapshot.fromPrimitives(primitives.cv),
      primitives.cvText === null ? null : LongText.fromPrimitives(primitives.cvText),
      JobAnalysisChatSnapshot.fromPrimitives(primitives.people),
    );
  }

  get analysisId(): string {
    return this.analysisIdValue.toPrimitives();
  }

  get cvId(): string | null {
    return this.cvIdValue?.toPrimitives() ?? null;
  }

  get analysisMode(): string {
    return this.analysisModeValue.toPrimitives();
  }

  get analysis(): unknown {
    return this.analysisSnapshot.toPrimitives();
  }

  get cv(): unknown {
    return this.cvSnapshot.toPrimitives();
  }

  get cvText(): string | null {
    return this.cvTextValue?.toPrimitives() ?? null;
  }

  get people(): JobAnalysisChatPersonPrimitives[] {
    return this.peopleSnapshot.toPrimitives() as JobAnalysisChatPersonPrimitives[];
  }

  toPrimitives(): JobAnalysisChatContextPrimitives {
    return {
      analysisId: this.analysisIdValue.toPrimitives(),
      cvId: this.cvIdValue?.toPrimitives() ?? null,
      analysisMode: this.analysisModeValue.toPrimitives(),
      analysis: this.analysisSnapshot.toPrimitives(),
      cv: this.cvSnapshot.toPrimitives(),
      cvText: this.cvTextValue?.toPrimitives() ?? null,
      people: this.people,
    };
  }
}
