import type {
  JobMatchScoringAIInput,
  JobMatchScoringAIResult,
  JobMatchScoringAIService,
} from "../../domain/repositories/job-match-scoring-ai.service";

const MATCH_PROFILES = [
  {
    score: 92,
    feedback:
      "Excellent match. The CV shows direct experience with the role's core stack, ownership level, and collaboration expectations.",
    aiKeywords: ["high-fit role", "platform ownership", "React", "distributed systems"],
    improvements: [
      "Tailor the opening summary to mention the company's product domain.",
      "Add one bullet about mentoring or technical direction.",
    ],
    jobKeyData: {
      title: "Senior Product Engineer",
      company: "Northstar Labs",
      location: "London, UK",
      remote: "Hybrid",
      salary: "95k - 125k GBP",
      seniority: "Senior",
      contractType: "Full-time",
      benefits: ["Equity package", "Learning budget", "Flexible schedule", "Private healthcare"],
      requirements: ["React", "TypeScript", "Node.js", "Product sense", "System design"],
      responsibilities: [
        "Lead cross-functional product initiatives",
        "Design scalable frontend and backend systems",
        "Mentor engineers through code reviews and planning",
      ],
      notablePoints: ["High product ownership", "Strong match for senior IC track"],
    },
    jobKeywords: ["React", "TypeScript", "Node.js", "product ownership", "system design"],
    cvKeywords: ["React", "TypeScript", "architecture", "mentoring", "PostgreSQL"],
    matchingKeywords: ["React", "TypeScript", "architecture", "mentoring"],
    missingKeywords: ["domain-specific product metrics"],
  },
  {
    score: 81,
    feedback:
      "Strong match with a few gaps. The profile aligns well technically, but should make cloud and reliability experience more explicit.",
    aiKeywords: ["strong technical fit", "backend systems", "cloud", "observability"],
    improvements: [
      "Highlight production reliability work near the top of the CV.",
      "Add concrete cloud provider experience if available.",
    ],
    jobKeyData: {
      title: "Backend Platform Engineer",
      company: "Atlas Commerce",
      location: "Berlin, Germany",
      remote: "Remote",
      salary: "90k - 115k EUR",
      seniority: "Staff",
      contractType: "Full-time",
      benefits: ["Remote-first", "Conference budget", "Home office stipend"],
      requirements: ["Node.js", "PostgreSQL", "AWS", "Observability", "API design"],
      responsibilities: [
        "Improve platform reliability",
        "Build internal APIs for product teams",
        "Own database performance and operational quality",
      ],
      notablePoints: ["Remote-first team", "Reliability-heavy scope"],
    },
    jobKeywords: ["Node.js", "PostgreSQL", "AWS", "observability", "API design"],
    cvKeywords: ["Node.js", "PostgreSQL", "Docker", "CI/CD", "testing"],
    matchingKeywords: ["Node.js", "PostgreSQL", "API design", "CI/CD"],
    missingKeywords: ["AWS", "SLO ownership"],
  },
  {
    score: 69,
    feedback:
      "Partial match. The CV covers important engineering fundamentals, but the role asks for leadership and domain depth that are not yet prominent.",
    aiKeywords: ["partial fit", "technical leadership", "data workflows", "stakeholder management"],
    improvements: [
      "Add leadership examples from roadmap planning, hiring, or architecture reviews.",
      "Reframe project bullets around business outcomes and team impact.",
    ],
    jobKeyData: {
      title: "Engineering Lead, Data Products",
      company: "SignalWorks",
      location: "New York, US",
      remote: "On-site",
      salary: "150k - 180k USD",
      seniority: "Lead",
      contractType: "Full-time",
      benefits: ["Annual bonus", "Commuter support", "Leadership coaching"],
      requirements: ["Team leadership", "Data pipelines", "Python", "Stakeholder management"],
      responsibilities: [
        "Lead a squad of product engineers",
        "Partner with data science and product leadership",
        "Set technical direction for analytics workflows",
      ],
      notablePoints: ["Leadership-heavy role", "Data domain gap to address"],
    },
    jobKeywords: ["team leadership", "data pipelines", "Python", "stakeholder management"],
    cvKeywords: ["TypeScript", "React", "PostgreSQL", "technical planning"],
    matchingKeywords: ["technical planning", "PostgreSQL"],
    missingKeywords: ["Python", "data pipelines", "formal people leadership"],
  },
  {
    score: 57,
    feedback:
      "Stretch role. There is useful overlap in software delivery, but the CV needs stronger evidence for the role's specialist requirements.",
    aiKeywords: ["stretch fit", "security engineering", "compliance", "incident response"],
    improvements: [
      "Only apply if you can add security projects or compliance ownership.",
      "Prepare examples around incident response, risk tradeoffs, and audit readiness.",
    ],
    jobKeyData: {
      title: "Security Automation Engineer",
      company: "VaultBridge",
      location: "Toronto, Canada",
      remote: "Hybrid",
      salary: "120k - 145k CAD",
      seniority: "Senior",
      contractType: "Full-time",
      benefits: ["Security training", "Certification budget", "Wellness stipend"],
      requirements: ["Security automation", "SOC2", "Python", "Incident response", "Terraform"],
      responsibilities: [
        "Automate security controls",
        "Partner with compliance and platform teams",
        "Improve detection and response workflows",
      ],
      notablePoints: ["Specialist security role", "Requires focused positioning"],
    },
    jobKeywords: ["security automation", "SOC2", "Python", "incident response", "Terraform"],
    cvKeywords: ["TypeScript", "Docker", "CI/CD", "observability"],
    matchingKeywords: ["CI/CD", "observability"],
    missingKeywords: ["SOC2", "security automation", "incident response", "Terraform"],
  },
] satisfies JobMatchScoringAIResult[];

function hashInput(input: JobMatchScoringAIInput): number {
  const seed = `${input.text}|${input.jobDescription}|${input.jobUrl ?? ""}`;
  return Array.from(seed).reduce(
    (acc, char) => (acc * 33 + char.charCodeAt(0)) % 12347,
    23,
  );
}

function pickProfile(hash: number): JobMatchScoringAIResult {
  return MATCH_PROFILES[hash % MATCH_PROFILES.length];
}

function scoreForProfile(profile: JobMatchScoringAIResult, hash: number): number {
  if (profile.score >= 90) return 86 + (hash % 11);
  if (profile.score >= 80) return 76 + (hash % 12);
  if (profile.score >= 65) return 62 + (hash % 14);
  return 45 + (hash % 16);
}

class MockJobMatchScoringAIService implements JobMatchScoringAIService {
  async score(input: JobMatchScoringAIInput): Promise<JobMatchScoringAIResult> {
    const hash = hashInput(input);
    const profile = pickProfile(hash);
    return {
      ...profile,
      score: scoreForProfile(profile, hash),
      feedback: `${profile.feedback} Compared against ${input.text.length} CV characters.`,
    };
  }
}

export class MockJobMatchScoringAIServiceFactory {
  create(): JobMatchScoringAIService {
    return new MockJobMatchScoringAIService();
  }
}
