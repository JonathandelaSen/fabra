import type {
  CVScoringAIInput,
  CVScoringAIResult,
  CVScoringAIService,
} from "../../domain/repositories/cv-scoring-ai.service";

const SCORE_PROFILES = [
  {
    score: 91,
    feedback:
      "[mock-ai] Strong senior profile with clear technical leadership, product ownership, and measurable delivery signals.",
    keywords: ["[mock-ai] platform leadership", "TypeScript", "system design", "mentoring"],
    improvements: [
      "[mock-ai] Add one quantified business outcome to the most recent role.",
      "[mock-ai] Move architecture ownership higher in the summary.",
    ],
  },
  {
    score: 84,
    feedback:
      "[mock-ai] Well-rounded engineering CV with solid delivery evidence and a good balance of frontend, backend, and collaboration signals.",
    keywords: ["[mock-ai] full-stack delivery", "React", "Node.js", "PostgreSQL"],
    improvements: [
      "[mock-ai] Tighten older experience bullets so recent impact is easier to scan.",
      "[mock-ai] Add scope indicators such as team size, traffic, or revenue impact.",
    ],
  },
  {
    score: 76,
    feedback:
      "[mock-ai] Credible profile with relevant technologies, but impact statements are uneven and some achievements read like responsibilities.",
    keywords: ["[mock-ai] product engineering", "Next.js", "CI/CD", "testing"],
    improvements: [
      "[mock-ai] Rewrite responsibility-heavy bullets as outcomes with metrics.",
      "[mock-ai] Group repeated tooling keywords into a compact skills section.",
    ],
  },
  {
    score: 68,
    feedback:
      "[mock-ai] Good foundation, but the CV needs sharper positioning and stronger evidence of ownership for senior roles.",
    keywords: ["[mock-ai] backend foundations", "APIs", "Docker", "observability"],
    improvements: [
      "[mock-ai] Add a short executive summary that names the target role.",
      "[mock-ai] Surface project scale, reliability wins, and cross-functional work.",
    ],
  },
] satisfies CVScoringAIResult[];

function pickProfile(input: CVScoringAIInput): CVScoringAIResult {
  const seed = `${input.text}|${input.additionalContext ?? ""}`;
  const hash = Array.from(seed).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) % 9973,
    17,
  );
  return SCORE_PROFILES[hash % SCORE_PROFILES.length];
}

class MockCVScoringAIService implements CVScoringAIService {
  async score(input: CVScoringAIInput): Promise<CVScoringAIResult> {
    const profile = pickProfile(input);
    return {
      ...profile,
      feedback: `${profile.feedback} Source length: ${input.text.length} characters.`,
    };
  }
}

export class MockCVScoringAIServiceFactory {
  create(): CVScoringAIService {
    return new MockCVScoringAIService();
  }
}
