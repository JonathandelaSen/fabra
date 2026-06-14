import { describe, expect, it } from "vitest";
import { SendMessageUseCase } from "./send-message.use-case";

describe("SendMessageUseCase", () => {
  it("is defined as the integrated CV chat workflow", () => {
    expect(SendMessageUseCase).toBeDefined();
  });
});
