import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DOMAIN_ERRORS_PATH_PATTERN = /\/domain\/errors\/[^/]+\.error$/;

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

function classExtendsErrorLike(classDecl) {
  return (
    classDecl.heritageClauses?.some((clause) =>
      clause.types.some((type) => {
        const name = type.expression.getText();
        return name === "Error" || name === "DomainError" || name.endsWith("Error");
      })
    ) ?? false
  );
}

// Resolves an import specifier to an absolute file path (without extension),
// relative to the file that contains the import. Returns null for bare/package
// specifiers we can't resolve statically (e.g. "@/backend/modules/shared").
function resolveImportSpecifier(specifier, fileRelPath, rootDir) {
  if (specifier.startsWith(".")) {
    return path.resolve(path.dirname(path.join(rootDir, fileRelPath)), specifier);
  }
  if (specifier.startsWith("@/")) {
    return path.join(rootDir, "src", specifier.slice(2));
  }
  return null;
}

function collectImportedErrorClasses(sourceFile, file, rootDir) {
  // Maps imported local name -> resolved absolute path (without extension) of
  // the module it came from, only for imports that live under a
  // `domain/errors/*.error.ts` file (the convention for real DomainError subclasses).
  const imports = new Map();

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;

    const resolved = resolveImportSpecifier(specifier, file, rootDir);
    if (!resolved) continue;

    const resolvedPosix = toPosixRelative(rootDir, resolved);
    if (!DOMAIN_ERRORS_PATH_PATTERN.test(`/${resolvedPosix}`)) continue;

    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;

    for (const element of namedBindings.elements) {
      imports.set(element.name.text, resolved);
    }
  }

  return imports;
}

function checkSourceFile(sourceFile, file, violations, rootDir) {
  const localClasses = new Map();
  for (const statement of sourceFile.statements) {
    if (ts.isClassDeclaration(statement) && statement.name) {
      localClasses.set(statement.name.text, statement);
    }
  }

  const importedErrorClasses = collectImportedErrorClasses(sourceFile, file, rootDir);
  const pendingImportedChecks = [];

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

    if (localClasses.has(className)) {
      const classDecl = localClasses.get(className);
      if (!classExtendsErrorLike(classDecl)) {
        addViolation(
          classDecl.name ?? classDecl,
          "local-error-must-extend-error",
          `Local error class "${className}" must extend Error or DomainError.`
        );
      }
      return;
    }

    if (importedErrorClasses.has(className)) {
      pendingImportedChecks.push({ node, className, resolvedPath: importedErrorClasses.get(className) });
      return;
    }

    addViolation(
      node,
      "throw-must-be-local-class",
      `Throw statement throws "${className}" which is neither defined in the same file nor imported from a domain/errors/*.error.ts file. VOs and Entities must define leaf validation errors locally, or import a DomainError subclass from their module's domain/errors/ directory.`
    );
  }

  function visit(node) {
    if (ts.isThrowStatement(node)) {
      checkThrowStatement(node);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return pendingImportedChecks;
}

async function verifyImportedErrorClass(check, violations, rootDir) {
  const { node, className, resolvedPath } = check;
  const resolvedRelPath = `${toPosixRelative(rootDir, resolvedPath)}.ts`;

  let source;
  try {
    source = await readFile(`${resolvedPath}.ts`, "utf8");
  } catch {
    violations.push({
      file: null,
      rule: "imported-error-unresolvable",
      reason: `Could not resolve imported error class "${className}" from "${resolvedRelPath}".`,
      location: null,
      node,
    });
    return;
  }

  const errorSourceFile = parseSource(source, resolvedRelPath);
  const classDecl = errorSourceFile.statements.find(
    (statement) => ts.isClassDeclaration(statement) && statement.name?.text === className
  );

  if (!classDecl || !classExtendsErrorLike(classDecl)) {
    violations.push({
      file: null,
      rule: "imported-error-must-extend-domain-error",
      reason: `Imported error class "${className}" (from "${resolvedRelPath}") must extend DomainError or Error.`,
      location: null,
      node,
    });
  }
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
    const pendingImportedChecks = checkSourceFile(sourceFile, file, violations, rootDir);

    for (const check of pendingImportedChecks) {
      const before = violations.length;
      await verifyImportedErrorClass(check, violations, rootDir);
      for (let i = before; i < violations.length; i++) {
        violations[i].file = file;
        violations[i].location = location(sourceFile, file, violations[i].node);
        delete violations[i].node;
      }
    }
  }

  return { violations, fileCount: targetFiles.length };
}

function location(sourceFile, file, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `${line + 1}:${character + 1}`;
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
