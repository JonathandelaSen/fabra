import { faker } from "@faker-js/faker";
import crypto from "node:crypto";
import type { OpportunityPersonProfileInput } from "../application/opportunity-person-input";
import type { CreateProcessQuestionInput } from "../application/use-cases/create-process-question.use-case";

export class SelectionProcessFixture {
  static createOpportunityPersonProfiles(
    organization: string,
  ): OpportunityPersonProfileInput[] {
    const recruiterName = faker.person.fullName();
    const managerName = faker.person.fullName();
    const interviewerName = faker.person.fullName();

    return [
      {
        name: recruiterName,
        role: "external_recruiter",
        jobTitle: "Senior Talent Partner",
        organization: "Northstar Talent",
        email: faker.internet.email({ firstName: recruiterName }),
        phone: faker.phone.number(),
        links: [
          {
            url: `https://www.linkedin.com/in/${faker.helpers.slugify(recruiterName).toLowerCase()}`,
            label: "LinkedIn",
          },
        ],
        notes: "Made the initial introduction and shared context about the hiring process.",
      },
      {
        name: managerName,
        role: "hiring_manager",
        jobTitle: "Engineering Manager",
        organization,
        links: [
          {
            url: `https://www.linkedin.com/in/${faker.helpers.slugify(managerName).toLowerCase()}`,
            label: "LinkedIn",
          },
        ],
        notes: "Owns the role and is likely to focus on scope, impact, and team collaboration.",
      },
      {
        name: interviewerName,
        role: "technical_interviewer",
        jobTitle: "Staff Software Engineer",
        organization,
        links: [
          {
            url: `https://github.com/${faker.internet.username().toLowerCase()}`,
            label: "GitHub",
          },
        ],
        notes: "Expected to take part in the technical interview and discuss engineering trade-offs.",
      },
    ];
  }

  static createProcessQuestionInput(
    overrides: Partial<CreateProcessQuestionInput> = {},
  ): CreateProcessQuestionInput {
    return {
      userId: overrides.userId ?? faker.string.uuid(),
      jobOpportunityId: overrides.jobOpportunityId ?? null,
      question: faker.helpers.arrayElement([
        "How would you migrate a monolith to services without downtime?",
        "Describe your experience leading distributed technical teams.",
        "What strategy would you use to optimize slow PostgreSQL queries?",
        "How would you design a distributed cache for a high-traffic product?",
        "Walk through an API design that can sustain 100k requests per second.",
        "What is your testing approach for applications with external integrations?",
        "How do you handle technical disagreements within an engineering team?",
        "Describe a system you designed from discovery through production launch.",
        "Which design patterns do you reach for most often, and why?",
        "How do you keep a modern web application secure by default?",
      ]),
      context: faker.datatype.boolean()
        ? `Question for the ${faker.person.jobTitle()} role at ${faker.company.name()}.`
        : null,
      answer: faker.datatype.boolean()
        ? faker.lorem.paragraphs(2)
        : null,
      ...overrides,
    };
  }

  static createJobOpportunityRow(userId: string) {
    const company = faker.company.name();
    const title = faker.person.jobTitle();
    return {
      id: crypto.randomUUID(),
      user_id: userId,
      company,
      title,
      location: `${faker.location.city()}, ${faker.location.country()}`,
      remote: faker.helpers.arrayElement([
        "Remote",
        "Hybrid",
        "On-site",
      ]),
      salary: `${faker.number.int({ min: 40, max: 120 })}k - ${faker.number.int({ min: 120, max: 200 })}k EUR`,
      seniority: faker.helpers.arrayElement([
        "Junior",
        "Mid",
        "Senior",
        "Lead",
        "Staff",
        "Principal",
      ]),
      contract_type: faker.helpers.arrayElement([
        "Full-time",
        "Part-time",
        "Contract",
        "Freelance",
      ]),
      url: faker.internet.url(),
      benefits: faker.helpers.arrayElements(
        [
          "Private healthcare",
          "Remote work",
          "Continuous learning budget",
          "Stock options",
          "Annual bonus",
          "Wellness stipend",
          "Catered lunches",
          "Flexible schedule",
        ],
        { min: 2, max: 5 },
      ),
      requirements: faker.helpers.arrayElements(
        [
          "5+ years of experience",
          "Advanced TypeScript/JavaScript",
          "Experience with React/Next.js",
          "PostgreSQL or relational databases",
          "Docker and CI/CD",
          "Cloud experience (AWS/GCP/Azure)",
          "Technical leadership",
          "Agile delivery methods",
        ],
        { min: 3, max: 6 },
      ),
      responsibilities: faker.helpers.arrayElements(
        [
          "Design and build core product capabilities",
          "Mentor junior engineers",
          "Participate in thoughtful code reviews",
          "Collaborate closely with product and design",
          "Maintain and improve infrastructure",
          "Ensure code quality and performance",
        ],
        { min: 2, max: 4 },
      ),
      description: `We are looking for a thoughtful ${title} to join ${company}. ${faker.company.catchPhrase()}.`,
    };
  }

  static createFollowUpRow(userId: string, jobOpportunityId: string) {
    const STATUSES = [
      "applied",
      "interview",
      "offer",
      "rejected",
      "discarded",
    ];
    return {
      user_id: userId,
      job_opportunity_id: jobOpportunityId,
      status: faker.helpers.arrayElement(STATUSES),
      notes: faker.lorem.sentence(),
      next_action: faker.datatype.boolean()
        ? faker.helpers.arrayElement([
            "Prepare the technical case study",
            "Send a follow-up email",
            "Review the compensation package",
            "Prepare questions for the interviewer",
          ])
        : null,
      next_action_at: faker.datatype.boolean()
        ? new Date(
            Date.now() +
              faker.number.int({ min: 1, max: 14 }) * 86400000,
          ).toISOString()
        : null,
    };
  }
}
