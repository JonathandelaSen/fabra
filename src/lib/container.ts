import { InMemoryQueryBus } from "@/modules/shared";
import {
  createActivityContextsModule,
} from "@/modules/activity-context";
import { createAdminModule } from "@/modules/admin";
import {
  createAnalysisChatModule,
  registerAnalysisChatQueries,
} from "@/modules/analysis-chat";
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
import { createCommitmentsModule } from "@/modules/commitments";
import { createFeedbackNotesModule } from "@/modules/feedback-notes";
import {
  createJobMatchAnalysisModule,
  GetJobMatchAnalysisByIdQuery,
  GetJobMatchAnalysisByIdQueryHandler,
  ListJobMatchAnalysesQuery,
  ListJobMatchAnalysesQueryHandler,
  ListJobMatchAnalysisUsageByDocumentQuery,
  ListJobMatchAnalysisUsageByDocumentQueryHandler,
} from "@/modules/job-match-analysis";
import { createReceivedFeedbackModule } from "@/modules/received-feedback";
import { createSelectionProcessModule } from "@/modules/selection-process";
import { createWorkJournalModule } from "@/modules/work-journal";
import { telemetry } from "@/lib/telemetry";

const queryBus = new InMemoryQueryBus(telemetry);

export const activityContextsModule = createActivityContextsModule(telemetry);
export const adminModule = createAdminModule(telemetry);
export const cvAnalysisModule = createCVAnalysisModule(telemetry);
export const cvLibraryModule = createCVLibraryModule(queryBus, telemetry);
export const commitmentsModule = createCommitmentsModule(telemetry);
export const feedbackNotesModule = createFeedbackNotesModule(telemetry);
export const jobMatchAnalysisModule = createJobMatchAnalysisModule(telemetry);
export const receivedFeedbackModule = createReceivedFeedbackModule(telemetry);
export const selectionProcessModule = createSelectionProcessModule(telemetry);
export const workJournalModule = createWorkJournalModule(telemetry);

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
  new GetJobMatchAnalysisByIdQueryHandler(jobMatchAnalysisModule.getJobMatchAnalysisById),
);
queryBus.register(
  ListJobMatchAnalysesQuery.queryName,
  new ListJobMatchAnalysesQueryHandler(jobMatchAnalysisModule.listJobMatchAnalyses),
);
queryBus.register(
  ListJobMatchAnalysisUsageByDocumentQuery.queryName,
  new ListJobMatchAnalysisUsageByDocumentQueryHandler(
    jobMatchAnalysisModule.listJobMatchAnalysisUsageByDocument,
  ),
);

const _analysisChatModule = createAnalysisChatModule(queryBus, telemetry);
const originalBind = _analysisChatModule.bindRequest.bind(_analysisChatModule);
_analysisChatModule.bindRequest = (client) => {
  cvAnalysisModule.bindRequest(client);
  jobMatchAnalysisModule.bindRequest(client);
  return originalBind(client);
};
export const analysisChatModule = _analysisChatModule;
registerAnalysisChatQueries(queryBus, analysisChatModule);
