import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/components/shared/i18n-provider";
import { render } from "@testing-library/react";
import { AuthForm } from "./auth-form";

const { signInWithGoogle } = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(),
}));

vi.mock("../api/auth-api", () => ({
  sendPasswordRecoveryEmail: vi.fn(),
  signInWithGoogle,
}));

vi.mock("../api/auth-actions", () => ({
  resendConfirmationEmail: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

describe("AuthForm", () => {
  it("offers Google sign in and starts OAuth when selected", async () => {
    signInWithGoogle.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <AuthForm />
      </I18nProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    expect(signInWithGoogle).toHaveBeenCalledOnce();
  });
});
