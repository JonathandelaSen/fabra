import { SaveAIInteractionEvalCaseUseCase } from "./application/use-cases/save-ai-interaction-eval-case.use-case";
import { FilesystemEvalArtifactRepository } from "./infrastructure/repositories/filesystem-eval-artifact.repository";

const repo = new FilesystemEvalArtifactRepository();

export function createEvalArtifactsModule() {
  return {
    saveAIInteractionEvalCase: new SaveAIInteractionEvalCaseUseCase({ repo }),
  };
}

export type EvalArtifactsModule = ReturnType<typeof createEvalArtifactsModule>;
