# Value objects

This document is the implementation reference for value objects (VOs) in the
DDD modules under `src/modules/`. It complements the rules in `AGENTS.md` with
concrete patterns and canonical examples.

## Core rules

- One VO per file, named `*.value-object.ts`, with a colocated `*.value-object.test.ts`.
- VOs are immutable: private/protected state, `private`/`protected` constructor,
  no mutating methods.
- Conversion happens only through `static fromPrimitives(...)` and `toPrimitives()`.
- Validation lives in `fromPrimitives` (or the constructor). An invalid VO must
  never be constructible.
- Shared concerns (`EntityId`, `IsoDate`, `OptionalIsoDate`, `Timestamp`,
  `UserId`, `Counter`, `AiProvider`, …) live in
  `src/modules/shared/domain/value-objects/` and are reused, not redefined.

## Simple value objects

A simple VO wraps a single primitive. It extends `ValueObject<Primitive>` and
validates that primitive.

Canonical example: [`evidence-content.value-object.ts`](../../src/modules/performance-review/domain/value-objects/evidence-content.value-object.ts).

```ts
export class EvidenceContent extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): EvidenceContent {
    const trimmed = value.trim();
    if (!trimmed)
      throw new DomainError(
        ErrorCode.VALIDATION_FAILED,
        "Evidence content cannot be empty.",
      );
    return new EvidenceContent(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
```

## Composite value objects

A composite VO groups several related values. **Its attributes must themselves be
value objects, not raw primitives.** A composite VO never stores `string`,
`number`, `boolean`, or `null` fields directly — each field is a simple VO that
owns its own validation. The composite's job is only to assemble those VOs and
expose primitive accessors at the boundary.

Canonical example: [`context-suggestion.value-object.ts`](../../src/modules/work-journal/domain/value-objects/context-suggestion.value-object.ts).

### Anatomy

1. **`*Primitives` interface** — the camelCase boundary shape, expressed in
   primitives. This is what `fromPrimitives` consumes and `toPrimitives` returns.
2. **Private constructor taking inner VOs** — one constructor parameter per
   composing VO, each strongly typed as the VO class. No primitive fields are
   stored.
3. **`fromPrimitives(primitives)`** — delegates each field to the corresponding
   VO's `fromPrimitives`. Each inner VO enforces its own invariant, so the
   composite gets validation for free.
4. **Primitive getters** — each getter returns `this.<innerVo>.toPrimitives()`,
   so consumers read primitives without touching the inner VOs.
5. **`toPrimitives()`** — rebuilds the `*Primitives` object by calling
   `toPrimitives()` on each inner VO. Be consistent: every field goes through its
   VO's `toPrimitives()`, never a mix of inner VOs for some fields and raw stored
   values for others.

```ts
import { ValueObject } from "@/modules/shared";
import { WorkJournalContextName } from "./work-journal-context-name.value-object";
import {
  type ContextType,
  WorkJournalContextType,
} from "./work-journal-context-type.value-object";
import { WorkJournalIsCurrent } from "./work-journal-is-current.value-object";
import { WorkJournalRoleOrLabel } from "./work-journal-role-or-label.value-object";
import {
  type SuggestionSource,
  WorkJournalSuggestionSource,
} from "./work-journal-suggestion-source.value-object";

export interface WorkJournalContextSuggestionPrimitives {
  type: string;
  name: string;
  roleOrLabel: string | null;
  isCurrent: boolean;
  source: string;
}

export class WorkJournalContextSuggestion extends ValueObject<WorkJournalContextSuggestionPrimitives> {
  private constructor(
    private readonly contextType: WorkJournalContextType,
    private readonly contextName: WorkJournalContextName,
    private readonly contextRoleOrLabel: WorkJournalRoleOrLabel,
    private readonly contextIsCurrent: WorkJournalIsCurrent,
    private readonly contextSource: WorkJournalSuggestionSource,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: WorkJournalContextSuggestionPrimitives,
  ): WorkJournalContextSuggestion {
    return new WorkJournalContextSuggestion(
      WorkJournalContextType.fromPrimitives(primitives.type),
      WorkJournalContextName.fromPrimitives(primitives.name),
      WorkJournalRoleOrLabel.fromPrimitives(primitives.roleOrLabel),
      WorkJournalIsCurrent.fromPrimitives(primitives.isCurrent),
      WorkJournalSuggestionSource.fromPrimitives(primitives.source),
    );
  }

  get type(): ContextType {
    return this.contextType.toPrimitives();
  }

  get name(): string {
    return this.contextName.toPrimitives();
  }

  get roleOrLabel(): string | null {
    return this.contextRoleOrLabel.toPrimitives();
  }

  get isCurrent(): boolean {
    return this.contextIsCurrent.toPrimitives();
  }

  toPrimitives(): WorkJournalContextSuggestionPrimitives {
    return {
      type: this.contextType.toPrimitives(),
      name: this.contextName.toPrimitives(),
      roleOrLabel: this.contextRoleOrLabel.toPrimitives(),
      isCurrent: this.contextIsCurrent.toPrimitives(),
      source: this.contextSource.toPrimitives(),
    };
  }
}
```

### Reuse shared VOs for generic fields

Do not write a bespoke VO for a concern that already has a shared one. IDs,
dates, timestamps, user ids, and counters belong to
`src/modules/shared/domain/value-objects/`. A composite VO composes those shared
VOs alongside its module-specific VOs.

Example: [`evidence-candidate.value-object.ts`](../../src/modules/performance-review/domain/value-objects/evidence-candidate.value-object.ts)
composes the module's `EvidenceSource` and `EvidenceContent` together with the
shared `EntityId` (for the source id) and `OptionalIsoDate` (for a nullable
date), instead of storing `string`/`string | null` fields directly.

### Anti-pattern

Do **not** store primitives in a composite VO, even if you validate them inline:

```ts
// WRONG: attributes are raw primitives, validation is ad hoc, inner concepts
// have no reusable home.
export class EvidenceCandidate extends ValueObject<EvidenceCandidatePrimitives> {
  private constructor(private readonly state: EvidenceCandidatePrimitives) {
    super();
  }

  static fromPrimitives(primitives: EvidenceCandidatePrimitives) {
    const sourceId = primitives.sourceId.trim();
    if (!sourceId) throw new Error("…");
    return new EvidenceCandidate({ ...primitives, sourceId });
  }
}
```

Each field there (`sourceId`, `date`, `content`, `source`) should be its own VO so
the invariant lives in one place and can be reused.

## Testing

Every VO has a colocated `*.value-object.test.ts` covering `fromPrimitives`,
`toPrimitives` (round-trip), validation/rejection cases, and any domain methods.
For composite VOs, also assert that the primitive getters return the expected
values after construction.

## Enforcement

`scripts/verify-ddd-value-objects.mjs` (run as part of `npm run ddd:check` and
`npm run agent:check`) statically verifies every `*.value-object.ts` in all
modules:

- the file exports a class extending `ValueObject` (or a shared base VO such as
  `EntityId` / `IsoDate`);
- the constructor is private/protected, with `static fromPrimitives(...)` and
  `toPrimitives()`;
- no mutator methods and no public mutable properties;
- `*Primitives` interfaces use plain primitives only — a field typed as a VO
  union alias or a domain/`Date` type is rejected and must be widened to its
  primitive.
