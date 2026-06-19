import { faker } from "@faker-js/faker";
import type { CreateCommitmentInput } from "../application/use-cases/create-commitment.use-case";
import type { CreateCommitmentItemInput } from "../application/use-cases/create-item.use-case";
import type { CreateCommitmentOutcomeInput } from "../application/use-cases/create-outcome.use-case";

const SOURCES = ["manager", "self", "company", "project", "other"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;
const ITEM_STATUSES = ["todo", "in_progress", "done", "cancelled"] as const;
const OUTCOME_TYPES = [
  "promotion",
  "role_change",
  "leadership",
  "mentoring",
  "money",
  "recognition",
  "learning",
  "other",
] as const;
const OUTCOME_STATUSES = ["expected", "achieved", "missed", "changed"] as const;

export class CommitmentFixture {
  static createCommitmentInput(
    overrides: Partial<CreateCommitmentInput> = {},
  ): CreateCommitmentInput {
    const startDaysAgo = faker.number.int({ min: 5, max: 60 });
    const targetDaysFromNow = faker.number.int({ min: 15, max: 120 });

    return {
      userId: overrides.userId ?? faker.string.uuid(),
      contextId: overrides.contextId ?? faker.string.uuid(),
      title: faker.helpers.arrayElement([
        `Complete the ${faker.hacker.noun()} migration to a ${faker.hacker.adjective()} architecture`,
        `Improve test coverage to ${faker.number.int({ min: 70, max: 95 })}%`,
        `Lead the ${faker.commerce.productName()} redesign`,
        `Earn the ${faker.helpers.arrayElement(["AWS", "GCP", "Azure", "Kubernetes", "Terraform"])} certification`,
        `Reduce deploy time by ${faker.number.int({ min: 20, max: 60 })}%`,
        `Implement observability for ${faker.hacker.noun()}`,
      ]),
      description: faker.lorem.paragraph(),
      successCriteria: faker.lorem.sentences(2),
      source: faker.helpers.arrayElement(SOURCES),
      priority: faker.helpers.arrayElement(PRIORITIES),
      startDate: new Date(Date.now() - startDaysAgo * 86400000)
        .toISOString()
        .split("T")[0],
      targetDate: new Date(Date.now() + targetDaysFromNow * 86400000)
        .toISOString()
        .split("T")[0],
      ...overrides,
    };
  }

  static createItemInput(
    overrides: Partial<CreateCommitmentItemInput> = {},
  ): CreateCommitmentItemInput {
    return {
      userId: overrides.userId ?? faker.string.uuid(),
      commitmentId: overrides.commitmentId ?? faker.string.uuid(),
      title: faker.helpers.arrayElement([
        `Write documentation for ${faker.hacker.noun()}`,
        `Implement tests for ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
        `Review ${faker.person.firstName()}'s pull request`,
        `Configure the ${faker.hacker.verb()} pipeline`,
        `Alignment meeting with ${faker.person.jobTitle()}`,
        `Technical spike: ${faker.hacker.phrase()}`,
      ]),
      notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      status: faker.helpers.arrayElement(ITEM_STATUSES),
      dueDate: faker.datatype.boolean()
        ? new Date(
            Date.now() +
              faker.number.int({ min: -10, max: 30 }) * 86400000,
          )
            .toISOString()
            .split("T")[0]
        : null,
      orderIndex: overrides.orderIndex ?? 0,
      ...overrides,
    };
  }

  static createOutcomeInput(
    overrides: Partial<CreateCommitmentOutcomeInput> = {},
  ): CreateCommitmentOutcomeInput {
    const type = faker.helpers.arrayElement(OUTCOME_TYPES);
    return {
      userId: overrides.userId ?? faker.string.uuid(),
      commitmentId: overrides.commitmentId ?? faker.string.uuid(),
      type,
      status: faker.helpers.arrayElement(OUTCOME_STATUSES),
      title: faker.helpers.arrayElement([
        "Promotion to Tech Lead",
        "Recognition as the team's technical reference",
        `Advanced mastery of ${faker.helpers.arrayElement(["Kubernetes", "DDD", "Event Sourcing", "GraphQL"])}`,
        "Performance bonus for goal completion",
        `Measurable improvement in ${faker.helpers.arrayElement(["latency", "availability", "test coverage", "throughput"])}`,
      ]),
      description: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      amount:
        type === "money"
          ? faker.number.int({ min: 500, max: 10000 })
          : null,
      currency: type === "money" ? "EUR" : null,
      ...overrides,
    };
  }
}
