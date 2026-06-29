import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import TabFollowUp from "./tab-follow-up";

vi.mock("@/frontend/components/shared/formatted-date", () => ({
  FormattedDate: ({ value }: { value: string }) => <span>{value}</span>,
}));

const entries = [
  {
    id: "entry-new",
    status: "interview" as const,
    title: "Technical interview",
    notes: "Pairing exercise",
    nextAction: "Send thank-you note",
    nextActionAt: "2026-06-30T09:00:00.000Z",
    occurredAt: "2026-06-29T10:00:00.000Z",
    createdAt: "2026-06-29T10:05:00.000Z",
    updatedAt: "2026-06-29T10:05:00.000Z",
  },
  {
    id: "entry-old",
    status: "applied" as const,
    title: null,
    notes: "Application sent",
    nextAction: null,
    nextActionAt: null,
    occurredAt: "2026-06-20T10:00:00.000Z",
    createdAt: "2026-06-20T10:00:00.000Z",
    updatedAt: "2026-06-20T10:00:00.000Z",
  },
];

describe("TabFollowUp", () => {
  it("renders persistent history and creates a minimal update", async () => {
    const onCreateEntry = vi.fn(async () => {});
    const { user } = renderWithProviders(
      <TabFollowUp
        currentStatus="interview"
        entries={entries}
        isSaving={false}
        onCreateEntry={onCreateEntry}
        onUpdateEntry={vi.fn(async () => {})}
        onDeleteEntry={vi.fn(async () => {})}
      />,
    );

    expect(screen.getByText("Technical interview")).toBeInTheDocument();
    expect(screen.getByText("Application sent")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New update" }));
    await user.click(screen.getByRole("button", { name: "Save update" }));

    expect(onCreateEntry).toHaveBeenCalledOnce();
    expect(onCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "interview",
        title: null,
        notes: null,
        nextAction: null,
        nextActionAt: null,
        updateCurrentStatus: false,
      }),
    );
  });

  it("offers an explicit current-status update when the selected status changes", async () => {
    const onCreateEntry = vi.fn(async () => {});
    const { user } = renderWithProviders(
      <TabFollowUp
        currentStatus="interview"
        entries={entries}
        isSaving={false}
        onCreateEntry={onCreateEntry}
        onUpdateEntry={vi.fn(async () => {})}
        onDeleteEntry={vi.fn(async () => {})}
      />,
    );

    await user.click(screen.getByRole("button", { name: "New update" }));
    await user.selectOptions(screen.getByLabelText("Status"), "offer");
    const updateStatus = screen.getByRole("checkbox", {
      name: "Also update the current status",
    });
    expect(updateStatus).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Save update" }));

    expect(onCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "offer",
        updateCurrentStatus: true,
      }),
    );
  });
});
