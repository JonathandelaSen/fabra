import type { Telemetry } from "../../application/telemetry/telemetry";

type Executable = {
  execute: (...args: never[]) => Promise<unknown>;
};

type Instrumented<T> = {
  [K in keyof T]: T[K];
};

function isExecutable(value: unknown): value is Executable {
  return (
    typeof value === "object" &&
    value !== null &&
    "execute" in value &&
    typeof value.execute === "function"
  );
}

export function instrumentUseCases<T extends Record<string, unknown>>(
  moduleName: string,
  useCases: T,
  telemetry: Telemetry,
): Instrumented<T> {
  return Object.fromEntries(
    Object.entries(useCases).map(([useCaseName, useCase]) => {
      if (!isExecutable(useCase)) return [useCaseName, useCase];

      const instrumented = Object.create(Object.getPrototypeOf(useCase));
      Object.assign(instrumented, useCase);
      instrumented.execute = (...args: never[]) =>
        telemetry.trace(
          {
            name: `use_case ${moduleName}.${useCaseName}`,
            operation: "use_case.execute",
            attributes: {
              "fabra.layer": "application",
              "fabra.module": moduleName,
              "fabra.use_case": useCaseName,
            },
          },
          () => useCase.execute(...args),
        );

      return [useCaseName, instrumented];
    }),
  ) as Instrumented<T>;
}
