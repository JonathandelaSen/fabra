import { describe, expect, it, vi } from "vitest";
import {
  ListCVAnalysisUsageByDocumentQuery,
} from "@/modules/cv-analysis";
import { ListJobMatchAnalysisUsageByDocumentQuery } from "@/modules/job-match-analysis";
import type { Query, QueryBus } from "@/modules/shared";
import { documentRepo } from "./cv-library-test-helpers.test";
import { DeleteCVDocumentUseCase } from "./delete-cv-document.use-case";

function queryBus(
  results: Record<string, unknown> = {},
) {
  return {
    execute: async <TResult>(query: Query<unknown, TResult>): Promise<TResult> =>
      (results[query.queryName] ?? []) as TResult,
  } satisfies QueryBus;
}

describe("DeleteCVDocumentUseCase", () => {
  it("blocks uploaded document deletion when analyses still use it", async () => {
    const repo = documentRepo();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new DeleteCVDocumentUseCase({
      documentRepo: repo,
      queryBus: queryBus({
        [ListCVAnalysisUsageByDocumentQuery.queryName]: [
          {
            id: "analysis-1",
            cv_id: "cv-1",
            title: "Analysis",
            filename: "cv.pdf",
            created_at: "2026-05-13T10:00:00.000Z",
            analysis_mode: "general",
            ai_score: null,
            ai_analyzed_at: null,
            job_url: null,
            offer_status: null,
            offer_next_action_at: null,
          },
        ],
      }),
      eventBus: eventBus as never,
    }).execute({ id: "cv-1", userId: "user-1" });

    expect(result.status).toBe("in_use");
    expect(repo.delete).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("deletes storage and the document when not in use and publishes events", async () => {
    const repo = documentRepo();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const result = await new DeleteCVDocumentUseCase({
      documentRepo: repo,
      queryBus: queryBus(),
      eventBus: eventBus as never,
    }).execute({ id: "cv-1", userId: "user-1" });

    expect(result.status).toBe("deleted");
    expect(repo.deleteStoredPdf).toHaveBeenCalledWith("user-1/cv-1.pdf");
    expect(repo.delete).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_document_deleted");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      documentId: "cv-1",
    });
  });

  it("checks both analysis modules through the query bus before deleting", async () => {
    const executed: string[] = [];
    const repo = documentRepo();
    const bus = {
      execute: async <TResult>(query: Query<unknown, TResult>): Promise<TResult> => {
        executed.push(query.queryName);
        return [] as unknown as TResult;
      },
    } satisfies QueryBus;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    await new DeleteCVDocumentUseCase({
      documentRepo: repo,
      queryBus: bus,
      eventBus: eventBus as never,
    }).execute({ id: "cv-1", userId: "user-1" });

    expect(executed).toEqual([
      ListCVAnalysisUsageByDocumentQuery.queryName,
      ListJobMatchAnalysisUsageByDocumentQuery.queryName,
    ]);
  });
});
