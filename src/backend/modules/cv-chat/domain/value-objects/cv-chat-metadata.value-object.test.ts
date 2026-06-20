import { describe, expect, it } from "vitest";
import { CVChatMetadata } from "./cv-chat-metadata.value-object";

describe("CVChatMetadata", () => {
  it("round-trips metadata", () => {
    const metadata = CVChatMetadata.fromPrimitives({ requestId: "req-1" });

    expect(metadata.toPrimitives()).toEqual({ requestId: "req-1" });
  });

  it("allows null when no metadata is attached", () => {
    expect(CVChatMetadata.fromPrimitives(null).toPrimitives()).toBeNull();
  });

  it("returns a copy of metadata primitives", () => {
    const metadata = CVChatMetadata.fromPrimitives({ requestId: "req-1" });
    const primitives = metadata.toPrimitives();

    if (primitives) primitives.requestId = "changed";

    expect(metadata.toPrimitives()).toEqual({ requestId: "req-1" });
  });
});
