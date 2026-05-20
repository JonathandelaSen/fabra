import { expect, test } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";
import { createConfirmedUser } from "./helpers/supabase";

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

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute(
    "placeholder",
    "you@example.com",
  );
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();

  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(
    page.getByRole("heading", { name: "Create your account" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create account" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Recover password" }).click();
  await expect(
    page.getByRole("heading", { name: "Recover password" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Send link" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Back to login" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Back to login" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("authenticated user can open the update-password route", async ({
  page,
}) => {
  const user = await createConfirmedUser("auth-password");

  await loginViaUI(page, user);
  await page.goto("/account/update-password");

  await expect(
    page.getByRole("heading", { name: "New password" }),
  ).toBeVisible();
  await expect(page.getByLabel("New password")).toBeVisible();
  await expect(page.getByLabel("Repeat password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save password" })).toBeVisible();
});
