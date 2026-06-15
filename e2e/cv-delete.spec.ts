import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";
import { createConfirmedUser } from "./helpers/supabase";
import { uniqueLabel } from "./helpers/env";

test("deleting a CV without analyses succeeds", async ({ browser }) => {
  const user = await createConfirmedUser("cv-delete");

  const context = await browser.newContext();
  const page = await context.newPage();
  await loginViaUI(page, user);

  const cvName = uniqueLabel("delete-cv");
  const pdf = readFileSync(path.resolve(process.cwd(), "test.pdf"));
  const cvResponse = await page.request.post("/api/cvs", {
    multipart: {
      name: cvName,
      file: {
        name: `${cvName}.pdf`,
        mimeType: "application/pdf",
        buffer: pdf,
      },
    },
  });
  expect(cvResponse.ok()).toBeTruthy();
  const cv = (await cvResponse.json()) as { id: string };

  const deleteResponse = await page.request.delete(`/api/cvs/${cv.id}`);
  expect(deleteResponse.status()).toBe(200);
  expect(await deleteResponse.json()).toMatchObject({ success: true });

  await context.close();
});
