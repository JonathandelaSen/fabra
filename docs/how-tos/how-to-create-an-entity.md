# How to Create an Entity

In this codebase, every domain entity is an **aggregate root**. It owns an
identity and domain behavior, stores its state as Value Objects, and exposes
plain camelCase data only through `fromPrimitives(...)` and `toPrimitives()`.

Use an entity when the concept has its own identity and lifecycle. If a concept
only validates or describes a value, create a Value Object instead. The
canonical full example is
[WorkJournalEntry](../../src/backend/modules/work-journal/domain/entities/journal-entry.entity.ts).

## Required Files

For an entity named `Project` in `my-module`, the complete example structure is:

```text
src/backend/modules/my-module/domain/
  entities/
    project.entity.ts
    project.entity.test.ts
  errors/
    project-name-unchanged.error.ts
  events/
    project-created.event.ts
    project-deleted.event.ts
    project-renamed.event.ts
  repositories/
    project.repository.ts
  value-objects/
    project-id.value-object.ts
    project-id.value-object.test.ts
    project-name.value-object.ts
    project-name.value-object.test.ts
```

The example records created, renamed, and deleted events. It also rejects a
rename that would leave the name unchanged with a custom domain error.

## Step 1: Create or Reuse the Value Objects

Every field held by an entity must be backed by a Value Object. Reuse shared
Value Objects such as `UserId`, `IsoDate`, `OptionalIsoDate`, and `Timestamp`
from `@/backend/modules/shared`.

Create a module-specific ID by extending `EntityId`:

```typescript
import { EntityId } from "@/backend/modules/shared";

export class ProjectId extends EntityId {
  private constructor(value: string) {
    super(value, "Project id");
  }

  static fromPrimitives(value: string): ProjectId {
    return new ProjectId(value);
  }
}
```

Create one `*.value-object.ts` file for each additional domain value. Value
Objects must be immutable and provide `static fromPrimitives(...)` and
`toPrimitives()`. See
[Value Objects](../architecture/value-objects.md) and
[How to Define Errors in Value Objects and Entities](./how-to-define-errors-in-vos-and-entities.md).

Do not keep raw strings, numbers, arrays, `Date` instances, or primitive object
blobs in the entity. Collections and composite values also need Value Objects.

Every Value Object needs a colocated test. For the ID, verify valid
construction, primitive round-trip serialization, and inherited empty-value
validation:

```typescript
import { describe, expect, it } from "vitest";
import { ProjectId } from "./project-id.value-object";

describe("ProjectId", () => {
  it("creates and serializes a project id", () => {
    expect(ProjectId.fromPrimitives("project-1").toPrimitives()).toBe(
      "project-1",
    );
  });

  it("rejects an empty project id", () => {
    expect(() => ProjectId.fromPrimitives(" ")).toThrow();
  });
});
```

Test the name's primitive round trip and rejected invariants in
`project-name.value-object.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { ProjectName } from "./project-name.value-object";

describe("ProjectName", () => {
  it("creates and serializes a project name", () => {
    expect(ProjectName.fromPrimitives("Launch").toPrimitives()).toBe(
      "Launch",
    );
  });

  it("rejects an empty project name", () => {
    expect(() => ProjectName.fromPrimitives(" ")).toThrow();
  });
});
```

Add cases for every other boundary and invariant enforced by the Value Object.

## Step 2: Define the Boundary and Creation Types

Define the interfaces beside the entity. Their names must match the entity
class exactly:

```typescript
export interface ProjectPrimitives {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateParams {
  id: ProjectId;
  userId: UserIdType;
  name: ProjectName;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

`ProjectPrimitives` is boundary data used for hydration and serialization, so
it contains plain camelCase primitives. `ProjectCreateParams` is domain input,
so it contains Value Objects. It must include an `id` Value Object.

Do not use Value Objects, domain aliases, or `Date` in a `*Primitives`
interface. Do not pass API DTOs or database rows into the entity.

## Step 3: Implement the Aggregate Root

Create `domain/entities/project.entity.ts`:

```typescript
import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/backend/modules/shared";
import { ProjectNameUnchangedError } from "../errors/project-name-unchanged.error";
import { ProjectCreatedEvent } from "../events/project-created.event";
import { ProjectDeletedEvent } from "../events/project-deleted.event";
import { ProjectRenamedEvent } from "../events/project-renamed.event";
import { ProjectId } from "../value-objects/project-id.value-object";
import { ProjectName } from "../value-objects/project-name.value-object";

export interface ProjectPrimitives {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateParams {
  id: ProjectId;
  userId: UserIdType;
  name: ProjectName;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class Project extends AggregateRoot {
  private constructor(
    private readonly projectId: ProjectId,
    private readonly ownerId: UserIdType,
    private projectName: ProjectName,
    private readonly projectCreatedAt: Timestamp,
    private projectUpdatedAt: Timestamp,
  ) {
    super();
  }

  static create(params: ProjectCreateParams): Project {
    const project = new Project(
      params.id,
      params.userId,
      params.name,
      params.createdAt,
      params.updatedAt,
    );

    project.recordDomainEvent(new ProjectCreatedEvent(project.id));
    return project;
  }

  static fromPrimitives(primitives: ProjectPrimitives): Project {
    return new Project(
      ProjectId.fromPrimitives(primitives.id),
      UserId.fromPrimitives(primitives.userId),
      ProjectName.fromPrimitives(primitives.name),
      Timestamp.fromPrimitives(primitives.createdAt),
      Timestamp.fromPrimitives(primitives.updatedAt),
    );
  }

  get id(): string {
    return this.projectId.toPrimitives();
  }

  get userId(): string {
    return this.ownerId.toPrimitives();
  }

  get idValue(): ProjectId {
    return this.projectId;
  }

  rename(name: ProjectName, updatedAt: Timestamp): void {
    if (this.projectName.equals(name)) {
      throw new ProjectNameUnchangedError(this.id, name.toPrimitives());
    }

    this.projectName = name;
    this.projectUpdatedAt = updatedAt;
    this.recordDomainEvent(new ProjectRenamedEvent(this.id));
  }

  delete(updatedAt: Timestamp): void {
    this.projectUpdatedAt = updatedAt;
    this.recordDomainEvent(new ProjectDeletedEvent(this.id));
  }

  toPrimitives(): ProjectPrimitives {
    return {
      id: this.projectId.toPrimitives(),
      userId: this.ownerId.toPrimitives(),
      name: this.projectName.toPrimitives(),
      createdAt: this.projectCreatedAt.toPrimitives(),
      updatedAt: this.projectUpdatedAt.toPrimitives(),
    };
  }
}
```

The three construction paths have different responsibilities:

- The private constructor receives only Value Objects and records no events.
- `create(...)` builds a new aggregate and records the creation event.
- `fromPrimitives(...)` hydrates existing state and must not record events.

Every field returned by `toPrimitives()` must call an inner Value Object's
`toPrimitives()` method. The DDD verifier checks this statically.

## Step 4: Add Domain Behavior

Put state changes and business rules on the entity instead of exposing setters.
Domain methods receive Value Objects, update the aggregate, and record an event
when domain behavior occurred.

Do not repeat shape validation already guaranteed by a Value Object. If an
action enforces a business rule, throw a specific `DomainError` subclass from
the module's `domain/errors/` directory. Follow
[How to Create a Domain Error](./how-to-create-a-domain-error.md).

In the example, `rename(...)` rejects a no-op with a custom domain error:

```typescript
rename(name: ProjectName, updatedAt: Timestamp): void {
  if (this.projectName.equals(name)) {
    throw new ProjectNameUnchangedError(this.id, name.toPrimitives());
  }

  this.projectName = name;
  this.projectUpdatedAt = updatedAt;
  this.recordDomainEvent(new ProjectRenamedEvent(this.id));
}
```

Define the error in
`domain/errors/project-name-unchanged.error.ts`:

```typescript
import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class ProjectNameUnchangedError extends DomainError {
  constructor(projectId: string, name: string) {
    super(
      ErrorCode.PROJECT_NAME_UNCHANGED,
      `Project ${projectId} already has the name ${name}.`,
      { projectId, name },
    );
    this.name = "ProjectNameUnchangedError";
  }
}
```

Register `PROJECT_NAME_UNCHANGED` in `src/shared/error-codes.ts` and add its
English and Spanish messages to `src/frontend/i18n/messages.ts`, as described
in the domain error guide.

Associations between aggregates are represented by ID Value Objects. Do not
nest another aggregate instance inside this aggregate.

## Step 5: Add Domain Events When Needed

Events implement `DomainEvent` and serialize plain data. Create
`project-created.event.ts`:

```typescript
import type { DomainEvent } from "@/backend/modules/shared";

export class ProjectCreatedEvent
  implements DomainEvent<{ projectId: string }>
{
  readonly eventName = "project_created";
  readonly occurredAt = new Date();

  constructor(private readonly projectId: string) {}

  toPrimitives(): { projectId: string } {
    return { projectId: this.projectId };
  }
}
```

Create `project-deleted.event.ts` with the same structure:

```typescript
import type { DomainEvent } from "@/backend/modules/shared";

export class ProjectDeletedEvent
  implements DomainEvent<{ projectId: string }>
{
  readonly eventName = "project_deleted";
  readonly occurredAt = new Date();

  constructor(private readonly projectId: string) {}

  toPrimitives(): { projectId: string } {
    return { projectId: this.projectId };
  }
}
```

Use `recordDomainEvent(...)` inside `create(...)` and behavior methods. Calling
`pullDomainEvents()` returns the pending events and clears the internal list.
The example's `delete(updatedAt)` method updates the aggregate timestamp before
recording `ProjectDeletedEvent`; the use case can then call the repository's
`delete(...)` method.

## Step 6: Add the Repository Port

Every aggregate must have a matching repository interface under
`domain/repositories/`. Repositories accept and return aggregates and Value
Objects, never primitives or persistence rows:

```typescript
import type { UserId } from "@/backend/modules/shared";
import type { Project } from "../entities/project.entity";
import type { ProjectId } from "../value-objects/project-id.value-object";
import type { ProjectName } from "../value-objects/project-name.value-object";

export interface ProjectSearchCriteria {
  userId: UserId;
  search?: ProjectName | null;
}

export interface ProjectRepository {
  search(criteria: ProjectSearchCriteria): Promise<Project[]>;
  findById(id: ProjectId, userId: UserId): Promise<Project | null>;
  save(project: Project): Promise<Project>;
  delete(id: ProjectId, userId: UserId): Promise<void>;
}
```

Use `save(aggregate)` for both inserts and updates. Do not add repository
methods such as `create(primitives)` or `update(input)`.

## Step 7: Write the Colocated Entity Test

Create `project.entity.test.ts` beside the entity. At minimum, test creation,
hydration, serialization, domain behavior, and recorded events. Test
business-rule errors whenever the entity defines them:

```typescript
import { describe, expect, it } from "vitest";
import { Timestamp, UserId } from "@/backend/modules/shared";
import { Project } from "./project.entity";
import { ProjectNameUnchangedError } from "../errors/project-name-unchanged.error";
import { ProjectId } from "../value-objects/project-id.value-object";
import { ProjectName } from "../value-objects/project-name.value-object";

function createProject() {
  return Project.create({
    id: ProjectId.fromPrimitives("project-1"),
    userId: UserId.fromPrimitives("user-1"),
    name: ProjectName.fromPrimitives("Launch"),
    createdAt: Timestamp.fromPrimitives("2026-06-01T10:00:00.000Z"),
    updatedAt: Timestamp.fromPrimitives("2026-06-01T10:00:00.000Z"),
  });
}

describe("Project", () => {
  it("creates, serializes, and records a created event", () => {
    const project = createProject();

    expect(project.toPrimitives()).toEqual({
      id: "project-1",
      userId: "user-1",
      name: "Launch",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z",
    });
    expect(project.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "project_created",
    ]);
  });

  it("hydrates without recording events", () => {
    const primitives = createProject().toPrimitives();
    const project = Project.fromPrimitives(primitives);

    expect(project.toPrimitives()).toEqual(primitives);
    expect(project.pullDomainEvents()).toEqual([]);
  });

  it("renames and records the behavior", () => {
    const project = Project.fromPrimitives(createProject().toPrimitives());

    project.rename(
      ProjectName.fromPrimitives("New name"),
      Timestamp.fromPrimitives("2026-06-02T10:00:00.000Z"),
    );

    expect(project.toPrimitives()).toMatchObject({
      name: "New name",
      updatedAt: "2026-06-02T10:00:00.000Z",
    });
    expect(project.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "project_renamed",
    ]);
  });

  it("rejects a rename when the name is unchanged", () => {
    const project = Project.fromPrimitives(createProject().toPrimitives());

    expect(() =>
      project.rename(
        ProjectName.fromPrimitives("Launch"),
        Timestamp.fromPrimitives("2026-06-02T10:00:00.000Z"),
      ),
    ).toThrow(ProjectNameUnchangedError);
    expect(project.pullDomainEvents()).toEqual([]);
  });

  it("deletes, updates the timestamp, and records a deleted event", () => {
    const project = Project.fromPrimitives(createProject().toPrimitives());

    project.delete(
      Timestamp.fromPrimitives("2026-06-03T10:00:00.000Z"),
    );

    expect(project.toPrimitives().updatedAt).toBe(
      "2026-06-03T10:00:00.000Z",
    );
    expect(project.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "project_deleted",
    ]);
  });
});
```

Value Objects also require their own colocated tests for valid construction,
round-trip serialization, and invalid values.

## Step 8: Export Only the Public API

Export the entity or its public primitive types from the module's `index.ts`
only when another allowed boundary needs them. Do not export infrastructure
implementations or domain repository ports from the module barrel.

```typescript
export { Project } from "./domain/entities/project.entity";
export type {
  ProjectCreateParams,
  ProjectPrimitives,
} from "./domain/entities/project.entity";
```

## Verification

Run the entity test and the DDD checks before finishing:

```bash
npm run test:backend -- src/backend/modules/my-module/domain/entities/project.entity.test.ts
npm run ddd:check
```

`npm run ddd:check` verifies the entity shape, Value Object backing, repository
contract, import direction, colocated application/repository tests, and error
conventions.

## Checklist

- The class extends `AggregateRoot` and has a private or protected constructor.
- `<Entity>Primitives` contains only plain camelCase boundary values.
- `<Entity>CreateParams` contains Value Objects and includes `id`.
- Constructor fields are all Value Objects.
- `create(...)` represents new state and records the appropriate event.
- `fromPrimitives(...)` hydrates every field and records no events.
- Every `toPrimitives()` field delegates to a Value Object.
- Domain methods accept Value Objects and own state changes and business rules.
- Custom entity errors live under `domain/errors/` and have registered error
  codes and translations.
- Delete behavior updates `updatedAt` and records the deleted event.
- Associations store IDs, not nested aggregate instances.
- A matching `<Entity>Repository` port works with aggregates and Value Objects.
- Entity and Value Object tests are colocated with their source files.
- `npm run ddd:check` passes.
