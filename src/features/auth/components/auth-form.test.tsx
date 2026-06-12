import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/shared/i18n-provider";
import { render } from "@testing-library/react";
import { AuthForm } from "./auth-form";
import { signUp } from "../api/auth-actions";

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

  it("disables the signup button optimistically while signup is pending", async () => {
    const user = userEvent.setup();
    let resolveSignup: (() => void) | undefined;

    vi.mocked(signUp).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignup = () => resolve({});
        }),
    );

    render(
      <I18nProvider initialLocale="en">
        <AuthForm />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Sign up" }));
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password");

    const signupButton = document.querySelector<HTMLButtonElement>(
      'form button[type="submit"]',
    )!;
    await user.click(signupButton);

    expect(signupButton).toBeDisabled();

    resolveSignup?.();
  });
});
