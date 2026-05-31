import { expect, test } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";
import { createConfirmedUser } from "./helpers/supabase";
import { messages } from "../src/i18n/messages";

test("authenticated user can open settings and manage Ollama local AI preferences", async ({
  page,
}) => {
  const user = await createConfirmedUser("settings");
  await loginViaUI(page, user);

  await page.goto("/settings");
  await expect(page).toHaveURL(/\/settings$/);
  await expect(
    page.getByRole("heading", { name: messages.en.settings.title }),
  ).toBeVisible();

  const ollamaUrlInput = page.getByPlaceholder(
    messages.en.settings.apiKey.ollamaPlaceholder,
  );
  const ollamaModelInput = page.getByPlaceholder(
    messages.en.settings.apiKey.ollamaModelPlaceholder,
  );

  await expect(ollamaUrlInput).toHaveValue("http://localhost:11434");
  await ollamaUrlInput.fill("http://localhost:11434");
  await ollamaModelInput.fill("llama3.2");
  await expect(ollamaModelInput).toHaveValue("llama3.2");
  const ollamaCard = ollamaModelInput.locator("xpath=ancestor::div[contains(@class, 'rounded-xl')][1]");
  await ollamaCard
    .getByRole("button", { name: messages.en.common.actions.save })
    .click();
  await expect(
    page.getByRole("button", { name: messages.en.common.actions.saved }),
  ).toBeVisible();

  await page.reload();
  await expect(
    ollamaUrlInput,
  ).toHaveValue("http://localhost:11434");
  await expect(ollamaModelInput).toHaveValue("llama3.2");
});
