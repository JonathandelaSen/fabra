import type { EvalArtifactSaveResult } from "../value-objects/eval-artifact-save-result.value-object";

export interface SaveEvalArtifactsInput {
  suite: {
    suiteId: string;
    actionId: string;
    name: string;
    description: string;
  };
  case: {
    schemaVersion: "1";
    caseId: string;
    actionId: string;
    name: string;
    note: string | null;
    createdAt: string;
    createdBy: {
      source: "fabra";
      userRole: "admin";
    };
    input: Record<string, unknown>;
    promptTemplate: unknown | null;
    promptVariables: Record<string, unknown>;
    renderedPrompt:
      | { format: "text"; text: string }
      | {
          format: "messages";
          messages: Array<{
            role: "system" | "user" | "assistant";
            content: string;
          }>;
        };
    runtime: {
      provider: string;
      model: string | null;
      temperature: number | null;
    };
    expectedOutput: {
      kind: "json" | "text";
      schemaRef: string | null;
    };
    source: {
      app: "fabra";
      route: string | null;
      entityRefs: Record<string, string>;
    };
  };
  run: {
    schemaVersion: "1";
    runId: string;
    name: string;
    actionId: string;
    producer: "fabra";
    createdAt: string;
    caseIds: string[];
    runtime: {
      provider: string;
      model: string | null;
      temperature: number | null;
    };
    executionMode: "fabra_baseline_capture";
    notes: string;
  } | null;
  result: {
    schemaVersion: "1";
    resultId: string;
    caseId: string;
    runId: string;
    producer: "fabra";
    createdAt: string;
    runtime: {
      provider: string;
      model: string | null;
      temperature: number | null;
    };
    promptVariables: Record<string, unknown>;
    renderedPrompt:
      | { format: "text"; text: string }
      | {
          format: "messages";
          messages: Array<{
            role: "system" | "user" | "assistant";
            content: string;
          }>;
        };
    rawOutput: string | null;
    parsedOutput: unknown | null;
    status: "completed" | "failed";
    error: string | null;
    usage: {
      inputTokens: number | null;
      outputTokens: number | null;
      costUsd: number | null;
    };
    latencyMs: number | null;
  } | null;
}

export interface EvalArtifactRepository {
  save(input: SaveEvalArtifactsInput): Promise<EvalArtifactSaveResult>;
}
