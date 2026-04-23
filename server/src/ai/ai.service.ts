import { GoogleGenAI } from "@google/genai";
import { IJob } from "../features/jobs/jobs.types";
import { ICandidate } from "../features/candidates/candidates.types";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `
    You are ARIA (AI Recruitment Intelligence Analyst), a Senior Technical Recruiter
    specialising in the African digital workforce ecosystem.

    ## SCORING FRAMEWORK (TOTAL = 100 POINTS)

    ### 1. Technical Skills — 40 Points
    - Keyword match against required skills: 15 pts
    - Demonstrated project relevance: 15 pts
    - Tool and framework proficiency depth: 10 pts

    ### 2. Relevant Experience — 30 Points
    - Years of experience relative to seniority level: 10 pts
    - Role seniority alignment and career trajectory: 10 pts
    - Industry or domain overlap: 10 pts

    ### 3. Education and Certifications — 20 Points
    - Degree relevance: 10 pts
    - Professional certifications: 5 pts
    - Self-directed learning (bootcamps, online courses): 5 pts

    ### 4. Cultural Relevance and Fit — 10 Points
    - Geographic alignment: 3 pts
    - Language proficiency: 3 pts
    - Communication style indicators: 2 pts
    - Community involvement and open source contributions: 2 pts

    ## RULES
    - Evaluate ALL candidates simultaneously and rank them relative to each other.
    - Never invent or infer data not explicitly present in the profile.
    - If a required skill has no evidence, mark it as a gap.
    - Ignore candidate names and gender indicators when scoring.
    - Regional certifications carry equal weight to global equivalents.

    ## VERDICT THRESHOLDS
    - STRONG_MATCH:  score >= 80
    - GOOD_MATCH:    score 65-79
    - BORDERLINE:    score 50-64
    - WEAK_MATCH:    score < 50
    - DISQUALIFIED:  any hard requirement unmet

    ## OUTPUT
    Return only valid JSON. No markdown. No prose. No code fences.
    The response must be parseable by JSON.parse() immediately.

    {
    "session_id": "<string>",
    "rankings": [
        {
        "rank": <number>,
        "candidate_id": "<string>",
        "candidate_name": "<string>",
        "total_score": <number>,
        "score_breakdown": {
            "technical_skills": <number>,
            "relevant_experience": <number>,
            "education_certifications": <number>,
            "cultural_relevance_fit": <number>
        },
        "verdict": "<string>",
        "strengths": ["<string>"],
        "gaps": ["<string>"],
        "citations": [
            {
            "dimension": "<string>",
            "evidence": "<string>",
            "source_section": "<string>",
            "impact": "<string>"
            }
        ],
        "recruiter_note": "<string>",
        "hard_disqualification_reason": "<string | null>"
        }
    ],
    "batch_summary": {
        "recommended_for_interview": ["<candidate_id>"],
        "hold_pool": ["<candidate_id>"],
        "not_advancing": ["<candidate_id>"],
        "top_differentiator": "<string>",
        "talent_pool_quality": "<HIGH | MEDIUM | LOW>"
    }
    }
    `.trim();

interface EvaluateInput {
  sessionId: string;
  job: IJob;
  candidates: ICandidate[];
}

export interface AIRankingResult {
  session_id: string;
  rankings: CandidateRanking[];
  batch_summary: BatchSummary;
}

export interface CandidateRanking {
  rank: number;
  candidate_id: string;
  candidate_name: string;
  total_score: number;
  score_breakdown: {
    technical_skills: number;
    relevant_experience: number;
    education_certifications: number;
    cultural_relevance_fit: number;
  };
  verdict: string;
  strengths: string[];
  gaps: string[];
  citations: Citation[];
  recruiter_note: string;
  hard_disqualification_reason: string | null;
}

interface Citation {
  dimension: string;
  evidence: string;
  source_section: string;
  impact: string;
}

interface BatchSummary {
  recommended_for_interview: string[];
  hold_pool: string[];
  not_advancing: string[];
  top_differentiator: string;
  talent_pool_quality: "HIGH" | "MEDIUM" | "LOW";
}

export class AIService {
  async evaluate(input: EvaluateInput): Promise<AIRankingResult> {
    const { sessionId, job, candidates } = input;

    const prompt = this.buildPrompt(sessionId, job, candidates);

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    });

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error("Empty response from Gemini");

    return this.parse(raw);
  }

  private buildPrompt(
    sessionId: string,
    job: IJob,
    candidates: ICandidate[],
  ): string {
    const jobContext = {
      session_id: sessionId,
      job_title: job.title,
      job_description: job.description,
      required_skills: job.requiredSkills,
      nice_to_have_skills: job.niceToHaveSkills,
      experience_level: job.experienceLevel,
      min_years_experience: job.minYearsExperience,
      max_years_experience: job.maxYearsExperience ?? null,
      location: job.location,
      remote: job.remote,
      hard_requirements: job.hardRequirements,
    };

    const candidatesContext = candidates.map((c) => ({
      candidate_id: c._id.toString(),
      candidate_name: this.buildCandidateName(c),
      headline: c.headline,
      summary: c.bio ?? null,
      location: c.location,
      languages: c.languages,
      total_years_experience: this.getTotalYearsExperience(c),
      work_experience: c.experience,
      education: c.education,
      skills: c.skills,
      certifications: c.certifications,
      extraction_confidence: c.extractionConfidence,
      extraction_warnings: c.extractionWarnings ?? [],
    }));

    return `
    ## JOB REQUIREMENT
    ${JSON.stringify(jobContext, null, 2)}

    ## CANDIDATE BATCH (${candidates.length} candidates)
    ${JSON.stringify(candidatesContext, null, 2)}

    ## INSTRUCTION
    Evaluate all ${candidates.length} candidates against the job requirement.
    Rank them relative to each other. Return the complete JSON object only.
    `.trim();
  }

  private buildCandidateName(candidate: ICandidate): string {
    return [candidate.firstName, candidate.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  private getTotalYearsExperience(candidate: ICandidate): number {
    return candidate.experience.reduce((total, item) => {
      const startYear = this.getYear(item.startDate);
      if (!startYear) return total;

      const endYear = item.isCurrent
        ? new Date().getFullYear()
        : (this.getYear(item.endDate) ?? new Date().getFullYear());
      const years = Math.max(0, endYear - startYear);
      return total + years;
    }, 0);
  }

  private getYear(value?: string): number | null {
    if (!value) return null;

    const match = value.match(/\b(19|20)\d{2}\b/);
    if (match) return Number(match[0]);

    const parsed = new Date(value);
    const year = parsed.getFullYear();
    return Number.isNaN(year) ? null : year;
  }

  private parse(raw: string): AIRankingResult {
    try {
      return JSON.parse(raw) as AIRankingResult;
    } catch {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      return JSON.parse(cleaned) as AIRankingResult;
    }
  }
}
