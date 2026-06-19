import { expect, test } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";
import { createConfirmedUser } from "./helpers/supabase";
import { uniqueLabel } from "./helpers/env";
import { messages } from "../src/frontend/i18n/messages";

const t = messages.en.receivedFeedback;
const tContexts = messages.en.activityContexts;

test("manage contexts from an edited feedback opens the activity contexts page", async ({
  page,
}) => {
  const user = await createConfirmedUser("received-feedback");
  await loginViaUI(page, user);

  const contextName = uniqueLabel("rf-context");
  const contextResponse = await page.request.post("/api/activity-contexts", {
    data: { type: "project", name: contextName },
  });
  expect(contextResponse.ok()).toBeTruthy();
  const context = (await contextResponse.json()) as { id: string };

  const giverName = uniqueLabel("rf-giver");
  const feedbackResponse = await page.request.post("/api/received-feedback", {
    data: {
      activityContextId: context.id,
      receivedDate: "2026-06-10",
      giverName,
      feedbackText: "Strong ownership during the platform migration.",
      userNote: null,
    },
  });
  expect(feedbackResponse.ok()).toBeTruthy();

  await page.goto("/received-feedback");
  await expect(page.getByRole("heading", { name: t.title })).toBeVisible();

  // Desktop auto-selects the first item, opening the detail route.
  await expect(
    page.getByRole("heading", { name: giverName }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/received-feedback\/[0-9a-f-]+$/);

  await page.getByRole("button", { name: t.actions.edit, exact: true }).click();

  await page.getByRole("button", { name: t.actions.manageContexts }).click();

  await expect(
    page.getByRole("heading", { name: tContexts.title }),
  ).toBeVisible();

  // The navigation must *stick*. The bug let the feedback view's auto-select
  // effect fire a router.replace back to the detail route right after the
  // push, so the activity-contexts URL only appeared transiently before being
  // clobbered. Wait for any erroneous replace to settle, then assert we are
  // still on the activity-contexts page (not bounced back to the feedback route).
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/activity-contexts\?/);
  await expect(page).not.toHaveURL(/\/received-feedback/);
  await expect(
    page.getByRole("heading", { name: tContexts.title }),
  ).toBeVisible();
});
