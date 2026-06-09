import { expect, test } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";
import { createConfirmedUser } from "./helpers/supabase";
import { messages } from "../src/i18n/messages";

const tAuth = messages.en.auth;

test("protected APIs reject anonymous requests", async ({ request }) => {
  const cvs = await request.get("/api/cvs");
  expect(cvs.status()).toBe(401);

  const analyses = await request.get("/api/cv-analyses");
  expect(analyses.status()).toBe(401);

  const adminMe = await request.get("/api/admin/me");
  expect(adminMe.status()).toBe(401);
  expect(await adminMe.json()).toEqual({ isAdmin: false });
});

test("confirmed local user can sign in through the UI and is not admin", async ({
  page,
}) => {
  const user = await createConfirmedUser("auth");

  await loginViaUI(page, user);

  const adminMe = await page.request.get("/api/admin/me");
  expect(adminMe.status()).toBe(200);
  expect(await adminMe.json()).toEqual({ isAdmin: false });
});

test("login route exposes signup and password recovery modes", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: tAuth.login.title })).toBeVisible();
  await expect(
    page.getByRole("button", { name: tAuth.google.continue }),
  ).toBeVisible();
  await expect(page.getByLabel(tAuth.fields.email)).toHaveAttribute(
    "placeholder",
    tAuth.fields.emailPlaceholder,
  );
  await expect(page.getByRole("textbox", { name: tAuth.fields.password })).toBeVisible();

  await page.getByRole("button", { name: tAuth.signup.tab }).click();
  await expect(
    page.getByRole("heading", { name: tAuth.signup.title }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: tAuth.signup.submit }),
  ).toBeVisible();

  await page.getByRole("button", { name: tAuth.recover.link }).click();
  await expect(
    page.getByRole("heading", { name: tAuth.recover.title }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: tAuth.recover.submit })).toBeVisible();
  await expect(
    page.getByRole("button", { name: tAuth.recover.backToLogin }),
  ).toBeVisible();

  await page.getByRole("button", { name: tAuth.recover.backToLogin }).click();
  await expect(page.getByRole("heading", { name: tAuth.login.title })).toBeVisible();
});

test("failed OAuth callback returns to login with a provider-specific error", async ({
  page,
}) => {
  await page.goto("/auth/callback");

  await expect(page).toHaveURL(/\/login\?oauthError=1$/);
  await expect(page.getByText(tAuth.google.callbackError)).toBeVisible();
});

test("authenticated user can open the update-password route", async ({
  page,
}) => {
  const user = await createConfirmedUser("auth-password");

  await loginViaUI(page, user);
  await page.goto("/account/update-password");

  await expect(
    page.getByRole("heading", { name: tAuth.updatePassword.title }),
  ).toBeVisible();
  await expect(page.getByLabel(tAuth.updatePassword.passwordLabel)).toBeVisible();
  await expect(page.getByLabel(tAuth.updatePassword.confirmLabel)).toBeVisible();
  await expect(page.getByRole("button", { name: tAuth.updatePassword.submit })).toBeVisible();
});
