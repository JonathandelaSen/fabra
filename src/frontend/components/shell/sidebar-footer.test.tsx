import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/testing/render";
import SidebarFooter from "./sidebar-footer";

function renderFooter(
  overrides: Partial<React.ComponentProps<typeof SidebarFooter>> = {},
) {
  const props: React.ComponentProps<typeof SidebarFooter> = {
    activeView: "settings",
    collapsed: false,
    isAdmin: false,
    userEmail: "user@example.com",
    settingsLabel: "Settings",
    adminLabel: "Admin",
    onOpenSettings: vi.fn(),
    onOpenAdmin: vi.fn(),
    ...overrides,
  };
  return { props, ...renderWithProviders(<SidebarFooter {...props} />) };
}

describe("SidebarFooter", () => {
  it("renders the settings entry and the user email when expanded", () => {
    renderFooter();

    expect(
      screen.getByRole("button", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("calls onOpenSettings when the settings button is clicked", async () => {
    const { props, user } = renderFooter();

    await user.click(screen.getByRole("button", { name: "Settings" }));

    expect(props.onOpenSettings).toHaveBeenCalledOnce();
  });

  it("hides the admin entry for non-admin users", () => {
    renderFooter({ isAdmin: false });

    expect(
      screen.queryByRole("button", { name: "Admin" }),
    ).not.toBeInTheDocument();
  });

  it("shows the admin entry and wires its handler for admin users", async () => {
    const { props, user } = renderFooter({ isAdmin: true });

    const adminButton = screen.getByRole("button", { name: "Admin" });
    expect(adminButton).toBeInTheDocument();

    await user.click(adminButton);

    expect(props.onOpenAdmin).toHaveBeenCalledOnce();
  });

  it("hides the email and label text when collapsed but keeps the settings button", () => {
    renderFooter({ collapsed: true });

    expect(screen.queryByText("user@example.com")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();

    const settingsButton = screen.getByRole("button", { name: "Settings" });
    expect(settingsButton).toHaveAttribute("title", "Settings");
  });
});
