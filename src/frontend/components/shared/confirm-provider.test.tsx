import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { ConfirmProvider, useConfirm } from "./confirm-provider";

const messages = getMessages("en");
const TITLE = messages.receivedFeedback.confirmDelete;
const CONFIRM = messages.common.actions.confirmAction;
const CANCEL = messages.common.actions.cancel;

function Harness({ onResult }: { onResult: (result: boolean) => void }) {
  const confirm = useConfirm();
  return (
    <button
      type="button"
      onClick={async () => {
        onResult(await confirm({ title: TITLE }));
      }}
    >
      open
    </button>
  );
}

describe("ConfirmProvider", () => {
  it("throws when useConfirm is used outside a provider", () => {
    function Orphan() {
      useConfirm();
      return null;
    }
    // Disable console.error override to avoid test output noise when it throws
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(
      /must be used within a ConfirmProvider/,
    );
    spy.mockRestore();
  });

  it("does not render a dialog until confirm is requested", () => {
    renderWithProviders(
      <ConfirmProvider>
        <Harness onResult={() => {}} />
      </ConfirmProvider>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resolves true when the user confirms", async () => {
    const results: boolean[] = [];
    const { user } = renderWithProviders(
      <ConfirmProvider>
        <Harness onResult={(result) => results.push(result)} />
      </ConfirmProvider>,
    );

    await user.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: CONFIRM }));

    expect(results).toEqual([true]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resolves false when the user cancels", async () => {
    const results: boolean[] = [];
    const { user } = renderWithProviders(
      <ConfirmProvider>
        <Harness onResult={(result) => results.push(result)} />
      </ConfirmProvider>,
    );

    await user.click(screen.getByRole("button", { name: "open" }));
    await user.click(screen.getByRole("button", { name: CANCEL }));

    expect(results).toEqual([false]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
