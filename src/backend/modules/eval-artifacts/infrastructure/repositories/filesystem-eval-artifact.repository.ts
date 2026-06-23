import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  EvalArtifactRepository,
  SaveEvalArtifactsInput,
} from "../../domain/repositories/eval-artifact.repository";
import { EvalArtifactSaveResult } from "../../domain/value-objects/eval-artifact-save-result.value-object";

interface EvalSuiteFileRow {
  schemaVersion: "1";
  suiteId: string;
  actionId: string;
  name: string;
  description: string;
  caseIds: string[];
}

export class FilesystemEvalArtifactRepository implements EvalArtifactRepository {
  constructor(private readonly workspaceRoot = join(process.cwd(), "evals")) {}

  async save(input: SaveEvalArtifactsInput): Promise<EvalArtifactSaveResult> {
    await this.ensureWorkspace();
    const suiteDir = join(this.workspaceRoot, "suites", input.suite.suiteId);
    const caseDir = join(suiteDir, "cases");
    await mkdir(caseDir, { recursive: true });

    const caseFilename = `${toFilename(input.case.caseId)}.case.json`;
    const casePath = join(caseDir, caseFilename);
    await writeJson(casePath, input.case);
    await this.upsertSuite(input);

    let runPath: string | null = null;
    let resultPath: string | null = null;
    if (input.run) {
      const runDir = join(this.workspaceRoot, "runs", toFilename(input.run.runId));
      await mkdir(join(runDir, "results"), { recursive: true });
      runPath = join(runDir, "run.json");
      await writeJson(runPath, input.run);

      if (input.result) {
        resultPath = join(runDir, "results", `${toFilename(input.case.caseId)}.result.json`);
        await writeJson(resultPath, input.result);
      }
    }

    return EvalArtifactSaveResult.fromPrimitives({
      caseId: input.case.caseId,
      casePath,
      runPath,
      resultPath,
    });
  }

  private async ensureWorkspace(): Promise<void> {
    await mkdir(join(this.workspaceRoot, "suites"), { recursive: true });
    await mkdir(join(this.workspaceRoot, "runs"), { recursive: true });
    await mkdir(join(this.workspaceRoot, "annotations"), { recursive: true });

    const manifestPath = join(this.workspaceRoot, "manifest.json");
    if (!(await exists(manifestPath))) {
      await writeJson(manifestPath, {
        schemaVersion: "1",
        workspaceName: "Fabra evals",
        createdAt: new Date().toISOString(),
      });
    }
  }

  private async upsertSuite(input: SaveEvalArtifactsInput): Promise<void> {
    const suitePath = join(this.workspaceRoot, "suites", input.suite.suiteId, "suite.json");
    const existing = await readJson<EvalSuiteFileRow>(suitePath);
    const caseIds = new Set(existing?.caseIds ?? []);
    caseIds.add(input.case.caseId);

    await writeJson(suitePath, {
      schemaVersion: "1",
      suiteId: input.suite.suiteId,
      actionId: input.suite.actionId,
      name: input.suite.name,
      description: input.suite.description,
      caseIds: Array.from(caseIds),
    } satisfies EvalSuiteFileRow);
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await readFile(path, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch {
    return null;
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function toFilename(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "eval-artifact";
}
