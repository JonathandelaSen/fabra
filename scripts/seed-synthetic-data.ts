import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { faker } from "@faker-js/faker";
import {
  InMemoryEventBus,
  InMemoryQueryBus,
  NoOpTelemetry,
} from "@/modules/shared";
import { createActivityContextsModule } from "@/modules/activity-context";
import { createCVLibraryE2EModule } from "@/modules/cv-library/cv-library.e2e.module";
import {
  createCVAnalysisModule,
  GetCVAnalysisByIdQuery,
  GetCVAnalysisByIdQueryHandler,
} from "@/modules/cv-analysis";
import {
  createJobMatchAnalysisModule,
  GetJobMatchAnalysisByIdQuery,
  GetJobMatchAnalysisByIdQueryHandler,
} from "@/modules/job-match-analysis";
import {
  createAnalysisChatModule,
  registerAnalysisChatQueries,
} from "@/modules/analysis-chat";
import { createFeedbackNotesModule } from "@/modules/feedback-notes";
import { createReceivedFeedbackModule } from "@/modules/received-feedback";
import { createWorkJournalModule } from "@/modules/work-journal";
import { createCommitmentsModule } from "@/modules/commitments";
import { createSelectionProcessModule } from "@/modules/selection-process";
import { CVDocumentFixture } from "@/modules/cv-library/test-helpers/cv-document.fixture";
import { CVAnalysisFixture } from "@/modules/cv-analysis/test-helpers/cv-analysis.fixture";
import { JobMatchAnalysisFixture } from "@/modules/job-match-analysis/test-helpers/job-match-analysis.fixture";
import { FeedbackFixture } from "@/modules/feedback-notes/test-helpers/feedback.fixture";
import { ReceivedFeedbackFixture } from "@/modules/received-feedback/test-helpers/received-feedback.fixture";
import { WorkJournalEntryFixture } from "@/modules/work-journal/test-helpers/work-journal-entry.fixture";
import { CommitmentFixture } from "@/modules/commitments/test-helpers/commitment.fixture";
import { SelectionProcessFixture } from "@/modules/selection-process/test-helpers/selection-process.fixture";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
function parseArgs(): { email: string; password: string } {
  const args = process.argv.slice(2);
  let email = "agent-test@example.com";
  let password = "agent-test-password";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) email = args[++i];
    else if (args[i] === "--password" && args[i + 1]) password = args[++i];
  }
  return { email, password };
}

const { email: EMAIL, password: PASSWORD } = parseArgs();

const COUNTS = {
  activityContexts: 8,
  cvs: 5,
  cvAnalysesPerCV: 2,
  jobOpportunities: 40,
  jobMatchAnalysesPerOpp: 1,
  feedbackNotes: 50,
  entriesPerFeedback: { min: 1, max: 5 },
  receivedFeedback: 15,
  workJournalEntries: 100,
  commitmentContexts: 3,
  commitmentsPerContext: { min: 2, max: 5 },
  itemsPerCommitment: { min: 2, max: 5 },
  outcomesPerCommitment: { min: 0, max: 2 },
  processQuestionsPerOpp: { min: 1, max: 4 },
};

const DEMO_OFFER_STATUSES = [
  "interesting",
  "applied",
  "interview",
  "offer",
  "rejected",
  "discarded",
] as const;

const DEMO_AI_MODEL = "Fabra Demo Review v1";
const CV_ANALYSIS_CONTEXTS = [
  "Targeting senior product engineering roles with platform ownership.",
  "Targeting backend platform roles with reliability and observability scope.",
  "Targeting frontend architecture roles with design-system leadership.",
  "Targeting staff-level engineering roles with mentoring and roadmap influence.",
  "Targeting full-stack roles in B2B SaaS with measurable delivery outcomes.",
] as const;
const CREATE_JOB_MATCH_CHATS = false;
const DEMO_CHAT_MESSAGES = [
  {
    user: "Which parts of my profile are strongest for this role?",
    assistant:
      "Your strongest angle is the overlap between product engineering, TypeScript delivery, and cross-functional ownership. Lead with a recent example where you connected technical decisions to user or business outcomes.",
  },
  {
    user: "What should I prepare before applying?",
    assistant:
      "Prepare a short version of your platform impact story, one metric-backed delivery example, and a concise explanation of how your current CV maps to the role's top requirements.",
  },
  {
    user: "Are there any gaps I should address?",
    assistant:
      "The main gap is specificity. Add role-relevant metrics, name the systems you owned, and make any missing domain experience explicit through adjacent projects or learning signals.",
  },
] as const;

// ---------------------------------------------------------------------------
// Modules (singleton, wired once)
// ---------------------------------------------------------------------------
const telemetry = new NoOpTelemetry();
const eventBus = new InMemoryEventBus(telemetry);
const queryBus = new InMemoryQueryBus(telemetry);
const activityModule = createActivityContextsModule(telemetry, eventBus);
const cvLibraryE2E = createCVLibraryE2EModule(queryBus, telemetry, eventBus);
const cvAnalysisModule = createCVAnalysisModule(telemetry, eventBus);
const jobMatchModule = createJobMatchAnalysisModule(telemetry, eventBus);
const analysisChatModule = createAnalysisChatModule(queryBus, telemetry, eventBus);
const feedbackNotesModule = createFeedbackNotesModule(telemetry, eventBus);
const receivedFeedbackModule = createReceivedFeedbackModule(telemetry, eventBus);
const workJournalModule = createWorkJournalModule(telemetry, eventBus);
const commitmentsModule = createCommitmentsModule(telemetry, eventBus);
const selectionProcessModule = createSelectionProcessModule(telemetry);

// Register query handlers needed by analysis-chat
queryBus.register(
  GetCVAnalysisByIdQuery.queryName,
  new GetCVAnalysisByIdQueryHandler(cvAnalysisModule.getCVAnalysisById),
);
queryBus.register(
  GetJobMatchAnalysisByIdQuery.queryName,
  new GetJobMatchAnalysisByIdQueryHandler(jobMatchModule.getJobMatchAnalysisById),
);
registerAnalysisChatQueries(queryBus, analysisChatModule);

function bindAll(client: SupabaseClient) {
  activityModule.bindRequest(client);
  cvLibraryE2E.bindRequest(client);
  cvAnalysisModule.bindRequest(client);
  jobMatchModule.bindRequest(client);
  analysisChatModule.bindRequest(client);
  feedbackNotesModule.bindRequest(client);
  receivedFeedbackModule.bindRequest(client);
  workJournalModule.bindRequest(client);
  commitmentsModule.bindRequest(client);
  selectionProcessModule.bindRequest(client);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function log(msg: string) {
  process.stdout.write(`  ${msg}\n`);
}

function getFixtureCVPaths(): string[] {
  const dir = path.resolve(__dirname, "../.test-infra/fixtures/cvs");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".pdf"))
    .map((f) => path.join(dir, f));
}

// Suppress structured JSON logs from EventTracker/observability
const _origLog = console.log;
const _origError = console.error;
console.log = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith('{"event"')) return;
  _origLog(...args);
};
console.error = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith('{"event"')) return;
  _origError(...args);
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !serviceRoleKey || !anonKey) {
    console.error(
      "Error: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) must be set.",
    );
    process.exit(1);
  }

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // -----------------------------------------------------------------------
  // 1. Ensure test user
  // -----------------------------------------------------------------------
  console.log(`\nSeeding synthetic data for ${EMAIL}\n`);
  log("Ensuring test user...");
  let userId: string;
  {
    let foundUser = null;
    let page = 1;
    while (true) {
      const {
        data: { users },
        error,
      } = await adminClient.auth.admin.listUsers({ page, perPage: 100 });
      if (error) {
        console.error("Error listing users:", error.message);
        process.exit(1);
      }
      if (!users || users.length === 0) break;
      foundUser = users.find((u) => u.email === EMAIL);
      if (foundUser) break;
      page++;
    }

    if (!foundUser) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
      });
      if (error) {
        console.error("Error creating user:", error.message);
        process.exit(1);
      }
      foundUser = data.user;
      log(`User created: ${foundUser.id}`);
    } else {
      log(`User found: ${foundUser.id}`);
    }
    userId = foundUser.id;
  }

  // -----------------------------------------------------------------------
  // 2. Cleanup previous data
  // -----------------------------------------------------------------------
  log("Cleaning up old data...");
  const deletionOrder = [
    "analysis_chat_messages",
    "analysis_chat_conversations",
    "process_questions",
    "follow_ups",
    "job_match_analyses",
    "job_opportunities",
    "cv_analyses",
    "cv_structured_profiles",
    "cvs",
    "work_journal_entries",
    "feedback_notes_entries",
    "feedback_notes_feedbacks",
    "received_feedback",
    "commitment_items",
    "commitment_outcomes",
    "commitments",
    "user_preferences",
    "activity_contexts",
  ];
  for (const table of deletionOrder) {
    await adminClient.from(table).delete().eq("user_id", userId);
  }
  ;

  // -----------------------------------------------------------------------
  // 3. Sign in as user (RLS-safe client)
  // -----------------------------------------------------------------------
  log("Signing in as test user...");
  const userClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInErr } = await userClient.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });
  if (signInErr) {
    console.error("Sign-in failed:", signInErr.message);
    process.exit(1);
  }

  bindAll(userClient);

  // Also set user preferences
  await adminClient
    .from("user_preferences")
    .upsert({ user_id: userId, interface_language: "en" }, { onConflict: "user_id" });

  // -----------------------------------------------------------------------
  // 4. Activity Contexts
  // -----------------------------------------------------------------------
  log("Creating activity contexts...");
  const contextIds: string[] = [];

  // Default context is auto-created by some modules; create named ones
  const contextNames = [
    { type: "employment" as const, name: "Senior Platform Job Search" },
    { type: "employment" as const, name: "Current Role - Staff Engineer" },
    { type: "project" as const, name: "AI Resume Checker" },
    { type: "project" as const, name: "Open Source CLI Toolkit" },
    { type: "personal" as const, name: "Leadership Development" },
    { type: "personal" as const, name: "Cloud Certifications" },
    { type: "other" as const, name: "Networking and Conferences" },
    { type: "other" as const, name: "Mentoring Junior Developers" },
  ];

  for (const ctx of contextNames.slice(0, COUNTS.activityContexts)) {
    const result = await activityModule.createActivityContext.execute({
      userId,
      type: ctx.type,
      name: ctx.name,
    });
    contextIds.push(result.toPrimitives().id);
  }

  // Get default context
  const allContexts = await activityModule.listActivityContexts.execute(userId);
  const defaultCtx = allContexts.find((c) => c.toPrimitives().isDefault);
  if (defaultCtx) contextIds.unshift(defaultCtx.toPrimitives().id);

  log(`  ${contextIds.length} contexts`);

  // -----------------------------------------------------------------------
  // 5. CVs + Analyses
  // -----------------------------------------------------------------------
  log("Creating CVs + analyses...");
  const cvPaths = getFixtureCVPaths();
  const cvIds: string[] = [];
  const structuredProfileIds: string[] = [];

  for (let i = 0; i < COUNTS.cvs; i++) {
    const cvInput = CVDocumentFixture.createUploadedInput({ userId });

    // Upload real PDF to storage if available
    if (cvPaths.length > 0) {
      const pdfPath = faker.helpers.arrayElement(cvPaths);
      const buffer = fs.readFileSync(pdfPath);
      const storagePath = `${userId}/${cvInput.id}.pdf`;

      const { error: uploadErr } = await userClient.storage
        .from("cv-pdfs")
        .upload(storagePath, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (!uploadErr) {
        cvInput.pdfStoragePath = storagePath;
        cvInput.fileSize = buffer.length;
        cvInput.filename = path.basename(pdfPath);
      }
    }

    const cv = await cvLibraryE2E.createUploadedCVDocument.execute(cvInput);
    const cvPrimitives = cv.toPrimitives();
    cvIds.push(cvPrimitives.id);

    // Upsert a structured profile (mock)
    const profile = await cvLibraryE2E.structureCVProfileWithAI.execute({
      provider: "mock",
      model: DEMO_AI_MODEL,
      text: cvInput.textNode ?? "Mock text",
    });

    const sp = await cvLibraryE2E.upsertCVStructuredProfile.execute({
      userId,
      cvDocumentId: cvPrimitives.id,
      schemaVersion: profile.schemaVersion,
      sourceTextHash: crypto
        .createHash("sha256")
        .update(cvInput.textNode ?? "")
        .digest("hex"),
      aiModel: DEMO_AI_MODEL,
      profile: profile.profile,
    });
    structuredProfileIds.push(sp.toPrimitives().id);

    // Create CV analyses for this CV
    for (let a = 0; a < COUNTS.cvAnalysesPerCV; a++) {
      const analysisInput = CVAnalysisFixture.createInput({
        userId,
        cvDocumentId: cvPrimitives.id,
        cvStructuredProfileId: sp.toPrimitives().id,
        filename: cvInput.filename ?? "cv.pdf",
        fileSize: cvInput.fileSize,
        pdfStoragePath: cvInput.pdfStoragePath,
        extractedText: {
          textPython: cvInput.textPython,
          textPdfjs: cvInput.textPdfjs,
          textNode: cvInput.textNode,
          extractErrorPython: cvInput.extractErrorPython,
          extractErrorPdfjs: cvInput.extractErrorPdfjs,
          extractErrorNode: cvInput.extractErrorNode,
        },
      });

      const analysis =
        await cvAnalysisModule.createCVAnalysis.execute(analysisInput);

      // Score with mock provider
      await cvAnalysisModule.scoreCVAnalysis.execute({
        id: analysis.toPrimitives().id,
        userId,
        provider: "mock",
        model: DEMO_AI_MODEL,
        additionalContext:
          CV_ANALYSIS_CONTEXTS[
            (i * COUNTS.cvAnalysesPerCV + a) % CV_ANALYSIS_CONTEXTS.length
          ],
      });
    }
  }
  log(`  ${cvIds.length} CVs, ${cvIds.length * COUNTS.cvAnalysesPerCV} analyses`);

  // -----------------------------------------------------------------------
  // 6. Job Opportunities + Match Analyses + FollowUps + Questions
  // -----------------------------------------------------------------------
  log("Creating job opportunities + cascades...");
  let totalMatches = 0;
  let totalFollowUps = 0;
  let totalQuestions = 0;

  let totalChats = 0;

  for (let i = 0; i < COUNTS.jobOpportunities; i++) {
    const oppRow = SelectionProcessFixture.createJobOpportunityRow(userId);

    const { data: opp, error: oppErr } = await userClient
      .from("job_opportunities")
      .insert(oppRow)
      .select("id")
      .single();

    if (oppErr) {
      console.error("Error creating job opportunity:", oppErr.message);
      continue;
    }

    // Job Match Analysis for each opportunity
    const matchIds: string[] = [];
    for (let m = 0; m < COUNTS.jobMatchAnalysesPerOpp; m++) {
      const cvIdx = faker.number.int({ min: 0, max: cvIds.length - 1 });
      const matchInput = JobMatchAnalysisFixture.createInput({
        userId,
        cvDocumentId: cvIds[cvIdx],
        cvStructuredProfileId: structuredProfileIds[cvIdx],
        jobOpportunityId: opp.id,
        jobDescription: oppRow.description,
        jobUrl: oppRow.url,
      });

      const match =
        await jobMatchModule.createJobMatchAnalysis.execute(matchInput);
      const matchId = match.toPrimitives().id;
      matchIds.push(matchId);

      await jobMatchModule.scoreJobMatchAnalysis.execute({
        id: matchId,
        userId,
        provider: "mock",
        model: DEMO_AI_MODEL,
        jobDescription: oppRow.description,
        jobUrl: oppRow.url,
      });

      const { error: followUpErr } = await userClient.from("follow_ups").upsert(
        {
          user_id: userId,
          job_opportunity_id: opp.id,
          status: DEMO_OFFER_STATUSES[i % DEMO_OFFER_STATUSES.length],
          notes: faker.helpers.arrayElement([
            "Good fit; prioritize outreach this week.",
            "Need to validate team scope before applying.",
            "Interesting company, but compensation range needs review.",
            "Prepare a tighter story around product impact.",
          ]),
          next_action: faker.helpers.arrayElement([
            "Tailor CV summary",
            "Send recruiter follow-up",
            "Prepare interview questions",
            "Review role requirements",
          ]),
          next_action_at: new Date(
            Date.now() +
              faker.number.int({ min: 1, max: 21 }) * 86400000,
          ).toISOString(),
          source_job_match_analysis_id: matchId,
        },
        { onConflict: "user_id,job_opportunity_id" },
      );
      if (followUpErr) {
        console.error("Error creating follow-up:", followUpErr.message);
        continue;
      }

      // Enrich job_snapshot with real opportunity data (mock AI returns nulls)
      await userClient
        .from("job_match_analyses")
        .update({
          job_snapshot: {
            url: oppRow.url,
            description: oppRow.description,
            keyData: {
              title: oppRow.title,
              company: oppRow.company,
              location: oppRow.location,
              remote: oppRow.remote,
              salary: oppRow.salary,
              seniority: oppRow.seniority,
              contractType: oppRow.contract_type,
              benefits: oppRow.benefits,
              requirements: oppRow.requirements,
              responsibilities: oppRow.responsibilities,
              notablePoints: [
                "International team",
                "Mission-driven product",
              ],
            },
          },
        })
        .eq("id", matchId);

      if (CREATE_JOB_MATCH_CHATS && faker.datatype.boolean({ probability: 0.4 })) {
        const convo = await analysisChatModule.createConversation.execute({
          userId,
          analysisId: matchId,
          title: `Chat about ${oppRow.title} at ${oppRow.company}`,
          requestId: crypto.randomUUID(),
        });
        const convoId = convo.toPrimitives().id;

        const chatMessages = [
          "Which parts of my profile are strongest for this role?",
          "Which skills should I highlight during the interview?",
          "Are there any major gaps between my profile and the requirements?",
        ];
        const numMessages = faker.number.int({ min: 1, max: 3 });
        for (let cm = 0; cm < numMessages; cm++) {
          await analysisChatModule.sendMessage.execute({
            userId,
            analysisId: matchId,
            conversationId: convoId,
            message: chatMessages[cm],
            provider: "mock",
            model: DEMO_AI_MODEL,
            requestId: crypto.randomUUID(),
          });
        }
        totalChats++;
      }

      totalMatches++;
    }

    totalFollowUps += matchIds.length;

    // Process questions linked to job match analysis
    const numQuestions = faker.number.int(COUNTS.processQuestionsPerOpp);
    for (let q = 0; q < numQuestions; q++) {
      const qInput = SelectionProcessFixture.createProcessQuestionInput({
        userId,
        jobOpportunityId: opp.id,
        sourceJobMatchAnalysisId: matchIds.length > 0
          ? faker.helpers.arrayElement(matchIds)
          : undefined,
      });
      await selectionProcessModule.createProcessQuestion.execute(qInput);
      totalQuestions++;
    }
  }

  const { data: seededMatches, error: seededMatchesErr } = await adminClient
    .from("job_match_analyses")
    .select("id, job_opportunity_id, title")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (seededMatchesErr) {
    console.error("Error loading seeded job matches:", seededMatchesErr.message);
    process.exit(1);
  }

  for (const [index, match] of (seededMatches ?? []).entries()) {
    if (!match.job_opportunity_id) continue;
    const { error: linkErr } = await adminClient
      .from("follow_ups")
      .update({
        source_job_match_analysis_id: match.id,
        status: DEMO_OFFER_STATUSES[index % DEMO_OFFER_STATUSES.length],
      })
      .eq("user_id", userId)
      .eq("job_opportunity_id", match.job_opportunity_id);

    if (linkErr) {
      console.error("Error linking follow-up to job match:", linkErr.message);
      process.exit(1);
    }
  }

  for (const [index, match] of (seededMatches ?? []).entries()) {
    const conversationId = crypto.randomUUID();
    const now = new Date(Date.now() + index * 1000).toISOString();
    const { error: conversationErr } = await adminClient
      .from("analysis_chat_conversations")
      .insert({
        id: conversationId,
        user_id: userId,
        analysis_id: match.id,
        title: `Application strategy for ${match.title}`,
        created_at: now,
        updated_at: now,
      });

    if (conversationErr) {
      console.error("Error creating job match chat:", conversationErr.message);
      process.exit(1);
    }

    for (const [messageIndex, message] of DEMO_CHAT_MESSAGES.entries()) {
      const userMessageAt = new Date(
        Date.parse(now) + messageIndex * 2000,
      ).toISOString();
      const assistantMessageAt = new Date(
        Date.parse(userMessageAt) + 1000,
      ).toISOString();
      const { error: userMessageErr } = await adminClient
        .from("analysis_chat_messages")
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          analysis_id: match.id,
          conversation_id: conversationId,
          role: "user",
          content: message.user,
          model: null,
          metadata: null,
          created_at: userMessageAt,
        });

      if (userMessageErr) {
        console.error("Error creating job match chat message:", userMessageErr.message);
        process.exit(1);
      }

      const { error: assistantMessageErr } = await adminClient
        .from("analysis_chat_messages")
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          analysis_id: match.id,
          conversation_id: conversationId,
          role: "assistant",
          content: message.assistant,
          model: DEMO_AI_MODEL,
          metadata: { seeded: true },
          created_at: assistantMessageAt,
        });

      if (assistantMessageErr) {
        console.error("Error creating job match chat answer:", assistantMessageErr.message);
        process.exit(1);
      }
    }

    totalChats++;
  }

  log(`  ${totalMatches} matches, ${totalFollowUps} follow-ups, ${totalQuestions} questions, ${totalChats} chats`);

  // -----------------------------------------------------------------------
  // 7. Feedback Notes + Received Feedback
  // -----------------------------------------------------------------------
  log("Creating feedback notes...");

  for (let i = 0; i < COUNTS.feedbackNotes; i++) {
    const fbInput = FeedbackFixture.createInput({
      user_id: userId,
      activity_context_id: faker.helpers.arrayElement(contextIds),
    });
    const fbId = crypto.randomUUID();
    const now = new Date().toISOString();
    const isClosed = faker.datatype.boolean({ probability: 0.3 });
    const { error: feedbackErr } = await adminClient
      .from("feedback_notes_feedbacks")
      .insert({
        id: fbId,
        user_id: userId,
        activity_context_id: fbInput.activity_context_id,
        person_name: fbInput.person_name,
        status: isClosed ? "closed" : "active",
        final_feedback: fbInput.final_feedback ?? null,
        closed_at: isClosed ? now : null,
        created_at: now,
        updated_at: now,
      });

    if (feedbackErr) {
      console.error("Error creating feedback:", feedbackErr.message);
      process.exit(1);
    }

    const numEntries = faker.number.int(COUNTS.entriesPerFeedback);
    for (let e = 0; e < numEntries; e++) {
      const entryInput = FeedbackFixture.createEntryInput({
        user_id: userId,
        feedback_id: fbId,
      });
      const { error: entryErr } = await adminClient
        .from("feedback_notes_entries")
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          feedback_id: fbId,
          content: entryInput.content,
          created_at: now,
          updated_at: now,
        });

      if (entryErr) {
        console.error("Error creating feedback entry:", entryErr.message);
        process.exit(1);
      }
    }
  }

  for (let i = 0; i < COUNTS.receivedFeedback; i++) {
    const ctxId = faker.helpers.arrayElement(contextIds);
    await receivedFeedbackModule.createReceivedFeedback.execute(
      ReceivedFeedbackFixture.createInput({
        userId,
        activityContextId: ctxId,
      }),
    );
  }
  ;

  // -----------------------------------------------------------------------
  // 8. Work Journal Entries
  // -----------------------------------------------------------------------
  log("Creating work journal entries...");

  const wjDefaultCtx = allContexts.find((context) => context.toPrimitives().isDefault);
  if (!wjDefaultCtx && contextIds.length === 0) {
    console.error("Failed to find default activity context");
    process.exit(1);
  }
  const wjContextId = wjDefaultCtx?.toPrimitives().id ?? contextIds[0];

  const wjContextIds = [wjContextId];
  const wjContextNames = ["Core Product Work", "Research", "Meetings"];
  for (const name of wjContextNames) {
    const ctx = await activityModule.createActivityContext.execute({
      userId,
      type: faker.helpers.arrayElement(["employment", "project", "personal", "other"] as const),
      name,
    });
    wjContextIds.push(ctx.toPrimitives().id);
  }

  for (let i = 0; i < COUNTS.workJournalEntries; i++) {
    await workJournalModule.createEntry.execute(
      WorkJournalEntryFixture.createInput({
        user_id: userId,
        context_id: faker.helpers.arrayElement(wjContextIds),
      }),
    );
  }
  ;

  // -----------------------------------------------------------------------
  // 9. Commitments
  // -----------------------------------------------------------------------
  log("Creating commitments...");
  let totalCommitments = 0;
  let totalItems = 0;
  let totalOutcomes = 0;

  const cmtContextIds = [wjContextId];

  for (let c = 0; c < COUNTS.commitmentContexts; c++) {
    const ctx = await activityModule.createActivityContext.execute({
      userId,
      type: faker.helpers.arrayElement(["employment", "project", "personal", "other"] as const),
      name: faker.helpers.arrayElement([
        `${faker.company.name()} - ${faker.date.recent().getFullYear()}`,
        `${faker.commerce.productName()} Project`,
        `Personal development - ${faker.person.jobArea()}`,
      ]),
    });
    cmtContextIds.push(ctx.toPrimitives().id);
  }

  for (const ctxId of cmtContextIds) {
    const numCommitments = faker.number.int(COUNTS.commitmentsPerContext);
    for (let ci = 0; ci < numCommitments; ci++) {
      const commitment = await commitmentsModule.createCommitment.execute(
        CommitmentFixture.createCommitmentInput({
          userId,
          contextId: ctxId,
        }),
      );
      const commitmentId = commitment.toPrimitives().id;
      totalCommitments++;

      const numItems = faker.number.int(COUNTS.itemsPerCommitment);
      for (let ii = 0; ii < numItems; ii++) {
        await commitmentsModule.createItem.execute(
          CommitmentFixture.createItemInput({
            userId,
            commitmentId,
            orderIndex: ii,
          }),
        );
        totalItems++;
      }

      const numOutcomes = faker.number.int(COUNTS.outcomesPerCommitment);
      for (let oi = 0; oi < numOutcomes; oi++) {
        await commitmentsModule.createOutcome.execute(
          CommitmentFixture.createOutcomeInput({ userId, commitmentId }),
        );
        totalOutcomes++;
      }
    }
  }
  log(`  ${totalCommitments} commitments, ${totalItems} items, ${totalOutcomes} outcomes`);

  console.log(`\n  Done! User: ${EMAIL}\n`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
