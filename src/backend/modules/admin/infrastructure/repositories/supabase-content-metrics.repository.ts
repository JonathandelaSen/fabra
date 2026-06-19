import { createAdminClient } from "@/lib/supabase/admin";
import type { ContentMetricsRepository } from "../../domain/repositories/content-metrics.repository";
import { ContentMetricsWindow } from "../../domain/value-objects/content-metrics-window.value-object";
import { CVContentMetrics } from "../../domain/value-objects/cv-content-metrics.value-object";
import { AnalysisContentMetrics } from "../../domain/value-objects/analysis-content-metrics.value-object";
import { OpportunitiesContentMetrics } from "../../domain/value-objects/opportunities-content-metrics.value-object";
import { FeedbackContentMetrics } from "../../domain/value-objects/feedback-content-metrics.value-object";
import { WorkspaceContentMetrics } from "../../domain/value-objects/workspace-content-metrics.value-object";

export class SupabaseContentMetricsRepository implements ContentMetricsRepository {
  private async countTable(table: string, window: ContentMetricsWindow): Promise<number> {
    const admin = createAdminClient();
    let query = admin.from(table).select("*", { count: "exact", head: true });
    
    if (window.since) {
      query = query.gte("created_at", window.since.toISOString());
    }
    
    const { count, error } = await query;
    if (error) {
      throw new Error(`Could not count ${table}: ${error.message}`);
    }
    return count ?? 0;
  }

  async countCVContent(window: ContentMetricsWindow): Promise<CVContentMetrics> {
    const [cvs, cvStructuredProfiles] = await Promise.all([
      this.countTable("cvs", window),
      this.countTable("cv_structured_profiles", window),
    ]);
    return CVContentMetrics.fromPrimitives({ cvs, cvStructuredProfiles });
  }

  async countAnalysisContent(window: ContentMetricsWindow): Promise<AnalysisContentMetrics> {
    const [jobMatchAnalyses, analysisChatConversations, analysisChatMessages, interviewQuestions] = await Promise.all([
      this.countTable("job_match_analyses", window),
      this.countTable("analysis_chat_conversations", window),
      this.countTable("analysis_chat_messages", window),
      this.countTable("interview_questions", window),
    ]);
    return AnalysisContentMetrics.fromPrimitives({
      jobMatchAnalyses,
      analysisChatConversations,
      analysisChatMessages,
      interviewQuestions,
    });
  }

  async countOpportunitiesContent(window: ContentMetricsWindow): Promise<OpportunitiesContentMetrics> {
    const [jobOpportunities, processQuestions] = await Promise.all([
      this.countTable("job_opportunities", window),
      this.countTable("process_questions", window),
    ]);
    return OpportunitiesContentMetrics.fromPrimitives({ jobOpportunities, processQuestions });
  }

  async countFeedbackContent(window: ContentMetricsWindow): Promise<FeedbackContentMetrics> {
    const [feedbackNotesFeedbacks, receivedFeedback] = await Promise.all([
      this.countTable("feedback_notes_feedbacks", window),
      this.countTable("received_feedback", window),
    ]);
    return FeedbackContentMetrics.fromPrimitives({ feedbackNotesFeedbacks, receivedFeedback });
  }

  async countWorkspaceContent(window: ContentMetricsWindow): Promise<WorkspaceContentMetrics> {
    const [workJournalEntries, commitments, activityContexts] = await Promise.all([
      this.countTable("work_journal_entries", window),
      this.countTable("commitments", window),
      this.countTable("activity_contexts", window),
    ]);
    return WorkspaceContentMetrics.fromPrimitives({
      workJournalEntries,
      commitments,
      activityContexts,
    });
  }
}
