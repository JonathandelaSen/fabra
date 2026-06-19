import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/i18n/messages";
import { SegmentedControl } from "./segmented-control";

const messages = getMessages("en");
const ACTIVE = messages.feedbackNotes.filters.active;
const CLOSED = messages.feedbackNotes.filters.closed;

describe("SegmentedControl", () => {
  it("renders options and reports the selected value", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <SegmentedControl
        options={[
          { value: "active", label: ACTIVE, count: 2 },
          { value: "closed", label: CLOSED, count: 0 },
        ]}
        value="active"
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("button", { name: `${ACTIVE}(2)` })).toHaveClass(
      "bg-panel-base",
    );
    expect(
      screen.getByRole("button", { name: `${ACTIVE}(2)` }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: `${CLOSED}(0)` }),
    ).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: `${CLOSED}(0)` }));

    expect(onChange).toHaveBeenCalledWith("closed");
  });

  it("does not submit a parent form when switching options", async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const { user } = renderWithProviders(
      <form onSubmit={onSubmit}>
        <SegmentedControl
          options={[
            { value: "active", label: ACTIVE },
            { value: "closed", label: CLOSED },
          ]}
          value="active"
          onChange={vi.fn()}
        />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: CLOSED }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
