# How to Define Errors in Value Objects and Entities

In this codebase, Value Objects (VOs) and Entities must **never** throw a bare `Error` or a bare `DomainError` directly. Both always throw a custom class that **extends `DomainError`**, registers its **own specific `ErrorCode`** (never a generic shared code), and carries useful structured metadata (the invalid value, the ids/counts involved) as its `details` payload. Class names follow an `Invalid*Error` convention for VO validation failures (e.g. `InvalidEvalLatencyMsError`, `InvalidSuggestionSourceError`). What differs between VOs and Entities is **where the class lives**:

1. **Leaf validation errors** (a VO's constructor rejecting a malformed primitive) throw a custom `DomainError` subclass defined **locally in the same file** as the VO, with its own specific `ErrorCode` (e.g. `INVALID_EVAL_LATENCY_MS`) registered following [how to create a domain error](./how-to-create-a-domain-error.md).
2. **Business-rule errors** (an entity action enforcing an invariant, e.g. "a user cannot upload more than 5 photos") throw a `DomainError` subclass defined in its own file under the module's `domain/errors/` directory and imported into the entity, with its own specific registered `ErrorCode` and translated copy, following the same guide.

## Why This Split?

1. **Locality of Reference**: VO validation logic and its error are kept together in a single file, making it easy to understand the invariant at the point it's enforced.
2. **Specific, traceable errors**: Every VO and entity error gets its own `ErrorCode` and translated message — never a generic shared code — so Sentry, logs, and the frontend can distinguish exactly which invariant failed instead of lumping every validation failure under one bucket.
3. **Business rules live with the entity, not the VO**: Entity action errors model something that happens during a domain action (`uploadPhoto`), not a data-shape constraint, so they get their own file under `domain/errors/` — discoverable and reusable — instead of being colocated with a single VO's constructor.
4. **Specific Error Handling**: Calling code can catch a specific class and handle it differently than a generic runtime or infrastructure failure, and every thrown error carries the structured `details` useful for debugging in Sentry/logs.

---

## Error Convention for Value Objects

Register a specific `ErrorCode` for the VO's failure, add its English/Spanish error message, then define a custom error class extending `DomainError` at the top of the VO's file, named `Invalid<Vo>Error`, passing the rejected value as `details`. Throw it inside the validator/constructor. This is Steps 1, 2, and 3 of [how to create a domain error](./how-to-create-a-domain-error.md) — do not skip the message step even though the error class lives locally in the VO file instead of `domain/errors/`.

### Canonical Example:

`error-codes.ts`:

```typescript
export const ErrorCode = {
  // ...
  INVALID_EVAL_LATENCY_MS: "INVALID_EVAL_LATENCY_MS",
} as const;
```

`messages.ts` (English and Spanish):

```typescript
    errors: {
      // ...
      INVALID_EVAL_LATENCY_MS: "Latency must be zero or greater.",
    }
```

```typescript
    errors: {
      // ...
      INVALID_EVAL_LATENCY_MS: "La latencia debe ser cero o mayor.",
    }
```

`eval-latency-ms.value-object.ts`:

```typescript
import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

// 4. Define the custom error class locally, extending DomainError, with its own specific ErrorCode
class InvalidEvalLatencyMsError extends DomainError {
  constructor(value: number) {
    super(ErrorCode.INVALID_EVAL_LATENCY_MS, `Latency cannot be negative: ${value}`, { value });
    this.name = "InvalidEvalLatencyMsError";
  }
}

const MIN_LATENCY = 0;

// 5. Export the Value Object class
export class EvalLatencyMs extends ValueObject<number> {
  private constructor(private readonly value: number) {
    super();
    if (!Number.isFinite(value) || value < MIN_LATENCY) {
      // 6. Throw the custom error class, passing the invalid value along
      throw new InvalidEvalLatencyMsError(value);
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

`MaxPhotosExceededError` models a business rule that only makes sense in the context of an action (`uploadPhoto`), not a data-shape constraint — that's why it lives in its own file under `domain/errors/`, imported into the entity, instead of being declared inline like a VO's leaf validation error. Both still register their own specific `ErrorCode` (`USER_MAX_PHOTOS_EXCEEDED` vs. `INVALID_EVAL_LATENCY_MS`) — only the file location differs.

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
