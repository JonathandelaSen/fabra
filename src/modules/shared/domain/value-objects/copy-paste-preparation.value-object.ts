import { ValueObject } from "./value-object";
import { CopyPasteAttemptId } from "./copy-paste-attempt-id.value-object";
import {
  CopyPasteExpectedResponse,
  type CopyPasteExpectedResponsePrimitives,
} from "./copy-paste-expected-response.value-object";
import { CopyPasteInteractionId } from "./copy-paste-interaction-id.value-object";
import { CopyPastePrivacyNotice } from "./copy-paste-privacy-notice.value-object";
import { CopyPastePrompt } from "./copy-paste-prompt.value-object";
import { CopyPasteSchemaVersion } from "./copy-paste-schema-version.value-object";
import { CopyPasteWorkflowId } from "./copy-paste-workflow-id.value-object";

export interface CopyPastePreparationPrimitives {
  workflowId: string;
  schemaVersion: string;
  prompt: string;
  expectedResponse: CopyPasteExpectedResponsePrimitives;
  privacyNotice: string | null;
  interactionId: string | null;
  attemptId: string | null;
}

export class CopyPastePreparation extends ValueObject<CopyPastePreparationPrimitives> {
  private constructor(
    private readonly workflowIdVo: CopyPasteWorkflowId,
    private readonly schemaVersionVo: CopyPasteSchemaVersion,
    private readonly promptVo: CopyPastePrompt,
    private readonly expectedResponseVo: CopyPasteExpectedResponse,
    private readonly privacyNoticeVo: CopyPastePrivacyNotice,
    private readonly interactionIdVo: CopyPasteInteractionId,
    private readonly attemptIdVo: CopyPasteAttemptId,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CopyPastePreparationPrimitives,
  ): CopyPastePreparation {
    return new CopyPastePreparation(
      CopyPasteWorkflowId.fromPrimitives(primitives.workflowId),
      CopyPasteSchemaVersion.fromPrimitives(primitives.schemaVersion),
      CopyPastePrompt.fromPrimitives(primitives.prompt),
      CopyPasteExpectedResponse.fromPrimitives(primitives.expectedResponse),
      CopyPastePrivacyNotice.fromPrimitives(primitives.privacyNotice),
      CopyPasteInteractionId.fromPrimitives(primitives.interactionId),
      CopyPasteAttemptId.fromPrimitives(primitives.attemptId),
    );
  }

  get workflowId(): string {
    return this.workflowIdVo.toPrimitives();
  }

  get schemaVersion(): string {
    return this.schemaVersionVo.toPrimitives();
  }

  get prompt(): string {
    return this.promptVo.toPrimitives();
  }

  get expectedResponse(): CopyPasteExpectedResponsePrimitives {
    return this.expectedResponseVo.toPrimitives();
  }

  get privacyNotice(): string | null {
    return this.privacyNoticeVo.toPrimitives();
  }

  get interactionId(): string | null {
    return this.interactionIdVo.toPrimitives();
  }

  get attemptId(): string | null {
    return this.attemptIdVo.toPrimitives();
  }

  toPrimitives(): CopyPastePreparationPrimitives {
    return {
      workflowId: this.workflowIdVo.toPrimitives(),
      schemaVersion: this.schemaVersionVo.toPrimitives(),
      prompt: this.promptVo.toPrimitives(),
      expectedResponse: this.expectedResponseVo.toPrimitives(),
      privacyNotice: this.privacyNoticeVo.toPrimitives(),
      interactionId: this.interactionIdVo.toPrimitives(),
      attemptId: this.attemptIdVo.toPrimitives(),
    };
  }
}
