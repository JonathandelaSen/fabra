import { ESLint } from "eslint";

const RULE_ID = "local/no-hardcoded-string-contracts";
const eslint = new ESLint();
const results = await eslint.lintFiles(["src"]);

// Temporary migration runner. Once this reaches zero warnings, delete this
// script and the lint:string-contracts package script, promote the ESLint rule
// to "error", and let the regular agent:check lint step enforce it.
const warnings = results.flatMap((result) =>
  result.messages
    .filter((message) => message.ruleId === RULE_ID)
    .map((message) => ({
      filePath: result.filePath,
      line: message.line,
      column: message.column,
      message: message.message,
    })),
);

for (const warning of warnings) {
  const filePath = warning.filePath.replace(`${process.cwd()}/`, "");
  console.log(`${filePath}:${warning.line}:${warning.column} warning ${warning.message}`);
}

console.log(`\n${warnings.length} string contract warning${warnings.length === 1 ? "" : "s"}.`);

if (warnings.length === 0) {
  console.log(
    "Migration complete: remove lint:string-contracts, promote the rule to error, and enforce it through agent:check.",
  );
}
