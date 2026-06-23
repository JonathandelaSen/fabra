import type { AIInteractionReadModelPrimitives } from "@/backend/modules/ai-interactions";
import { badRequest } from "@/backend/modules/shared";
import type {
  EvalArtifactRepository,
  SaveEvalArtifactsInput,
} from "../../domain/repositories/eval-artifact.repository";
import { EvalArtifactSaveResult } from "../../domain/value-objects/eval-artifact-save-result.value-object";

export interface SaveAIInteractionEvalCaseInput {
  interaction: AIInteractionReadModelPrimitives;
  name: string;
  note: string | null;
}

export class SaveAIInteractionEvalCaseUseCase {
  constructor(private readonly deps: {
    repo: EvalArtifactRepository;
    now?: () => Date;
    randomId?: () => string;
  }) {}

  async execute(input: SaveAIInteractionEvalCaseInput): Promise<EvalArtifactSaveResult> {
    if (!input.interaction.prompt) {
      throw badRequest("Cannot save an eval case without a captured prompt");
    }

    const now = this.deps.now?.() ?? new Date();
    const createdAt = now.toISOString();
    const caseId = this.deps.randomId?.() ?? crypto.randomUUID();
    const actionId = toActionId(input.interaction.module, input.interaction.operation);
    const runId = `${toTimestampId(createdAt)}.fabra-baseline`;
    const runtime = {
      provider: input.interaction.provider,
      model: input.interaction.model,
      temperature: null,
    };
    const renderedPrompt = { format: "text" as const, text: input.interaction.prompt };
    const hasBaseline = input.interaction.rawResponse !== null || input.interaction.parsedResult !== null || input.interaction.error !== null;

    const artifacts: SaveEvalArtifactsInput = {
      suite: {
        suiteId: actionId,
        actionId,
        name: suiteNameFor(actionId),
        description: `Captured cases for ${actionId}.`,
      },
      case: {
        schemaVersion: "1",
        caseId,
        actionId,
        name: input.name,
        note: input.note,
        createdAt,
        createdBy: { source: "fabra", userRole: "admin" },
        input: {
          interactionId: input.interaction.interactionId,
          module: input.interaction.module,
          operation: input.interaction.operation,
          entityType: input.interaction.entityType,
          entityId: input.interaction.entityId,
        },
        promptTemplate: input.interaction.promptVersion
          ? { format: "text", templateId: input.interaction.promptVersion, text: null }
          : null,
        promptVariables: {},
        renderedPrompt,
        runtime,
        expectedOutput: {
          kind: input.interaction.parsedResult === null ? "text" : "json",
          schemaRef: schemaRefFor(actionId),
        },
        source: {
          app: "fabra",
          route: "/admin/ai-interactions",
          entityRefs: {
            interactionId: input.interaction.interactionId,
            entityId: input.interaction.entityId,
          },
        },
      },
      run: hasBaseline
        ? {
            schemaVersion: "1",
            runId,
            name: "Fabra baseline capture",
            actionId,
            producer: "fabra",
            createdAt,
            caseIds: [caseId],
            runtime,
            executionMode: "fabra_baseline_capture",
            notes: "Created while saving case from Fabra admin UI.",
          }
        : null,
      result: hasBaseline
        ? {
            schemaVersion: "1",
            resultId: `${toTimestampId(createdAt)}.fabra.${caseId}`,
            caseId,
            runId,
            producer: "fabra",
            createdAt,
            runtime,
            promptVariables: {},
            renderedPrompt,
            rawOutput: input.interaction.rawResponse,
            parsedOutput: input.interaction.parsedResult,
            status: input.interaction.error ? "failed" : "completed",
            error: input.interaction.error,
            usage: {
              inputTokens: null,
              outputTokens: null,
              costUsd: null,
            },
            latencyMs: input.interaction.durationMs,
          }
        : null,
    };

    return this.deps.repo.save(artifacts);
  }
}

function toActionId(moduleName: string, operation: string): string {
  return `${moduleName.replace(/-/g, "_")}.${operation}`;
}

function toTimestampId(iso: string): string {
  return iso.replace(/:/g, "").replace(".000", "").replace(/\.\d{3}/, "");
}

function suiteNameFor(actionId: string): string {
  if (actionId === "job_match_analysis.score_cv_against_offer") return "Job match scoring";
  return actionId;
}

function schemaRefFor(actionId: string): string | null {
  if (actionId === "job_match_analysis.score_cv_against_offer") {
    return "fabra://job_match_analysis/score_response/v1";
  }
  return null;
}
