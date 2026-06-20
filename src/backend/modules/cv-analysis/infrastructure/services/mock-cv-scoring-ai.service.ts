import type {
  CVScoringAIInput,
  CVScoringAIResultPrimitives,
  CVScoringAIService,
} from "../../domain/repositories/cv-scoring-ai.service";
import { CVScoringAIResult } from "../../domain/value-objects/cv-scoring-ai-result.value-object";

const SCORE_PROFILES = [
  {
    score: 91,
    feedback:
      "Strong senior profile with clear technical leadership, product ownership, and measurable delivery signals.",
    keywords: [
      "platform leadership",
      "TypeScript",
      "system design",
      "mentoring",
      "product ownership",
      "architecture reviews",
      "stakeholder communication",
      "delivery strategy",
    ],
    improvements: [
      "Add one quantified business outcome to the most recent role.",
      "Move architecture ownership higher in the summary.",
      "Name the teams or functions influenced by the candidate's technical direction.",
      "Add a short line about roadmap ownership or product decision-making.",
    ],
  },
  {
    score: 84,
    feedback:
      "Well-rounded engineering CV with solid delivery evidence and a good balance of frontend, backend, and collaboration signals.",
    keywords: [
      "full-stack delivery",
      "React",
      "Node.js",
      "PostgreSQL",
      "API design",
      "testing",
      "CI/CD",
      "cross-functional work",
    ],
    improvements: [
      "Tighten older experience bullets so recent impact is easier to scan.",
      "Add scope indicators such as team size, traffic, or revenue impact.",
      "Group repeated tooling into a concise skills section.",
      "Make the first three bullets in the latest role more outcome-focused.",
    ],
  },
  {
    score: 76,
    feedback:
      "Credible profile with relevant technologies, but impact statements are uneven and some achievements read like responsibilities.",
    keywords: [
      "product engineering",
      "Next.js",
      "CI/CD",
      "testing",
      "Docker",
      "observability",
      "accessibility",
      "code quality",
    ],
    improvements: [
      "Rewrite responsibility-heavy bullets as outcomes with metrics.",
      "Clarify which projects were owned end-to-end.",
      "Add before-and-after results for performance, reliability, or conversion work.",
      "Bring the target role keywords into the summary and latest experience.",
    ],
  },
  {
    score: 68,
    feedback:
      "Good foundation, but the CV needs sharper positioning and stronger evidence of ownership for senior roles.",
    keywords: [
      "backend foundations",
      "APIs",
      "Docker",
      "observability",
      "data modeling",
      "incident response",
      "documentation",
      "technical planning",
    ],
    improvements: [
      "Add a short executive summary that names the target role.",
      "Surface project scale, reliability wins, and cross-functional work.",
      "Replace generic skill claims with concrete examples from recent projects.",
      "Add measurable delivery signals such as latency, uptime, cost, or user impact.",
    ],
  },
] satisfies CVScoringAIResultPrimitives[];

function hashInput(input: CVScoringAIInput): number {
  const seed = `${input.text}|${input.additionalContext ?? ""}`;
  return Array.from(seed).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) % 9973,
    17,
  );
}

function pickProfile(hash: number): CVScoringAIResultPrimitives {
  return SCORE_PROFILES[hash % SCORE_PROFILES.length];
}

function scoreForProfile(profile: CVScoringAIResultPrimitives, hash: number): number {
  if (profile.score >= 90) return 88 + (hash % 9);
  if (profile.score >= 80) return 78 + (hash % 10);
  if (profile.score >= 75) return 70 + (hash % 9);
  return 58 + (hash % 12);
}

class MockCVScoringAIService implements CVScoringAIService {
  async score(input: CVScoringAIInput): Promise<CVScoringAIResult> {
    const hash = hashInput(input);
    const profile = pickProfile(hash);
    return CVScoringAIResult.fromPrimitives({
      ...profile,
      score: scoreForProfile(profile, hash),
      feedback: `${profile.feedback} Source length: ${input.text.length} characters.`,
    });
  }
}

export class MockCVScoringAIServiceFactory {
  create(): CVScoringAIService {
    return new MockCVScoringAIService();
  }
}
