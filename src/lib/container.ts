import { InMemoryQueryBus, InMemoryEventBus } from "@/modules/shared";
import { createActivityContextsModule } from "@/modules/activity-context";
import { createAdminModule } from "@/modules/admin";
import {
  createJobAnalysisChatModule,
  registerJobAnalysisChatQueries,
} from "@/modules/job-analysis-chat";
import { createCVChatModule } from "@/modules/cv-chat";
import {
  createCVAnalysisModule,
  GetCVAnalysisByIdQuery,
  GetCVAnalysisByIdQueryHandler,
  ListCVAnalysesQuery,
  ListCVAnalysesQueryHandler,
  ListCVAnalysisUsageByDocumentQuery,
  ListCVAnalysisUsageByDocumentQueryHandler,
} from "@/modules/cv-analysis";
import { createCVLibraryModule } from "@/modules/cv-library";
import {
  createCommitmentsModule,
  ListCommitmentsInRangeQuery,
  ListCommitmentsInRangeQueryHandler,
} from "@/modules/commitments";
import { createFeedbackNotesModule } from "@/modules/feedback-notes";
import { createPerformanceReviewModule } from "@/modules/performance-review";
import {
  createJobMatchAnalysisModule,
  GetJobMatchAnalysisByIdQuery,
  GetJobMatchAnalysisByIdQueryHandler,
  ListJobMatchAnalysesQuery,
  ListJobMatchAnalysesQueryHandler,
  ListJobMatchAnalysisUsageByDocumentQuery,
  ListJobMatchAnalysisUsageByDocumentQueryHandler,
} from "@/modules/job-match-analysis";
import {
  createReceivedFeedbackModule,
  ListReceivedFeedbackInRangeQuery,
  ListReceivedFeedbackInRangeQueryHandler,
} from "@/modules/received-feedback";
import { createSelectionProcessModule } from "@/modules/selection-process";
import {
  createWorkJournalModule,
  ListJournalEntriesInRangeQuery,
  ListJournalEntriesInRangeQueryHandler,
} from "@/modules/work-journal";
import { telemetry } from "@/lib/telemetry";
import { createAIInteractionsModule } from "@/modules/ai-interactions";
import { createAdminClient } from "@/lib/supabase/admin";

const eventBus = new InMemoryEventBus(telemetry);
const queryBus = new InMemoryQueryBus(telemetry);
export const aiInteractionsModule = createAIInteractionsModule(eventBus);
aiInteractionsModule.bindRequest(createAdminClient());

export const activityContextsModule = createActivityContextsModule(
  telemetry,
  eventBus,
);
export const adminModule = createAdminModule(telemetry);
export const cvAnalysisModule = createCVAnalysisModule(telemetry, eventBus);
export const cvLibraryModule = createCVLibraryModule(
  queryBus,
  telemetry,
  eventBus,
);
export const commitmentsModule = createCommitmentsModule(telemetry, eventBus);
export const feedbackNotesModule = createFeedbackNotesModule(
  telemetry,
  eventBus,
);
export const jobMatchAnalysisModule = createJobMatchAnalysisModule(
  telemetry,
  eventBus,
);
export const receivedFeedbackModule = createReceivedFeedbackModule(
  telemetry,
  eventBus,
);
export const selectionProcessModule = createSelectionProcessModule(
  telemetry,
  eventBus,
);
export const workJournalModule = createWorkJournalModule(telemetry, eventBus);
export const performanceReviewModule = createPerformanceReviewModule(
  queryBus,
  telemetry,
  eventBus,
);

queryBus.register(
  ListJournalEntriesInRangeQuery.queryName,
  new ListJournalEntriesInRangeQueryHandler(
    workJournalModule.listJournalEntriesInRange,
  ),
);
queryBus.register(
  ListReceivedFeedbackInRangeQuery.queryName,
  new ListReceivedFeedbackInRangeQueryHandler(
    receivedFeedbackModule.listReceivedFeedbackInRange,
  ),
);
queryBus.register(
  ListCommitmentsInRangeQuery.queryName,
  new ListCommitmentsInRangeQueryHandler(
    commitmentsModule.listCommitmentsInRange,
  ),
);

queryBus.register(
  GetCVAnalysisByIdQuery.queryName,
  new GetCVAnalysisByIdQueryHandler(cvAnalysisModule.getCVAnalysisById),
);
queryBus.register(
  ListCVAnalysesQuery.queryName,
  new ListCVAnalysesQueryHandler(cvAnalysisModule.listCVAnalyses),
);
queryBus.register(
  ListCVAnalysisUsageByDocumentQuery.queryName,
  new ListCVAnalysisUsageByDocumentQueryHandler(
    cvAnalysisModule.listCVAnalysisUsageByDocument,
  ),
);
queryBus.register(
  GetJobMatchAnalysisByIdQuery.queryName,
  new GetJobMatchAnalysisByIdQueryHandler(
    jobMatchAnalysisModule.getJobMatchAnalysisById,
  ),
);
queryBus.register(
  ListJobMatchAnalysesQuery.queryName,
  new ListJobMatchAnalysesQueryHandler(
    jobMatchAnalysisModule.listJobMatchAnalyses,
  ),
);
queryBus.register(
  ListJobMatchAnalysisUsageByDocumentQuery.queryName,
  new ListJobMatchAnalysisUsageByDocumentQueryHandler(
    jobMatchAnalysisModule.listJobMatchAnalysisUsageByDocument,
  ),
);

const _jobAnalysisChatModule = createJobAnalysisChatModule(
  queryBus,
  telemetry,
  eventBus,
);
const originalBind = _jobAnalysisChatModule.bindRequest.bind(_jobAnalysisChatModule);
_jobAnalysisChatModule.bindRequest = (client) => {
  cvAnalysisModule.bindRequest(client);
  jobMatchAnalysisModule.bindRequest(client);
  return originalBind(client);
};
export const jobAnalysisChatModule = _jobAnalysisChatModule;
registerJobAnalysisChatQueries(queryBus, jobAnalysisChatModule);
export const cvChatModule = createCVChatModule(telemetry, eventBus);
