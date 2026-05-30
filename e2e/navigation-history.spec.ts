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

async function expectSectionItem(page: Page, sectionPath: string, itemId: string) {
  await expect(page).toHaveURL(new RegExp(`/${sectionPath}/${itemId}(?:/|\\?|$)`));
}

async function expectSectionRoot(page: Page, sectionPath: string) {
  await expect(page).toHaveURL(new RegExp(`/${sectionPath}(?:\\?|$)`));
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
  await expectSectionRoot(page, sectionPath);
  const [firstItem, secondItem] = items;

  await page.getByRole("button", { name: new RegExp(firstItem.label) }).click();
  await expectSectionItem(page, sectionPath, firstItem.id);

  await page.getByRole("button", { name: new RegExp(secondItem.label) }).click();
  await expectSectionItem(page, sectionPath, secondItem.id);

  await page.goBack();
  await expectSectionItem(page, sectionPath, firstItem.id);

  await page.goBack();
  await expectSectionRoot(page, sectionPath);

  await page.goBack();
  await expectHome(page);

  await page.goForward();
  await expectSectionRoot(page, sectionPath);

  await page.goForward();
  await expectSectionItem(page, sectionPath, firstItem.id);

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
  await page.locator("main").getByRole("button", { name: label }).click();
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

  await page.goto("/");
  await expectHomeIsInteractive(page);

  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.cvBlock.uploadCv,
    expectedPath: /\/cvs(?:\?|$)/,
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.cvBlock.analyzeCv,
    expectedPath: /\/cv-analysis(?:\?|$)/,
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.cvBlock.compareOffers,
    expectedPath: /\/job-analyses(?:\?|$)/,
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.careerBlock.workJournal,
    expectedPath: /\/work-journal(?:\?|$)/,
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.careerBlock.objectives,
    expectedPath: /\/objectives(?:\/[^/?]+|\?|$)/,
  });
  await exerciseHomeSectionRoundTrip({
    page,
    label: messages.en.home.careerBlock.feedback,
    expectedPath: /\/received-feedback(?:\?|$)/,
  });
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
