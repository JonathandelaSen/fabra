import { faker } from "@faker-js/faker";
import type { CreateReceivedFeedbackInput } from "../application/use-cases/create-received-feedback.use-case";

export class ReceivedFeedbackFixture {
  static createInput(
    overrides: Partial<CreateReceivedFeedbackInput> = {},
  ): CreateReceivedFeedbackInput {
    const daysAgo = faker.number.int({ min: 1, max: 60 });
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    return {
      userId: overrides.userId ?? faker.string.uuid(),
      activityContextId: overrides.activityContextId ?? faker.string.uuid(),
      receivedDate: date.toISOString().split("T")[0],
      giverName: `${faker.person.fullName()} (${faker.person.jobTitle()})`,
      feedbackText: faker.helpers.arrayElement([
        `Excellent work leading the ${faker.commerce.productName()} initiative. Your ability to explain technical tradeoffs to non-technical stakeholders stood out.`,
        `Your contribution to the ${faker.hacker.noun()} architecture improved the team's code quality in a visible way.`,
        `Good job coordinating the release. Suggestion: involve QA earlier in the development process to catch edge cases sooner.`,
        `Your time management has noticeably improved. The last two weeks of deliverables landed ahead of the deadline.`,
      ]),
      userNote: faker.datatype.boolean()
        ? faker.helpers.arrayElement([
            "Capture this for the next retrospective.",
            "I appreciate the recognition. Keep building on this pattern.",
            "Useful point; incorporate this suggestion into the next sprint.",
          ])
        : null,
      ...overrides,
    };
  }
}
