import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const primitiveKeywordKinds = new Set([
  ts.SyntaxKind.StringKeyword,
  ts.SyntaxKind.NumberKeyword,
  ts.SyntaxKind.BooleanKeyword,
  ts.SyntaxKind.BigIntKeyword,
  ts.SyntaxKind.NullKeyword,
  ts.SyntaxKind.UndefinedKeyword,
  ts.SyntaxKind.VoidKeyword,
  // Opaque external payloads are not domain types; allow them at the boundary.
  ts.SyntaxKind.UnknownKeyword,
  ts.SyntaxKind.AnyKeyword,
]);

// Shared base value objects a concrete VO may extend instead of `ValueObject`.
// They already provide fromPrimitives/toPrimitives, so subclasses inherit them.
const baseValueObjects = ["ValueObject", "EntityId", "IsoDate", "OptionalIsoDate", "Timestamp", "UserId"];

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
  return (
    node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false
  );
}

function hasModifier(node, kind) {
  return node.modifiers?.some((modifier) => modifier.kind === kind) ?? false;
}

function hasHeritage(node, baseName) {
  return (
    node.heritageClauses?.some((clause) =>
      clause.types.some((type) => type.expression.getText() === baseName)
    ) ?? false
  );
}

function extendsAnyValueObject(node) {
  return baseValueObjects.some((base) => hasHeritage(node, base));
}

// A concrete VO that extends a shared base other than ValueObject inherits its
// constructor and toPrimitives, so those members are not required locally.
function extendsSharedBaseVo(node) {
  return baseValueObjects
    .filter((base) => base !== "ValueObject")
    .some((base) => hasHeritage(node, base));
}

function hasMethod(node, name, { isStatic = false } = {}) {
  return node.members.some(
    (member) =>
      ts.isMethodDeclaration(member) &&
      member.name?.getText() === name &&
      hasModifier(member, ts.SyntaxKind.StaticKeyword) === isStatic
  );
}

function getConstructor(node) {
  return node.members.find((member) => ts.isConstructorDeclaration(member));
}

function location(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile)
  );
  return `${line + 1}:${character + 1}`;
}

function addViolation(violations, file, rule, reason, sourceFile, node) {
  violations.push({
    file,
    rule,
    reason,
    location: sourceFile && node ? location(sourceFile, node) : null,
  });
}

// A *Primitives boundary shape may only use primitive types, literals, arrays,
// unions/intersections of those, inline object literals of those, and references
// to other *Primitives shapes. A reference to a named type (e.g. a VO union alias
// like `EvidenceSourceValue` or `ContextType`, or `Date`) means the boundary is
// leaking a non-primitive type and must be widened to its primitive (e.g.
// `string`). Returns the offending type text, or null when the type is allowed.
function findNonPrimitiveBoundaryType(typeNode) {
  if (!typeNode) return null;

  if (primitiveKeywordKinds.has(typeNode.kind)) return null;

  if (ts.isLiteralTypeNode(typeNode)) return null;

  if (ts.isParenthesizedTypeNode(typeNode)) {
    return findNonPrimitiveBoundaryType(typeNode.type);
  }

  if (ts.isArrayTypeNode(typeNode)) {
    return findNonPrimitiveBoundaryType(typeNode.elementType);
  }

  if (ts.isTupleTypeNode(typeNode)) {
    for (const element of typeNode.elements) {
      const offending = findNonPrimitiveBoundaryType(element);
      if (offending) return offending;
    }
    return null;
  }

  if (ts.isUnionTypeNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
    for (const childType of typeNode.types) {
      const offending = findNonPrimitiveBoundaryType(childType);
      if (offending) return offending;
    }
    return null;
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    for (const member of typeNode.members) {
      if (ts.isPropertySignature(member)) {
        const offending = findNonPrimitiveBoundaryType(member.type);
        if (offending) return offending;
      }
    }
    return null;
  }

  if (ts.isTypeReferenceNode(typeNode)) {
    const name = typeNode.typeName.getText();
    if (name.endsWith("Primitives")) return null;
    if (name === "Array" || name === "ReadonlyArray" || name === "Record") {
      for (const arg of typeNode.typeArguments ?? []) {
        const offending = findNonPrimitiveBoundaryType(arg);
        if (offending) return offending;
      }
      return null;
    }
    return name;
  }

  return typeNode.getText();
}

function getValueObjectTypeArgument(node) {
  for (const clause of node.heritageClauses ?? []) {
    for (const type of clause.types) {
      if (type.expression.getText() === "ValueObject") {
        return type.typeArguments?.[0] ?? null;
      }
    }
  }
  return null;
}

function collectTypeDeclarations(sourceFile) {
  const aliases = new Map();
  const interfaces = new Set();
  for (const statement of sourceFile.statements) {
    if (ts.isTypeAliasDeclaration(statement)) aliases.set(statement.name.text, statement.type);
    else if (ts.isInterfaceDeclaration(statement)) interfaces.add(statement.name.text);
  }
  return { aliases, interfaces };
}

// A simple VO wraps a single primitive value, so the composite rule must skip it.
// The ValueObject<T> argument is "primitive-like" when T resolves (through local
// type aliases) to a primitive, a literal, a string-enum union, or arrays/unions
// of those. A reference to an interface or object type is treated as composite.
function isPrimitiveLikeTypeNode(typeNode, decls, visited = new Set()) {
  if (!typeNode) return true;
  if (primitiveKeywordKinds.has(typeNode.kind)) return true;
  if (ts.isLiteralTypeNode(typeNode)) return true;
  if (ts.isIndexedAccessTypeNode(typeNode) || ts.isTypeQueryNode(typeNode)) return true;
  if (ts.isParenthesizedTypeNode(typeNode)) return isPrimitiveLikeTypeNode(typeNode.type, decls, visited);
  if (ts.isArrayTypeNode(typeNode)) return isPrimitiveLikeTypeNode(typeNode.elementType, decls, visited);
  if (ts.isTupleTypeNode(typeNode)) return typeNode.elements.every((element) => isPrimitiveLikeTypeNode(element, decls, visited));
  if (ts.isUnionTypeNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
    return typeNode.types.every((member) => isPrimitiveLikeTypeNode(member, decls, visited));
  }
  if (ts.isTypeReferenceNode(typeNode)) {
    const name = typeNode.typeName.getText();
    if (name === "Array" || name === "ReadonlyArray") {
      return (typeNode.typeArguments ?? []).every((arg) => isPrimitiveLikeTypeNode(arg, decls, visited));
    }
    if (decls.interfaces.has(name)) return false;
    if (decls.aliases.has(name)) {
      if (visited.has(name)) return false;
      visited.add(name);
      return isPrimitiveLikeTypeNode(decls.aliases.get(name), decls, visited);
    }
    return false;
  }
  return false;
}

function isNullishTypeNode(typeNode) {
  if (typeNode.kind === ts.SyntaxKind.NullKeyword) return true;
  if (typeNode.kind === ts.SyntaxKind.UndefinedKeyword) return true;
  return (
    ts.isLiteralTypeNode(typeNode) &&
    typeNode.literal.kind === ts.SyntaxKind.NullKeyword
  );
}

// A stored field is an acceptable VO reference when it is a named type (not a
// `*Primitives` boundary shape), optionally made nullable.
function isValueObjectFieldType(typeNode) {
  if (!typeNode) return false;
  if (ts.isParenthesizedTypeNode(typeNode)) return isValueObjectFieldType(typeNode.type);
  if (ts.isTypeOperatorNode(typeNode)) return isValueObjectFieldType(typeNode.type);
  if (ts.isArrayTypeNode(typeNode)) return isValueObjectFieldType(typeNode.elementType);
  if (ts.isUnionTypeNode(typeNode)) {
    const meaningful = typeNode.types.filter((member) => !isNullishTypeNode(member));
    return meaningful.length > 0 && meaningful.every(isValueObjectFieldType);
  }
  if (ts.isTypeReferenceNode(typeNode)) {
    const name = typeNode.typeName.getText();
    if (name === "Array" || name === "ReadonlyArray") {
      return (typeNode.typeArguments ?? []).every(isValueObjectFieldType);
    }
    return !name.endsWith("Primitives");
  }
  return false;
}

function getStoredFields(valueObject) {
  const fields = [];
  const constructor = getConstructor(valueObject);
  if (constructor) {
    for (const param of constructor.parameters) {
      const isParameterProperty = param.modifiers?.some(
        (modifier) =>
          modifier.kind === ts.SyntaxKind.PrivateKeyword ||
          modifier.kind === ts.SyntaxKind.ProtectedKeyword ||
          modifier.kind === ts.SyntaxKind.PublicKeyword ||
          modifier.kind === ts.SyntaxKind.ReadonlyKeyword
      );
      if (isParameterProperty) {
        fields.push({ name: param.name.getText(), type: param.type, node: param });
      }
    }
  }
  for (const member of valueObject.members) {
    if (ts.isPropertyDeclaration(member) && !hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
      fields.push({ name: member.name?.getText() ?? "", type: member.type, node: member });
    }
  }
  return fields;
}

// A composite VO must compose inner value objects, never store raw primitives or
// the whole `*Primitives` blob. See docs/architecture/value-objects.md.
function checkCompositeStoresValueObjects(sourceFile, file, valueObject, violations) {
  const typeArgument = getValueObjectTypeArgument(valueObject);
  if (!typeArgument) return;
  const decls = collectTypeDeclarations(sourceFile);
  if (isPrimitiveLikeTypeNode(typeArgument, decls)) return;

  for (const field of getStoredFields(valueObject)) {
    if (!isValueObjectFieldType(field.type)) {
      addViolation(
        violations,
        file,
        "value-object-composite-stores-primitive",
        `Composite value object ${valueObject.name.text} stores attribute "${field.name}" as a raw primitive or *Primitives blob. Each attribute of a composite VO must itself be a value object (see docs/architecture/value-objects.md).`,
        sourceFile,
        field.node
      );
    }
  }
}

function checkPrimitivesInterface(sourceFile, file, statement, violations) {
  for (const member of statement.members) {
    if (!ts.isPropertySignature(member)) continue;
    const offending = findNonPrimitiveBoundaryType(member.type);
    if (offending) {
      addViolation(
        violations,
        file,
        "value-object-primitives-non-primitive-field",
        `${statement.name.text}.${member.name.getText()} uses non-primitive boundary type "${offending}". A *Primitives shape must use plain primitives (e.g. string); let fromPrimitives narrow/validate.`,
        sourceFile,
        member
      );
    }
  }
}

function checkValueObjectClass(sourceFile, file, valueObject, violations) {
  const className = valueObject.name.text;
  const inheritsBase = extendsSharedBaseVo(valueObject);

  const constructor = getConstructor(valueObject);
  if (!constructor) {
    if (!inheritsBase) {
      addViolation(
        violations,
        file,
        "value-object-constructor-missing",
        `Value object ${className} must declare a private or protected constructor.`,
        sourceFile,
        valueObject.name
      );
    }
  } else if (
    !hasModifier(constructor, ts.SyntaxKind.PrivateKeyword) &&
    !hasModifier(constructor, ts.SyntaxKind.ProtectedKeyword)
  ) {
    addViolation(
      violations,
      file,
      "value-object-constructor-public",
      `Value object ${className} constructor must be private or protected.`,
      sourceFile,
      constructor
    );
  }

  if (!hasMethod(valueObject, "fromPrimitives", { isStatic: true })) {
    addViolation(
      violations,
      file,
      "value-object-from-primitives-missing",
      `Value object ${className} must define static fromPrimitives(...).`,
      sourceFile,
      valueObject.name
    );
  }

  if (!hasMethod(valueObject, "toPrimitives") && !inheritsBase) {
    addViolation(
      violations,
      file,
      "value-object-to-primitives-missing",
      `Value object ${className} must define toPrimitives().`,
      sourceFile,
      valueObject.name
    );
  }

  for (const member of valueObject.members) {
    if (ts.isMethodDeclaration(member) && !hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
      const methodName = member.name?.getText() ?? "";
      if (/^(set|update|change|mark|save)([A-Z]|$)/.test(methodName) || /^delete([A-Z]|$)/.test(methodName)) {
        addViolation(
          violations,
          file,
          "value-object-mutator-method",
          `Value object ${className} must be immutable; mutator-like method "${methodName}" is not allowed.`,
          sourceFile,
          member.name
        );
      }
    }

    if (ts.isPropertyDeclaration(member)) {
      const isPrivate = hasModifier(member, ts.SyntaxKind.PrivateKeyword);
      const isProtected = hasModifier(member, ts.SyntaxKind.ProtectedKeyword);
      const isReadonly = hasModifier(member, ts.SyntaxKind.ReadonlyKeyword);
      if (!isPrivate && !isProtected && !isReadonly) {
        addViolation(
          violations,
          file,
          "value-object-public-mutable-property",
          `Value object ${className} cannot expose public mutable properties.`,
          sourceFile,
          member.name
        );
      }
    }
  }

  checkCompositeStoresValueObjects(sourceFile, file, valueObject, violations);
}

function checkValueObjectFile(sourceFile, file, violations) {
  const valueObjects = sourceFile.statements.filter(
    (statement) =>
      ts.isClassDeclaration(statement) &&
      statement.name &&
      isExported(statement) &&
      extendsAnyValueObject(statement)
  );

  if (valueObjects.length === 0) {
    addViolation(
      violations,
      file,
      "value-object-must-extend-value-object",
      "Every *.value-object.ts file must export a class extending ValueObject.",
      sourceFile,
      sourceFile
    );
    return;
  }

  for (const valueObject of valueObjects) {
    checkValueObjectClass(sourceFile, file, valueObject, violations);
  }

  for (const statement of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(statement) && statement.name.text.endsWith("Primitives")) {
      checkPrimitivesInterface(sourceFile, file, statement, violations);
    }
  }
}

export async function findValueObjectViolations({ rootDir = repoRoot } = {}) {
  const modulesDir = path.join(rootDir, "src/modules");
  const files = (await walkFiles(modulesDir))
    .map((filePath) => toPosixRelative(rootDir, filePath))
    .filter(
      (file) =>
        file.includes("/domain/value-objects/") &&
        file.endsWith(".value-object.ts") &&
        !file.endsWith(".test.ts")
    )
    .sort();

  const violations = [];
  for (const file of files) {
    const source = await readFile(path.join(rootDir, file), "utf8");
    const sourceFile = parseSource(source, file);
    checkValueObjectFile(sourceFile, file, violations);
  }

  return { violations, fileCount: files.length };
}

export function formatValueObjectViolations(violations) {
  if (violations.length === 0) return "";

  return [
    "Value object violations:",
    ...violations.map((violation) => {
      const location = violation.location ? `:${violation.location}` : "";
      return `- ${violation.file}${location} (${violation.rule}): ${violation.reason}`;
    }),
  ].join("\n");
}

async function main() {
  const { violations, fileCount } = await findValueObjectViolations();

  if (violations.length > 0) {
    console.error(formatValueObjectViolations(violations));
    process.exitCode = 1;
    return;
  }

  console.log(`Value object check passed (${fileCount} value objects).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
