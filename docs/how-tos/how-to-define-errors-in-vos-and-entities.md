# How to Define Errors in Value Objects and Entities

In this codebase, Value Objects (VOs) and Entities must **never** throw a bare `Error` or a bare `DomainError` directly. Both always throw a custom class that **extends `DomainError`** and carries useful structured metadata (the invalid value, the ids/counts involved) as its `details` payload. What differs is *which* `ErrorCode` they use and *where* the class lives:

1. **Leaf validation errors** (a VO's constructor rejecting a malformed primitive) throw a custom `DomainError` subclass defined **locally in the same file**, reusing the shared generic `ErrorCode.VALIDATION_FAILED` — no new registry entry needed, since the failure is a data-shape detail with no product-specific copy.
2. **Business-rule errors** (an entity action enforcing an invariant, e.g. "a user cannot upload more than 5 photos") throw a `DomainError` subclass defined in its own file under the module's `domain/errors/` directory and imported into the entity, with its **own registered `ErrorCode`** and translated copy, following [how to create a domain error](./how-to-create-a-domain-error.md).

## Why This Split?

1. **Locality of Reference**: VO validation logic and its error are kept together in a single file, making it easy to understand the invariant at the point it's enforced.
2. **Clean Error Registry**: Leaf VO errors reuse the shared generic `ErrorCode.VALIDATION_FAILED` instead of registering a bespoke code per VO — the invalid value goes in `details` instead of in a new translated message.
3. **Business rules need their own copy**: Entity action errors are meaningful product events that cross the API boundary (they need a specific `ErrorCode`, an HTTP status via `handleApiError`, and translated user-facing copy), so they get their own registered `DomainError` subclass like any other domain error.
4. **Specific Error Handling**: Either way, calling code can catch a specific class and handle it differently than a generic runtime or infrastructure failure, and every thrown error carries the structured `details` useful for debugging in Sentry/logs.

---

## Error Convention for Value Objects

Define a custom error class extending `DomainError` at the top of the file, using the shared generic `ErrorCode.VALIDATION_FAILED` and passing the rejected value as `details`, then throw it inside the validator/constructor.

### Canonical Example:

```typescript
import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

// 1. Define the custom error class locally, extending DomainError
class EvalLatencyMsError extends DomainError {
  constructor(value: number) {
    super(ErrorCode.VALIDATION_FAILED, `Latency cannot be negative: ${value}`, { value });
    this.name = "EvalLatencyMsError";
  }
}

const MIN_LATENCY = 0;

// 2. Export the Value Object class
export class EvalLatencyMs extends ValueObject<number> {
  private constructor(private readonly value: number) {
    super();
    if (!Number.isFinite(value) || value < MIN_LATENCY) {
      // 3. Throw the custom error class, passing the invalid value along
      throw new EvalLatencyMsError(value);
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

Entity-level errors instead come from **domain actions**: a method on the entity that enforces a business rule at the moment something happens (e.g. "a user cannot upload more than 5 photos"). This is a real `DomainError`, not a leaf VO validation error, so it follows [how to create a domain error](./how-to-create-a-domain-error.md): registered in `ErrorCode`, translated in `messages.ts`, defined in its own file under `domain/errors/`, and thrown with useful structured metadata.

### Step 1: Define the error in its own file

`src/backend/modules/<module>/domain/errors/max-photos-exceeded.error.ts`:

```typescript
import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class MaxPhotosExceededError extends DomainError {
  constructor(userId: string, currentCount: number, maxAllowed: number) {
    super(
      ErrorCode.USER_MAX_PHOTOS_EXCEEDED,
      `User ${userId} attempted to exceed max photo count (${currentCount}/${maxAllowed})`,
      { userId, currentCount, maxAllowed },
    );
    this.name = "MaxPhotosExceededError";
  }
}
```

The third argument to `super(...)` is the structured `data` payload — pass whatever is useful for debugging the failure in Sentry/logs (the ids and counts involved), not just a static string.

### Step 2: Import and throw it from the entity action

```typescript
import { AggregateRoot, UniqueId } from "@/backend/modules/shared";
import { UserAge } from "./user-age.value-object";
import { PhotoUrls } from "./photo-urls.value-object";
import { MaxPhotosExceededError } from "../errors/max-photos-exceeded.error";

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
      throw new MaxPhotosExceededError(this.id.toPrimitives(), this.photoUrls.count(), PhotoUrls.MAX);
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

Every field on the entity is a Value Object — `UniqueId`, `UserAge`, `PhotoUrls` — never a bare primitive. `UserAge` and `PhotoUrls` throw their own local errors (e.g. `UserAgeError`) from their constructors if built from invalid primitives, so the entity never re-checks `age < 0` or shape-validates the photo list itself — by the time `User` holds these VOs, they are guaranteed valid. `PhotoUrls` also stays immutable: `isAtMax()` is a pure query and `add(url)` returns a *new* `PhotoUrls` instance rather than mutating in place, which is why `uploadPhoto` reassigns `this.photoUrls` instead of pushing into an array.

`MaxPhotosExceededError` models a business rule that only makes sense in the context of an action (`uploadPhoto`), not a data-shape constraint — that's why it gets its own registered `ErrorCode` and file under `domain/errors/`, imported into the entity, instead of reusing the generic `ErrorCode.VALIDATION_FAILED` declared inline like a VO's leaf validation error.

---

## Verification

This convention is statically enforced by the verification script [verify-ddd-errors-in-vos-and-entities.mjs](../../scripts/verify-ddd-errors-in-vos-and-entities.mjs), which is run automatically as part of:

```bash
npm run ddd:check
```

A `throw` statement in a `*.value-object.ts` or `*.entity.ts` file passes the check only if it throws either:

- a custom error class declared in the same file (extending `Error` or `DomainError`), or
- a `DomainError` subclass imported from a `domain/errors/*.error.ts` file in the same module.

Throwing a bare `Error`/`DomainError` directly, or a class that doesn't extend either, fails the check either way.
