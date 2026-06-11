import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/shared/i18n-provider";
import { render } from "@testing-library/react";
import { AuthForm } from "./auth-form";

vi.mock("../api/auth-api", () => ({
  sendPasswordRecoveryEmail: vi.fn(),
}));

vi.mock("../api/auth-actions", () => ({
  resendConfirmationEmail: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

describe("AuthForm", () => {
  it("does not offer Google sign in", () => {
    render(
      <I18nProvider initialLocale="en">
        <AuthForm />
      </I18nProvider>,
    );

    expect(
      screen.queryByRole("button", { name: "Continue with Google" }),
    ).not.toBeInTheDocument();
  });
});
