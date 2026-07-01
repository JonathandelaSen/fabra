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

Entities are built from Value Objects, so data-shape validation (negative numbers, empty strings, malformed IDs, etc.) belongs in the VO's constructor, not in the entity. An entity constructor should never re-validate a primitive that its VO already guarantees is valid.

Entity-level errors instead come from **domain actions**: a method on the entity that enforces a business rule at the moment something happens (e.g. "a user cannot upload more than 5 photos"). Define the custom error class in the entity's file and throw it from the action method.

### Example:

```typescript
import { AggregateRoot, UniqueId } from "@/backend/modules/shared";
import { UserAge } from "./user-age.value-object";
import { PhotoUrls } from "./photo-urls.value-object";

// 1. Define the custom error class locally, for a specific domain action
class MaxPhotosExceededError extends Error {
  constructor() {
    super("User cannot upload more than 5 photos");
    this.name = "MaxPhotosExceededError";
  }
}

export interface UserPrimitives {
  id: string;
  age: number;
  photoUrls: string[];
}

export class User extends AggregateRoot<UserPrimitives> {
  private constructor(
    private readonly id: UniqueId,
    private readonly age: UserAge,
    private photoUrls: PhotoUrls
  ) {
    super();
  }

  static fromPrimitives(primitives: UserPrimitives): User {
    return new User(
      UniqueId.fromPrimitives(primitives.id),
      UserAge.fromPrimitives(primitives.age),
      PhotoUrls.fromPrimitives(primitives.photoUrls)
    );
  }

  uploadPhoto(url: string): void {
    if (this.photoUrls.isAtMax()) {
      // 2. Throw the custom error class from the action that enforces the rule
      throw new MaxPhotosExceededError();
    }
    this.photoUrls = this.photoUrls.add(url);
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id.toPrimitives(),
      age: this.age.toPrimitives(),
      photoUrls: this.photoUrls.toPrimitives(),
    };
  }
}
```

Every field on the entity is a Value Object — `UniqueId`, `UserAge`, `PhotoUrls` — never a bare primitive. `UserAge` and `PhotoUrls` throw their own local errors (e.g. `UserAgeError`) from their constructors if built from invalid primitives, so the entity never re-checks `age < 0` or shape-validates the photo list itself — by the time `User` holds these VOs, they are guaranteed valid. `PhotoUrls` also stays immutable: `isAtMax()` is a pure query and `add(url)` returns a *new* `PhotoUrls` instance rather than mutating in place, which is why `uploadPhoto` reassigns `this.photoUrls` instead of pushing into an array. The entity's own error, `MaxPhotosExceededError`, models a business rule that only makes sense in the context of an action (`uploadPhoto`), not a data-shape constraint.

---

## Verification

This convention is statically enforced by the verification script [verify-ddd-errors-in-vos-and-entities.mjs](../../scripts/verify-ddd-errors-in-vos-and-entities.mjs), which is run automatically as part of:

```bash
npm run ddd:check
```

Any `throw` statement in a `*.value-object.ts` or `*.entity.ts` file that does not throw a locally defined custom error class extending `Error` or `DomainError` will cause the check to fail.
