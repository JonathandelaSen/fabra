import { createRef } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/frontend/testing/render";
import { getMessages } from "@/frontend/i18n/messages";
import { SearchInput } from "./search-input";

const PLACEHOLDER = getMessages("en").receivedFeedback.placeholders.search;

describe("SearchInput", () => {
  it("reports typed search text to the consumer", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <SearchInput value="" onChange={onChange} placeholder={PLACEHOLDER} />,
    );

    await user.type(screen.getByPlaceholderText(PLACEHOLDER), "cv");

    expect(onChange).toHaveBeenNthCalledWith(1, "c");
    expect(onChange).toHaveBeenNthCalledWith(2, "v");
  });

  it("forwards the input ref and renders the configured shortcut", () => {
    const inputRef = createRef<HTMLInputElement>();
    renderWithProviders(
      <SearchInput
        value=""
        onChange={vi.fn()}
        placeholder={PLACEHOLDER}
        shortcutKey="F"
        inputRef={inputRef}
      />,
    );

    expect(inputRef.current).toBe(screen.getByPlaceholderText(PLACEHOLDER));
    expect(screen.getByText("F")).toBeInTheDocument();
  });

  it("omits shortcut UI when the shortcut is disabled", () => {
    const { container } = renderWithProviders(
      <SearchInput
        value=""
        onChange={vi.fn()}
        placeholder={PLACEHOLDER}
        shortcutKey=""
      />,
    );

    expect(container.querySelector("kbd")).not.toBeInTheDocument();
  });
});
