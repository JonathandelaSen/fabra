import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function walkFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      files.push(...(await walkFiles(entryPath)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".ts")) files.push(entryPath);
  }
  return files;
}

function toPosixRelative(rootDir, filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function parseSource(source, fileName) {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
}

function checkSourceFile(sourceFile, file, violations) {
  const localClasses = new Map();
  for (const statement of sourceFile.statements) {
    if (ts.isClassDeclaration(statement) && statement.name) {
      localClasses.set(statement.name.text, statement);
    }
  }

  function location(node) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    return `${line + 1}:${character + 1}`;
  }

  function addViolation(node, rule, reason) {
    violations.push({
      file,
      rule,
      reason,
      location: location(node),
    });
  }

  function checkThrowStatement(node) {
    const expr = node.expression;
    if (!expr) return;

    if (ts.isIdentifier(expr)) {
      let isCatch = false;
      let parent = node.parent;
      while (parent) {
        if (ts.isCatchClause(parent)) {
          isCatch = true;
          break;
        }
        parent = parent.parent;
      }
      if (isCatch) {
        return;
      }
    }

    if (!ts.isNewExpression(expr)) {
      addViolation(
        node,
        "throw-must-be-new-expression",
        `Throw statement should throw a new expression of a local custom error class, not "${expr.getText()}".`
      );
      return;
    }

    const className = expr.expression.getText();
    if (!localClasses.has(className)) {
      addViolation(
        node,
        "throw-must-be-local-class",
        `Throw statement throws "${className}" which is not defined in the same file. VOs and Entities must define their own error classes in the same file.`
      );
      return;
    }

    const classDecl = localClasses.get(className);
    const inheritsError = classDecl.heritageClauses?.some((clause) =>
      clause.types.some((type) => {
        const name = type.expression.getText();
        return name === "Error" || name === "DomainError" || name.endsWith("Error");
      })
    ) ?? false;

    if (!inheritsError) {
      addViolation(
        classDecl.name ?? classDecl,
        "local-error-must-extend-error",
        `Local error class "${className}" must extend Error or DomainError.`
      );
    }
  }

  function visit(node) {
    if (ts.isThrowStatement(node)) {
      checkThrowStatement(node);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

export async function findVoAndEntityErrorViolations({ rootDir = repoRoot } = {}) {
  const modulesDir = path.join(rootDir, "src/backend/modules");
  const allFiles = await walkFiles(modulesDir);
  const targetFiles = allFiles
    .map((filePath) => toPosixRelative(rootDir, filePath))
    .filter((file) => {
      const isVo = file.includes("/domain/value-objects/") && file.endsWith(".value-object.ts");
      const isEntity = file.includes("/domain/entities/") && file.endsWith(".entity.ts");
      const isTest = file.endsWith(".test.ts");
      return (isVo || isEntity) && !isTest;
    })
    .sort();

  const violations = [];
  for (const file of targetFiles) {
    const source = await readFile(path.join(rootDir, file), "utf8");
    const sourceFile = parseSource(source, file);
    checkSourceFile(sourceFile, file, violations);
  }

  return { violations, fileCount: targetFiles.length };
}

export function formatVoAndEntityErrorViolations(violations) {
  if (violations.length === 0) return "";

  return [
    "VO and Entity local error violations:",
    ...violations.map((violation) => {
      const locStr = violation.location ? `:${violation.location}` : "";
      return `- ${violation.file}${locStr} (${violation.rule}): ${violation.reason}`;
    }),
  ].join("\n");
}

async function main() {
  const { violations, fileCount } = await findVoAndEntityErrorViolations();

  if (violations.length > 0) {
    console.error(formatVoAndEntityErrorViolations(violations));
    process.exitCode = 1;
    return;
  }

  console.log(`VO and Entity error check passed (${fileCount} files checked).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
