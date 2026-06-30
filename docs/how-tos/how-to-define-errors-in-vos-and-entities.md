# How to Define Errors in Value Objects and Entities

In this codebase, Value Objects (VOs) and Entities must **never** throw generic `Error` or `DomainError` directly. Instead, they must always throw a custom error class defined locally in the same file.

## Why Define Errors Locally?

1. **Locality of Reference**: Validation logic and its associated errors are kept together in a single file, making it easy to understand the invariants.
2. **Clean Error Registry**: Avoids polluting the global `ErrorCode` registry with leaf-level validation details that are only relevant within a single VO or Entity.
3. **Specific Error Handling**: Allows calling code to catch specific validation errors and handle them differently than general runtime or infrastructure failures.

---

## Error Convention for Value Objects

Define a custom error class extending `Error` at the top of the file, then throw it inside the validator/constructor.

### Canonical Example:

```typescript
import { ValueObject } from "@/backend/modules/shared";

// 1. Define the custom error class locally
class EvalLatencyMsError extends Error {
  constructor() {
    super("Latency cannot be negative.");
    this.name = "EvalLatencyMsError";
  }
}

const MIN_LATENCY = 0;

// 2. Export the Value Object class
export class EvalLatencyMs extends ValueObject<number> {
  private constructor(private readonly value: number) {
    super();
    if (!Number.isFinite(value) || value < MIN_LATENCY) {
      // 3. Throw the custom error class
      throw new EvalLatencyMsError();
    }
  }

  static fromPrimitives(value: number): EvalLatencyMs {
    return new EvalLatencyMs(value);
  }

  toPrimitives(): number {
    return this.value;
  }
}
```

---

## Error Convention for Entities

Similarly, Entities must define and throw local custom error classes rather than throwing generic errors.

### Example:

```typescript
import { AggregateRoot } from "@/backend/modules/shared";

// 1. Define the custom error class locally
class UserAgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserAgeError";
  }
}

export interface UserPrimitives {
  id: string;
  age: number;
}

export class User extends AggregateRoot<UserPrimitives> {
  private constructor(
    private readonly id: string,
    private readonly age: number
  ) {
    super();
    if (age < 0) {
      // 2. Throw the custom error class
      throw new UserAgeError("Age cannot be negative");
    }
  }

  static fromPrimitives(primitives: UserPrimitives): User {
    return new User(primitives.id, primitives.age);
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id,
      age: this.age,
    };
  }
}
```

---

## Verification

This convention is statically enforced by the verification script [verify-ddd-errors-in-vos-and-entities.mjs](../../scripts/verify-ddd-errors-in-vos-and-entities.mjs), which is run automatically as part of:

```bash
npm run ddd:check
```

Any `throw` statement in a `*.value-object.ts` or `*.entity.ts` file that does not throw a locally defined custom error class extending `Error` or `DomainError` will cause the check to fail.
