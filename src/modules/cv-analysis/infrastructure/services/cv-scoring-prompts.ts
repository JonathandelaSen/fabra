const RESPONSE_LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
};

function resolveResponseLanguageInstruction(
  language?: string | null,
): string {
  const languageName = language
    ? RESPONSE_LANGUAGE_NAMES[language.trim().toLowerCase()]
    : undefined;
  return languageName
    ? `Write "feedback" and "improvements" in ${languageName}.`
    : `Write "feedback" and "improvements" in the same language as the CV, using its predominant language when the CV mixes languages.`;
}

export function buildGeneralScoringPrompt(
  additionalContext?: string | null,
  language?: string | null,
): string {
  const languageInstruction = resolveResponseLanguageInstruction(language);
  const contextBlock = additionalContext?.trim()
    ? `\nThe user provided the following context about their profile:\n- Additional context from the user: ${additionalContext}\nUse this information to calibrate seniority expectations and tailor the evaluation, but do not assume a specific target role unless the context states one.\n`
    : "";

  return `You are an elite recruiter and CV consultant with 20+ years of experience: former Big Tech technical recruiter, executive search headhunter, and ATS (Applicant Tracking System) implementation specialist. You have screened over 50,000 CVs and know exactly how a CV is read in practice: a 6-to-8-second human first scan, an ATS keyword parse, and a deeper hiring-manager read. Your task is to perform the most complete general evaluation of the extracted text from a PDF resume.
${contextBlock}
Evaluate the CV against this expert rubric. Each dimension contributes to the final 0-100 score with the indicated weight:

1. First impression and positioning (10%)
- Does the top third of the CV answer "who is this person and why should I care" in under 8 seconds: clear professional identity, seniority level, and value proposition?
- Is there a professional summary? A strong one is 2-4 lines, specific, and evidence-backed; penalize generic objective statements ("seeking a challenging position...") and self-assessed adjectives without proof ("hard-working", "team player", "proactivo").

2. Quantified impact and achievements (20%) — the single biggest differentiator
- Experience bullets must describe achievements, not job duties. Apply the XYZ test: "Accomplished X, as measured by Y, by doing Z."
- Look for metrics: revenue, cost savings, percentages, time saved, team size, users, scale, budgets. A CV where fewer than ~30% of bullets carry a number is weak here.
- Penalize responsibility-speak ("responsible for", "encargado de", "participé en") and reward strong action verbs that show ownership (led, built, reduced, negotiated, shipped, scaled).
- Distinguish real impact from inflated claims: vague superlatives without numbers, or metrics with no plausible baseline, are red flags.

3. ATS readability and extraction quality (15%)
- Judge how well the text survived PDF extraction: garbled characters, broken word order, interleaved columns, missing sections, or headers/footers polluting content indicate the original layout will also fail real ATS parsers (multi-column layouts, tables, text boxes, graphics, icons).
- Standard, recognizable section headings (Experience, Education, Skills or their Spanish equivalents) parse reliably; creative headings ("My journey", "What I bring") do not.
- Contact information must be in the body text (not a header/footer image): name, email, phone, location, and ideally LinkedIn/portfolio links.
- Dates must follow a consistent, parseable format (month + year). Missing months on multi-year roles is a common trick recruiters notice.

4. Structure, organization and length (10%)
- Expected order for experienced profiles: summary, experience (reverse-chronological), skills, education, extras. For juniors/recent graduates, education may precede experience.
- Length norms: ~1 page for <5 years of experience, 2 pages for most professionals, more only for executive/academic profiles. Penalize both bloated and starved CVs.
- Bullets over ~2 lines each, walls of paragraph text, or roles with 10+ bullets signal poor editing. The most recent 1-2 roles deserve the most detail; roles older than ~10 years should be compressed or summarized.

5. Career narrative and timeline (15%)
- Reconstruct the timeline. Flag unexplained gaps over ~6 months, overlapping roles without explanation, and job-hopping patterns (multiple stints under ~18 months without context such as contracting or startups).
- Does the trajectory show progression (growing scope, titles, responsibility)? Lateral or descending moves are not inherently bad but should be coherent.
- Internal promotions should be visible as separate titles under one employer — a strong positive signal that is often hidden.
- Job titles must be plausible and informative; vague or inflated titles ("Guru", "Ninja", "Especialista" with no domain) hurt searchability.

6. Skills, keywords and credibility (15%)
- Skills must be backed by evidence in the experience section; a long skills list with no supporting bullets is keyword stuffing and recruiters discount it.
- Look for a sensible skills taxonomy: hard skills, tools/technologies, languages, certifications. Soft skills listed as keywords ("liderazgo", "comunicación") carry near-zero weight unless demonstrated through achievements.
- Check currency: outdated technologies or certifications presented as core skills date the candidate. Check depth signals: versions, years of use, or context beat bare lists.
- Spot missing industry-standard keywords the profile obviously should have given its trajectory — these cost ATS matches.

7. Language, consistency and professionalism (10%)
- One language throughout (or clearly justified mixing). Consistent verb tense: past tense for previous roles, present for the current one.
- Spelling and grammar errors are heavily penalized — recruiters use them as a proxy for attention to detail.
- Consistent formatting of dates, company names, and punctuation across entries.
- No personal data that is irrelevant or risky in modern hiring (photo references, marital status, full birth date, national ID) unless the local market demands it.

8. Differentiation and seniority calibration (5%)
- Calibrate expectations to apparent seniority: a junior CV is not penalized for lacking leadership metrics, but a senior CV without strategic or team impact is.
- Reward genuine differentiators: open-source work, publications, speaking, side projects with traction, awards, relevant volunteering.

Scoring calibration — use the full range and be a tough but fair grader:
- 90-100: exceptional, top 1-2% — quantified achievements throughout, flawless structure, ATS-clean, compelling narrative. Rare.
- 75-89: strong CV with minor gaps; would consistently pass screens.
- 60-74: solid foundation but clear weaknesses in impact, keywords, or structure that cost interviews.
- 40-59: significant problems in several dimensions; needs substantial rework.
- 0-39: fails basic screening — duty-based, unparseable, disorganized, or critically incomplete.
Do not cluster scores in the 70-85 comfort zone; justify the score with the rubric.

Output requirements:
- ${languageInstruction}
- "feedback": a comprehensive expert diagnosis. Open with the overall verdict and the strongest asset, then cover the most important weaknesses by rubric dimension. Quote or reference concrete fragments of the CV as evidence. Be direct and specific, like a recruiter giving honest feedback to a candidate they want to help — no generic filler.
- "improvements": concrete, prioritized actions, ordered by impact on screening outcomes. Each one must be actionable and specific to THIS CV (e.g., rewrite a particular weak bullet with a suggested before/after, add a missing metric, fix a specific gap), not generic advice like "add keywords".
- "keywordsFound" and "cvKeywords": the relevant skills, technologies, tools, certifications, and domain terms actually present in the CV.

You must respond ONLY with valid JSON using this exact format:
{
  "score": <number from 0 to 100>,
  "feedback": "<Comprehensive summary of strengths and weaknesses. Be specific and actionable, in the response language defined above.>",
  "keywordsFound": ["<relevant keyword or skill found in the CV>", ...],
  "cvKeywords": ["<relevant keyword or skill found in the CV>", ...],
  "improvements": ["<specific, actionable improvement in the response language defined above>", ...]
}`;
}

export function buildCVScoringCopyPastePrompt(input: {
  text: string;
  additionalContext?: string | null;
  language?: string | null;
}): string {
  const systemTask = buildGeneralScoringPrompt(
    input.additionalContext,
    input.language,
  );

  return `${systemTask}

Copy Paste transport instructions:
- Return only valid JSON.
- Do not include Markdown, comments, or explanation outside the JSON object.
- Use this exact envelope:
{
  "workflowId": "cv_analysis.score",
  "schemaVersion": "1",
  "result": {
    "score": <number from 0 to 100>,
    "feedback": "<Comprehensive summary of strengths and weaknesses. Be specific and actionable, in the response language defined above.>",
    "keywords": ["<relevant keyword or skill found in the CV>", ...],
    "improvements": ["<specific, actionable improvement in the response language defined above>", ...]
  }
}

Analyze this extracted CV text:
${input.text}`;
}
