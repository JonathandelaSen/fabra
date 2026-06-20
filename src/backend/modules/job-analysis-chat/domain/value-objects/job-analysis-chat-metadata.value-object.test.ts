import { describe, expect, it } from "vitest";
import { JobAnalysisChatMetadata } from "./job-analysis-chat-metadata.value-object";

describe("JobAnalysisChatMetadata", () => {
  it("round-trips metadata", () => {
    const metadata = JobAnalysisChatMetadata.fromPrimitives({ requestId: "req-1" });

    expect(metadata.toPrimitives()).toEqual({ requestId: "req-1" });
  });

  it("allows null when no metadata is attached", () => {
    expect(JobAnalysisChatMetadata.fromPrimitives(null).toPrimitives()).toBeNull();
  });

  it("returns a copy of metadata primitives", () => {
    const metadata = JobAnalysisChatMetadata.fromPrimitives({ requestId: "req-1" });
    const primitives = metadata.toPrimitives();

    if (primitives) primitives.requestId = "changed";

    expect(metadata.toPrimitives()).toEqual({ requestId: "req-1" });
  });
});
