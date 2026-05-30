import { expect, type Page } from "@playwright/test";
import type { E2EUser } from "./supabase";
import { messages } from "../../src/i18n/messages";

export async function loginViaUI(page: Page, user: E2EUser) {
  const tAuth = messages.en.auth;
  const tHome = messages.en.home;

  await page.goto("/login");
  await page.evaluate(() => {
    localStorage.setItem("ats-cv-ai-checker.aiProvider", "mock");
  });
  await page.getByLabel(tAuth.fields.email).fill(user.email);
  await page.getByRole("textbox", { name: tAuth.fields.password }).fill(user.password);
  await page.getByRole("button", { name: tAuth.login.submit }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: tHome.cvBlock.title }),
  ).toBeVisible();
}
