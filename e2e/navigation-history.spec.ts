import { expect, test, type Page } from "@playwright/test";
import { messages } from "../src/i18n/messages";
import { loginViaUI } from "./helpers/auth";
import { createFixtureViaApi } from "./helpers/cv";
import { uniqueLabel } from "./helpers/env";
import { createConfirmedUser } from "./helpers/supabase";

interface SectionItem {
  id: string;
  label: string;
}

interface CommitmentsWorkspace {
  contexts: Array<{ id: string }>;
}

interface ActivityContextsWorkspace {
  contexts: Array<{ id: string }>;
}

async function expectHome(page: Page) {
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: messages.en.home.cvBlock.title }),
  ).toBeVisible();
}

async function expectHomeIsInteractive(page: Page) {
  await expectHome(page);
  const main = page.locator("main");
  for (const label of [
    messages.en.home.cvBlock.uploadCv,
    messages.en.home.cvBlock.analyzeCv,
    messages.en.home.cvBlock.compareOffers,
    messages.en.home.careerBlock.workJournal,
    messages.en.home.careerBlock.objectives,
    messages.en.home.careerBlock.feedback,
  ]) {
    await expect(main.getByRole("button", { name: label })).toBeEnabled();
  }
}

async function createJobMatch(page: Page, cvId: string, title: string) {
  const jobMatchResponse = await page.request.post("/api/job-match-analyses", {
    data: {
      cvId,
      title,
      jobDescription:
        "Senior React developer role with Next.js, TypeScript, and product engineering ownership.",
    },
  });
  expect(jobMatchResponse.ok()).toBeTruthy();
  return (await jobMatchResponse.json()) as { id: string };
}

async function createObjective(page: Page, title: string) {
  const workspaceResponse = await page.request.get("/api/commitments");
  expect(workspaceResponse.ok()).toBeTruthy();
  const workspace = (await workspaceResponse.json()) as CommitmentsWorkspace;
  const contextId = workspace.contexts[0]?.id;
  expect(contextId).toBeTruthy();

  const objectiveResponse = await page.request.post("/api/commitments", {
    data: {
      contextId,
      title,
      description: "Navigation history objective fixture",
      successCriteria: "Back navigation returns to Home",
      resultNotes: null,
      source: "self",
      priority: "medium",
      startDate: new Date().toISOString().slice(0, 10),
      targetDate: null,
    },
  });
  expect(objectiveResponse.ok()).toBeTruthy();
  return (await objectiveResponse.json()) as { id: string };
}

async function createInterviewQuestion(page: Page, question: string) {
  const questionResponse = await page.request.post("/api/interview-questions", {
    data: {
      question,
      context: "Navigation history interview question fixture",
      answer: null,
      cvId: null,
      analysisId: null,
    },
  });
  expect(questionResponse.ok()).toBeTruthy();
  return (await questionResponse.json()) as { id: string };
}

async function createFeedbackNote(page: Page, personName: string) {
  const contextsResponse = await page.request.get("/api/activity-contexts");
  expect(contextsResponse.ok()).toBeTruthy();
  const workspace = (await contextsResponse.json()) as ActivityContextsWorkspace;
  const activityContextId = workspace.contexts[0]?.id;
  expect(activityContextId).toBeTruthy();

  const feedbackResponse = await page.request.post("/api/feedback-notes/feedbacks", {
    data: {
      personName,
      activityContextId,
    },
  });
  expect(feedbackResponse.ok()).toBeTruthy();
  return (await feedbackResponse.json()) as { id: string };
}

async function expectSectionItem(page: Page, sectionPath: string, itemId: string) {
  await expect(page).toHaveURL(new RegExp(`/${sectionPath}/${itemId}(?:/|\\?|$)`));
}

function idFromUrl(page: Page, sectionPath: string) {
  const url = new URL(page.url());
  const match = url.pathname.match(new RegExp(`^/${sectionPath}/([^/]+)`));
  if (!match?.[1]) {
    throw new Error(`Expected ${url.pathname} to contain an item id for ${sectionPath}`);
  }
  return decodeURIComponent(match[1]);
}

async function exerciseComposedSectionNavigation({
  page,
  openSection,
  sectionPath,
  items,
}: {
  page: Page;
  openSection: () => Promise<void>;
  sectionPath: string;
  items: [SectionItem, SectionItem];
}) {
  await page.goto("/");
  await expectHome(page);

  await openSection();
  await expect(page).toHaveURL(new RegExp(`/${sectionPath}/[^/?]+`));
  const firstSelectedId = idFromUrl(page, sectionPath);
  const secondItem = items.find((item) => item.id !== firstSelectedId);
  if (!secondItem) {
    throw new Error(`Could not find a second ${sectionPath} item for composed navigation`);
  }

  await page.getByRole("button", { name: new RegExp(secondItem.label) }).click();
  await expectSectionItem(page, sectionPath, secondItem.id);

  await page.goBack();
  await expectSectionItem(page, sectionPath, firstSelectedId);

  await page.goBack();
  await expectHome(page);

  await page.goForward();
  await expectSectionItem(page, sectionPath, firstSelectedId);

  await page.goForward();
  await expectSectionItem(page, sectionPath, secondItem.id);
}

async function exerciseHomeSectionRoundTrip({
  page,
  label,
  expectedPath,
}: {
  page: Page;
  label: string;
  expectedPath: RegExp;
}) {
  await expectHomeIsInteractive(page);
  const mainButton = page.locator("main").getByRole("button", { name: label });
  if ((await mainButton.count()) > 0) {
    await mainButton.click();
  } else {
    await page.getByRole("button", { name: label, exact: true }).click();
  }
  await expect(page).toHaveURL(expectedPath);
  await page.goBack();
  await expectHomeIsInteractive(page);
}

test("home remains interactive after opening every home section and going back", async ({
  page,
}) => {
  const user = await createConfirmedUser("home-round-trip");
  await loginViaUI(page, user);
  const first = await createFixtureViaApi(page.request, "home-round-trip-a");
  const second = await createFixtureViaApi(page.request, "home-round-trip-b");
  await createJobMatch(
    page,
    first.cv.id,
    uniqueLabel("home-round-trip-a-job"),
  );
  await createJobMatch(
    page,
    second.cv.id,
    uniqueLabel("home-round-trip-b-job"),
  );
  const firstQuestion = await createInterviewQuestion(
    page,
    uniqueLabel("home-round-trip-question-a"),
  );
  const feedback = await createFeedbackNote(
    page,
    uniqueLabel("home-round-trip-feedback"),
  );
  const objective = await createObjective(
    page,
    uniqueLabel("home-round-trip-objective"),
  );

  await page.goto("/");
  await expectHomeIsInteractive(page);

  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.cvBlock.uploadCv,
    expectedPath: new RegExp(`/cvs/${first.cv.id}|/cvs/${second.cv.id}`),
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.cvBlock.analyzeCv,
    expectedPath: new RegExp(
      `/cv-analysis/${first.analysis.id}|/cv-analysis/${second.analysis.id}`,
    ),
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.cvBlock.compareOffers,
    expectedPath: /\/job-analyses\/[^/?]+/,
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.careerBlock.workJournal,
    expectedPath: /\/work-journal(?:\?|$)/,
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.careerBlock.objectives,
    expectedPath: new RegExp(`/objectives/${objective.id}(?:/|\\?|$)`),
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.careerBlock.feedback,
    expectedPath: /\/received-feedback(?:\?|$)/,
  });

  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.navigation.interviewQuestions,
    expectedPath: new RegExp(`/interview-questions/${firstQuestion.id}(?:/|\\?|$)`),
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.navigation.feedbackNotes,
    expectedPath: new RegExp(`/feedback-notes/${feedback.id}\\?status=active`),
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.navigation.templates,
    expectedPath: /\/templates\/[^/?]+/,
  });
});

test("objectives delayed auto-selection does not replace Home after back", async ({
  page,
}) => {
  const user = await createConfirmedUser("objectives-race");
  await loginViaUI(page, user);
  await createObjective(page, uniqueLabel("objectives-race-objective"));

  let releaseCommitments: (() => void) | null = null;
  const delayedCommitments = new Promise<void>((resolve) => {
    releaseCommitments = resolve;
  });
  let delayedFirstWorkspaceRequest = false;

  await page.route("**/api/commitments", async (route) => {
    if (
      route.request().method() === "GET" &&
      !delayedFirstWorkspaceRequest
    ) {
      delayedFirstWorkspaceRequest = true;
      await delayedCommitments;
    }
    await route.continue();
  });

  await page.goto("/");
  await expectHomeIsInteractive(page);

  await page
    .locator("main")
    .getByRole("button", { name: messages.en.home.careerBlock.objectives })
    .click();
  await expect(page).toHaveURL(/\/objectives(?:\?|$)/);

  await page.goBack();
  await expectHomeIsInteractive(page);

  const commitmentsResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/commitments") &&
      response.request().method() === "GET",
  );
  releaseCommitments?.();
  await commitmentsResponse;
  await expectHomeIsInteractive(page);
});

test("section item navigation keeps composed back and forward history intact", async ({
  page,
}) => {
  const user = await createConfirmedUser("navigation-history");
  await loginViaUI(page, user);

  const first = await createFixtureViaApi(page.request, "navigation-history-a");
  const second = await createFixtureViaApi(page.request, "navigation-history-b");
  const cvItems: [SectionItem, SectionItem] = [
    { id: first.cv.id, label: "navigation-history-a-cv" },
    { id: second.cv.id, label: "navigation-history-b-cv" },
  ];
  const cvAnalysisItems: [SectionItem, SectionItem] = [
    { id: first.analysis.id, label: "navigation-history-a-analysis" },
    { id: second.analysis.id, label: "navigation-history-b-analysis" },
  ];
  const firstJobMatch = await createJobMatch(
    page,
    first.cv.id,
    uniqueLabel("navigation-history-a-job"),
  );
  const secondJobMatchTitle = uniqueLabel("navigation-history-b-job");
  const secondJobMatch = await createJobMatch(
    page,
    second.cv.id,
    secondJobMatchTitle,
  );
  const jobMatchItems: [SectionItem, SectionItem] = [
    { id: firstJobMatch.id, label: "navigation-history-a-job" },
    { id: secondJobMatch.id, label: secondJobMatchTitle },
  ];

  await exerciseComposedSectionNavigation({
    page,
    sectionPath: "cvs",
    items: cvItems,
    openSection: async () => {
      await page
        .locator("main")
        .getByRole("button", { name: messages.en.home.cvBlock.uploadCv })
        .click();
    },
  });

  await exerciseComposedSectionNavigation({
    page,
    sectionPath: "cv-analysis",
    items: cvAnalysisItems,
    openSection: async () => {
      await page
        .locator("main")
        .getByRole("button", { name: messages.en.home.cvBlock.analyzeCv })
        .click();
    },
  });

  await exerciseComposedSectionNavigation({
    page,
    sectionPath: "job-analyses",
    items: jobMatchItems,
    openSection: async () => {
      await page
        .locator("main")
        .getByRole("button", { name: messages.en.home.cvBlock.compareOffers })
        .click();
    },
  });
});
