import { faker } from "@faker-js/faker";
import type { CreateFeedbackInput } from "../application/use-cases/create-feedback.use-case";
import type { CreateEntryInput } from "../application/use-cases/create-entry.use-case";

export class FeedbackFixture {
  static createInput(
    overrides: Partial<CreateFeedbackInput> = {},
  ): CreateFeedbackInput {
    return {
      user_id: overrides.user_id ?? faker.string.uuid(),
      activity_context_id: overrides.activity_context_id ?? faker.string.uuid(),
      person_name: `${faker.person.fullName()} (${faker.person.jobTitle()})`,
      ...overrides,
    };
  }

  static createEntryInput(
    overrides: Partial<CreateEntryInput> = {},
  ): CreateEntryInput {
    return {
      user_id: overrides.user_id ?? faker.string.uuid(),
      feedback_id: overrides.feedback_id ?? faker.string.uuid(),
      content: faker.helpers.arrayElement([
        `${faker.person.firstName()} mentioned that ${faker.company.catchPhrase().toLowerCase()} was a key achievement this week.`,
        `Positive feedback: excellent work on ${faker.commerce.productName()}, especially the ${faker.company.buzzNoun()}.`,
        `Suggestion: improve the ${faker.hacker.noun()} documentation to make onboarding easier for new team members.`,
        `They highlighted the proactive response to the production ${faker.hacker.noun()} incident.`,
        `They recognized the extra effort behind the ${faker.commerce.department()} sprint delivery.`,
      ]),
      ...overrides,
    };
  }
}
