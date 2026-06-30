import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { server } from "@/frontend/testing/msw/server";
import { TabPeople } from "./tab-people";

const path = "http://localhost/api/job-match-analyses/analysis-1/people";

describe("TabPeople", () => {
  it("shows a useful empty state", async () => {
    server.use(http.get(path, () => HttpResponse.json([])));

    renderWithProviders(
      <TabPeople analysisId="analysis-1" onPrepareConversation={vi.fn()} />,
    );

    expect(
      await screen.findByText("No people added yet"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Keep the people behind the hiring process close at hand."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add person" })).toBeInTheDocument();
  });

  it("hands a selected person to conversation preparation", async () => {
    server.use(
      http.get(path, () =>
        HttpResponse.json([
          {
            id: "person-1",
            name: "Marta García",
            role: "hiring_manager",
            jobTitle: null,
            organization: null,
            email: null,
            phone: null,
            links: [],
            notes: null,
            createdAt: "2026-06-30T09:00:00.000Z",
            updatedAt: "2026-06-30T09:00:00.000Z",
          },
        ]),
      ),
    );
    const onPrepareConversation = vi.fn();
    const { user } = renderWithProviders(
      <TabPeople
        analysisId="analysis-1"
        onPrepareConversation={onPrepareConversation}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("Marta García")).toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", { name: "Prepare conversation" }),
    );

    expect(onPrepareConversation).toHaveBeenCalledWith("Marta García");
  });
});
