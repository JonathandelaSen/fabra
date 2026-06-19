import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { ConfirmDialog } from "./confirm-dialog";

const messages = getMessages("en");
const TITLE = messages.receivedFeedback.confirmDelete;
const DESCRIPTION = messages.objectives.confirmDeleteItemDescription;
const CONFIRM = messages.common.actions.delete;
const CANCEL = messages.common.actions.cancel;

function createProps() {
  return {
    open: true,
    title: TITLE,
    description: DESCRIPTION,
    confirmLabel: CONFIRM,
    cancelLabel: CANCEL,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };
}

describe("ConfirmDialog", () => {
  it("does not expose dialog content while closed", () => {
    renderWithProviders(<ConfirmDialog {...createProps()} open={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes dialog content and accessible close actions", () => {
    renderWithProviders(<ConfirmDialog {...createProps()} />);

    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument();
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: messages.common.actions.close }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: CANCEL })).toBeInTheDocument();
  });

  it("uses translated default action labels", () => {
    const props = createProps();
    renderWithProviders(
      <ConfirmDialog
        {...props}
        confirmLabel={undefined}
        cancelLabel={undefined}
      />,
      { locale: "es" },
    );

    const esMessages = getMessages("es").common.actions;
    expect(
      screen.getByRole("button", { name: esMessages.confirmAction }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: esMessages.cancel }),
    ).toBeInTheDocument();
  });

  it("routes confirmation and cancellation actions", async () => {
    const props = createProps();
    const { user } = renderWithProviders(<ConfirmDialog {...props} />);

    await user.click(screen.getByRole("button", { name: CONFIRM }));
    await user.click(screen.getByRole("button", { name: CANCEL }));

    expect(props.onConfirm).toHaveBeenCalledOnce();
    expect(props.onCancel).toHaveBeenCalledOnce();
  });
});
