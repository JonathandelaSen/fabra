import { faker } from "@faker-js/faker";
import type { CreateEntryInput } from "../application/use-cases/create-entry.use-case";

const INPUT_MODES = ["manual", "ai_assisted"] as const;

export class WorkJournalEntryFixture {
  static createInput(
    overrides: Partial<CreateEntryInput> = {},
  ): CreateEntryInput {
    const daysAgo = faker.number.int({ min: 0, max: 90 });
    const dateStart = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const inputMode = faker.helpers.arrayElement(INPUT_MODES);

    const topic = faker.helpers.arrayElement([
      `Refactoring ${faker.hacker.noun()} boundaries`,
      `API design for ${faker.commerce.productName()}`,
      `Bug fix in ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
      `Planning session: ${faker.company.catchPhrase()}`,
      `Code review with ${faker.person.firstName()}`,
      `Research spike: ${faker.hacker.phrase()}`,
      `Deploying ${faker.commerce.productName()} v${faker.system.semver()}`,
      `Pair programming with ${faker.person.firstName()}`,
      `Performance optimization in ${faker.hacker.noun()}`,
      `Documentation for ${faker.hacker.noun()}`,
    ]);

    const rawNotes = faker.helpers.arrayElement([
      `Worked on ${topic.toLowerCase()}. ${faker.company.catchPhrase()}.`,
      `Productive ${faker.number.int({ min: 2, max: 6 })}-hour session focused on ${topic.toLowerCase()}.`,
      `Made meaningful progress on ${topic.toLowerCase()}. Follow-up: ${faker.hacker.phrase()}.`,
    ]);

    return {
      user_id: overrides.user_id ?? faker.string.uuid(),
      context_id: overrides.context_id ?? faker.string.uuid(),
      date_start: dateStart.toISOString().split("T")[0],
      date_end: null,
      topic,
      input_mode: inputMode,
      raw_notes: rawNotes,
      final_text:
        inputMode === "ai_assisted"
          ? `${rawNotes}\n\nExpanded summary: ${faker.lorem.paragraph()}`
          : rawNotes,
      ...overrides,
    };
  }
}
