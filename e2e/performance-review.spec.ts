import { expect, test, type Page } from "@playwright/test";
import { messages } from "../src/frontend/i18n/messages";
import { loginViaUI } from "./helpers/auth";
import { uniqueLabel } from "./helpers/env";
import { createConfirmedUser } from "./helpers/supabase";

const t = messages.en.performanceReview;

async function createContext(page: Page, name: string) {
  const response = await page.request.post("/api/activity-contexts", {
    data: { type: "project", name },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { id: string };
}

async function createReview(
  page: Page,
  title: string,
  activityContextId: string,
) {
  const today = new Date().toISOString().slice(0, 10);
  const response = await page.request.post("/api/reviews", {
    data: {
      title,
      reviewType: "performance_review",
      reviewDate: today,
      periodStart: `${today.slice(0, 4)}-01-01`,
      periodEnd: today,
      activityContextId,
    },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { id: string };
}

test("user can create, edit, add evidence, write an assessment, and delete a review", async ({
  page,
}) => {
  const user = await createConfirmedUser("performance-review-crud");
  await loginViaUI(page, user);

  const contextName = uniqueLabel("review-context");
  await createContext(page, contextName);

  await page.goto("/reviews");
  await expect(page.getByRole("heading", { name: t.title })).toBeVisible();
  await page.getByRole("button", { name: t.actions.create }).first().click();

  const title = uniqueLabel("Mid-year review");
  await page.getByLabel(t.fields.title).fill(title);
  await page.getByLabel(t.fields.context).selectOption({ label: contextName });
  await page.getByRole("button", { name: t.actions.create }).last().click();

  await expect(page).toHaveURL(/\/reviews\/[^/]+$/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.getByRole("button", { name: t.actions.edit, exact: true }).click();
  const updatedTitle = `${title} updated`;
  await page.getByLabel(t.fields.title).fill(updatedTitle);
  await page.getByRole("button", { name: t.actions.save }).click();
  await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();

  const evidence = "Delivered the review workflow and validated its impact.";
  await page.getByPlaceholder(t.evidence.customPlaceholder).fill(evidence);
  await page.getByRole("button", { name: t.evidence.addCustom }).click();
  await expect(page.getByText(evidence)).toBeVisible();

  await page.getByRole("button", { name: /Write self-assessment/ }).click();
  const assessment =
    "I delivered the review workflow and improved the team's feedback process.";
  await page
    .getByPlaceholder(t.selfAssessment.editorPlaceholder)
    .fill(assessment);
  await page.getByRole("button", { name: t.selfAssessment.save }).click();
  await expect(page.getByText(assessment)).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: t.actions.delete }).click();
  await expect(page).toHaveURL(/\/reviews$/);
  await expect(page.getByText(updatedTitle)).not.toBeVisible();
});

test("desktop list auto-selects one review without repeated navigation", async ({
  page,
}) => {
  const user = await createConfirmedUser("performance-review-auto-select");
  await loginViaUI(page, user);

  const context = await createContext(page, uniqueLabel("review-auto-context"));
  const firstTitle = uniqueLabel("First review");
  const secondTitle = uniqueLabel("Second review");
  const first = await createReview(page, firstTitle, context.id);
  const second = await createReview(page, secondTitle, context.id);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const reviewNavigations: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame() && new URL(frame.url()).pathname.startsWith("/reviews/")) {
      reviewNavigations.push(new URL(frame.url()).pathname);
    }
  });

  await page.goto("/reviews");
  await expect(page).toHaveURL(/\/reviews\/[^/]+$/);
  await expect(
    page.getByRole("heading", { name: new RegExp(`${firstTitle}|${secondTitle}`) }),
  ).toBeVisible();
  await page.waitForTimeout(500);

  expect(reviewNavigations).toHaveLength(1);
  expect([`/reviews/${first.id}`, `/reviews/${second.id}`]).toContain(
    reviewNavigations[0],
  );
  expect(errors).not.toContainEqual(
    expect.stringContaining("Maximum update depth exceeded"),
  );
});
