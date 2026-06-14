import { spawn } from "node:child_process";

const checks = [
  {
    name: "API controllers",
    command: "npm",
    args: ["run", "api:check", "--silent"],
    successSummary: "API controller architecture checks passed.",
  },
  {
    name: "architecture",
    command: "npm",
    args: ["run", "ddd:check", "--silent"],
    successSummary: "DDD, frontend boundaries, query bus, and AI DI checks passed.",
  },
  {
    name: "frontend tests",
    command: "npm",
    args: ["run", "test:frontend", "--silent", "--", "--run"],
    successSummary: "Frontend component and hook tests passed.",
  },
  {
    name: "build",
    command: "npm",
    args: ["run", "build", "--silent"],
    successSummary: "Next.js production build passed.",
  },
];

function runCheck({ command, args }) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      resolve({
        code: 1,
        stdout,
        stderr: `${stderr}${error.stack ?? error.message}`,
      });
    });

    child.on("close", (code) => {
      resolve({
        code: code ?? 1,
        stdout,
        stderr,
      });
    });
  });
}

function printFailureOutput({ stdout, stderr }) {
  if (stdout.trim()) {
    console.error(stdout.trimEnd());
  }

  if (stderr.trim()) {
    console.error(stderr.trimEnd());
  }
}

for (const check of checks) {
  process.stdout.write(`agent:check ${check.name} ... `);
  const result = await runCheck(check);

  if (result.code === 0) {
    console.log(`ok. ${check.successSummary}`);
    continue;
  }

  console.error(`failed.`);
  console.error(`\n${check.name} output:`);
  printFailureOutput(result);
  process.exitCode = result.code;
  break;
}

if (!process.exitCode) {
  console.log("agent:check passed.");
}
