import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/frontend/components/shared/i18n-provider";
import { CVInlineMarkdownField } from "./cv-inline-markdown-field";

function renderField(
  value = "manual formatting",
  onChange = vi.fn()
) {
  render(
    <I18nProvider initialLocale="en">
      <CVInlineMarkdownField value={value} onChange={onChange} multiline={false} />
    </I18nProvider>
  );
  return onChange;
}

describe("CVInlineMarkdownField", () => {
  it.each([
    ["Bold", "**manual** formatting"],
    ["Italic", "*manual* formatting"],
    ["Bold italic", "***manual*** formatting"],
  ])("wraps selected text with %s markdown", async (label, expected) => {
    const user = userEvent.setup();
    const onChange = renderField();
    const input = screen.getByRole("textbox") as HTMLInputElement;

    input.setSelectionRange(0, "manual".length);
    await user.click(screen.getByRole("button", { name: label }));

    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it("inserts an explicit markdown link around selected text", async () => {
    const user = userEvent.setup();
    const onChange = renderField();
    const input = screen.getByRole("textbox") as HTMLInputElement;

    input.setSelectionRange(0, "manual".length);
    await user.click(screen.getByRole("button", { name: "Link" }));

    expect(onChange).toHaveBeenCalledWith("[manual](https://example.com) formatting");
  });

  it("keeps focus and selects inserted fallback text when there is no selection", async () => {
    const user = userEvent.setup();
    const onChange = renderField("");
    const input = screen.getByRole("textbox") as HTMLInputElement;

    input.setSelectionRange(0, 0);
    await user.click(screen.getByRole("button", { name: "Bold italic" }));

    expect(onChange).toHaveBeenCalledWith("***text***");
    await waitFor(() => expect(input).toHaveFocus());
  });
});
