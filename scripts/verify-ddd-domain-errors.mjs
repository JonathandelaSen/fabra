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

function isExported(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function hasHeritage(node, baseName) {
  return (
    node.heritageClauses?.some((clause) =>
      clause.types.some((type) => type.expression.getText() === baseName)
    ) ?? false
  );
}

function getConstructor(node) {
  return node.members.find((member) => ts.isConstructorDeclaration(member));
}

function location(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `${line + 1}:${character + 1}`;
}

async function checkErrorFile(file, violations) {
  const source = await readFile(path.join(repoRoot, file), "utf8");
  const sourceFile = parseSource(source, file);

  const errorClasses = sourceFile.statements.filter(
    (statement) =>
      ts.isClassDeclaration(statement) &&
      statement.name &&
      isExported(statement) &&
      hasHeritage(statement, "DomainError")
  );

  for (const errorClass of errorClasses) {
    const className = errorClass.name.text;

    if (!className.endsWith("Error")) {
      violations.push({
        file,
        location: location(sourceFile, errorClass.name),
        rule: "error-classname-suffix",
        reason: `Domain error class "${className}" name must end with the "Error" suffix.`,
      });
    }

    const constructor = getConstructor(errorClass);
    if (!constructor) continue;

    for (const parameter of constructor.parameters) {
      const paramName = parameter.name.getText();
      const paramType = parameter.type ? parameter.type.getText(sourceFile) : "";

      if (paramName === "details") {
        violations.push({
          file,
          location: location(sourceFile, parameter.name),
          rule: "error-details-deprecated",
          reason: `Constructor parameter "details" in "${className}" must be renamed to "data" to maintain consistency.`,
        });
      }

      if (paramName === "data") {
        const isValidRecordType = paramType.includes("Record<") || paramType === "any" || paramType.includes("{") || paramType.includes("unknown");
        const isRawString = /\bstring\b/.test(paramType) && !paramType.includes("Record<string,");
        if (!isValidRecordType || isRawString) {
          violations.push({
            file,
            location: location(sourceFile, parameter.name),
            rule: "error-data-type",
            reason: `Constructor parameter "data" in "${className}" must be typed as a Record/object type (e.g. "Record<string, unknown>"), not "${paramType}".`,
          });
        }
      }
    }
  }
}

export async function findDddDomainErrorViolations() {
  const modulesDir = path.join(repoRoot, "src/backend/modules");
  const files = (await walkFiles(modulesDir))
    .map((filePath) => toPosixRelative(repoRoot, filePath))
    .filter(
      (file) =>
        file.includes("/domain/errors/") &&
        file.endsWith(".error.ts") &&
        !file.startsWith("src/backend/modules/shared/")
    )
    .sort();

  const violations = [];
  for (const file of files) {
    await checkErrorFile(file, violations);
  }

  return violations;
}

export function formatDddDomainErrorViolations(violations) {
  if (violations.length === 0) return "";

  return [
    "DDD domain error violations:",
    ...violations.map((violation) => {
      const location = violation.location ? `:${violation.location}` : "";
      return `- ${violation.file}${location} (${violation.rule}): ${violation.reason}`;
    }),
  ].join("\n");
}

async function main() {
  const violations = await findDddDomainErrorViolations();

  if (violations.length > 0) {
    console.error(formatDddDomainErrorViolations(violations));
    process.exitCode = 1;
    return;
  }

  console.log("DDD domain error check passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
