import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./msw/server";

const originalFetch = globalThis.fetch;

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  const interceptedFetch = globalThis.fetch;

  globalThis.fetch = (input, init) => {
    if (typeof input === "string" && input.startsWith("/")) {
      return interceptedFetch(new URL(input, window.location.href), init);
    }

    if (input instanceof Request && input.url.startsWith(window.location.origin)) {
      return interceptedFetch(input, init);
    }

    return interceptedFetch(input, init);
  };
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  globalThis.fetch = originalFetch;
  server.close();
});
