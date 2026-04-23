import { PDFParse } from "pdf-parse";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { GoogleGenAI } from "@google/genai";
import {
  ingestCandidateDto,
  IngestCandidateDto,
} from "../features/candidates/candidates.dto";
import { AppError } from "../middleware/error";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_AI_REQUEST_TIMEOUT_MS = 45000;
const DEFAULT_AI_MAX_RETRIES = 2;
const DEFAULT_AI_RETRY_BASE_DELAY_MS = 1500;

export class NormalizeService {
  async fromPDF(buffer: Buffer): Promise<IngestCandidateDto> {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    const text = parsed.text;

    await parser.destroy();

    const response = await this.generateContentWithRetry(() =>
      genai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Parse this resume and return a JSON object with the following structure:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "headline": "string",
  "bio": "string (optional)",
  "location": "string",
  "skills": [{"name": "string", "level": "Beginner|Intermediate|Advanced|Expert", "yearsOfExperience": number}],
  "languages": [{"name": "string", "proficiency": "Basic|Conversational|Fluent|Native"}],
  "experience": [{"company": "string", "role": "string", "startDate": "string", "endDate": "string (optional)", "description": "string", "technologies": ["string"], "isCurrent": boolean}],
  "education": [{"institution": "string", "degree": "string", "fieldOfStudy": "string", "startYear": number, "endYear": number (optional)}],
  "certifications": [{"name": "string", "issuer": "string", "issueDate": "string"}],
  "projects": [{"name": "string", "description": "string", "technologies": ["string"], "role": "string", "link": "url (optional)", "startDate": "string", "endDate": "string (optional)"}],
  "availability": {"status": "Available|Open to Opportunities|Not Available", "type": "Full-time|Part-time|Contract", "startDate": "string (optional)"},
  "socialLinks": {"linkedin": "url (optional)", "github": "url (optional)", "portfolio": "url (optional)"}
}

Extract all information from the provided resume text and return it as a valid JSON object matching this structure. Only return JSON, no markdown, no code fences, no extra text. If a field cannot be found, omit it or use appropriate defaults. Never invent or infer data that is not explicitly present.

Resume text:\n\n${text}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: {
            parts: [
              {
                text: `You are a resume parser. Extract all information from the 
                           provided resume text and return it as a valid JSON object matching the specified structure. Only return JSON, 
                           no markdown, no code fences, no extra text. If a field cannot be found, omit it.
                           Never invent or infer data that is not explicitly present.`,
              },
            ],
          },
          responseMimeType: "application/json",
          temperature: 0,
        },
      }),
    );

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedCandidate = this.parseJsonResponse<Partial<IngestCandidateDto>>(
      raw,
      "Resume parsing failed because the AI response was empty or invalid JSON",
    );

    return this.normalizeCandidate(parsedCandidate);
  }

  async fromCSV(buffer: Buffer): Promise<IngestCandidateDto[]> {
    const text = buffer.toString("utf-8");

    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      throw new Error(`CSV parsing failed: ${errors[0].message}`);
    }

    return (data as Record<string, string>[]).map((row) => this.mapCSVRow(row));
  }

  async fromExcel(buffer: Buffer): Promise<IngestCandidateDto[]> {
    const workbook = new ExcelJS.Workbook();

    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;

    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    const rows: IngestCandidateDto[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) {
        row.eachCell((cell) => headers.push(cell.text.toLowerCase().trim()));
        return;
      }

      const rowData: Record<string, string> = {};
      row.eachCell((cell, colIndex) => {
        rowData[headers[colIndex - 1]] = cell.text;
      });

      rows.push(this.mapCSVRow(rowData));
    });

    return rows;
  }

  private mapCSVRow(row: Record<string, string>): IngestCandidateDto {
    const normalizedRow = this.normalizeRow(row);
    const { firstName, lastName } = this.extractNameParts(
      normalizedRow.fullname ??
        normalizedRow.full_name ??
        normalizedRow.name ??
        normalizedRow.candidate_name ??
        "",
    );

    const headline =
      normalizedRow.headline ??
      normalizedRow.role ??
      normalizedRow.job_title ??
      "Candidate";

    const skills = this.splitList(normalizedRow.skills).map((skill) => ({
      name: skill,
      level: "Intermediate" as const,
      yearsOfExperience:
        this.parseNumber(normalizedRow.years_of_experience) ?? 0,
    }));

    const languages = this.splitList(normalizedRow.languages).map(
      (language) => ({
        name: language,
        proficiency: "Fluent" as const,
      }),
    );

    const experience = this.buildExperience(normalizedRow);
    const education = this.buildEducation(normalizedRow);
    const projects = this.buildProjects(normalizedRow);
    const certifications = this.buildCertifications(normalizedRow);

    return this.normalizeCandidate({
      firstName,
      lastName,
      email: normalizedRow.email ?? "",
      headline,
      bio: normalizedRow.summary ?? normalizedRow.bio ?? undefined,
      location:
        normalizedRow.location ??
        normalizedRow.city ??
        normalizedRow.country ??
        "Unknown",
      skills,
      languages,
      experience,
      education,
      certifications,
      projects,
      availability: {
        status: "Available" as const,
        type: "Full-time" as const,
        startDate: normalizedRow.available_from,
      },
      socialLinks: this.buildSocialLinks(normalizedRow),
    });
  }

  private normalizeCandidate(
    candidate: Partial<IngestCandidateDto>,
  ): IngestCandidateDto {
    const normalized = {
      firstName: this.fallbackText(candidate.firstName, "Unknown"),
      lastName: this.fallbackText(candidate.lastName, "Candidate"),
      email: (candidate.email ?? "").trim().toLowerCase(),
      headline: this.fallbackText(candidate.headline, "Candidate"),
      bio: candidate.bio?.trim() || undefined,
      location: this.fallbackText(candidate.location, "Unknown"),
      skills: candidate.skills ?? [],
      languages: candidate.languages ?? [],
      experience: candidate.experience ?? [],
      education: candidate.education ?? [],
      certifications: candidate.certifications ?? [],
      projects: this.normalizeProjects(candidate.projects),
      availability: candidate.availability ?? {
        status: "Available" as const,
        type: "Full-time" as const,
      },
      socialLinks: this.normalizeSocialLinks(candidate.socialLinks),
    };

    return ingestCandidateDto.parse(normalized);
  }

  private parseJsonResponse<T>(raw: string | undefined, message: string): T {
    const cleaned = this.cleanJsonResponse(raw);
    if (!cleaned) {
      throw new AppError(message, 502);
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      throw new AppError(message, 502);
    }
  }

  private normalizeRow(row: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key.toLowerCase().trim(),
        typeof value === "string" ? value.trim() : "",
      ]),
    );
  }

  private extractNameParts(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] ?? "Unknown",
      lastName: parts.slice(1).join(" ") || "Candidate",
    };
  }

  private splitList(value?: string): string[] {
    if (!value) return [];
    return value
      .split(/[,\n;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private parseNumber(value?: string): number | undefined {
    if (!value) return undefined;
    const match = value.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : undefined;
  }

  private fallbackText(value: string | undefined, fallback: string): string {
    const normalized = value?.trim();
    return normalized && normalized.length > 0 ? normalized : fallback;
  }

  private buildExperience(row: Record<string, string>) {
    const company = row.company ?? row.current_company;
    const role = row.role ?? row.job_title;
    const description =
      row.experience_description ?? row.work_experience ?? row.summary;

    if (!company && !role && !description) return [];

    return [
      {
        company: this.fallbackText(company, "Unknown Company"),
        role: this.fallbackText(role, row.headline ?? "Unknown Role"),
        startDate: this.fallbackText(
          row.start_date ?? row.experience_start_date,
          "Unknown",
        ),
        endDate: row.end_date ?? row.experience_end_date ?? undefined,
        description: this.fallbackText(
          description,
          "Imported from candidate ingestion",
        ),
        technologies: this.splitList(row.skills),
        isCurrent: ["true", "yes", "1", "current"].includes(
          (row.is_current ?? "").toLowerCase(),
        ),
      },
    ];
  }

  private buildEducation(row: Record<string, string>) {
    const institution = row.institution ?? row.school ?? row.university;
    const degree = row.degree;
    const fieldOfStudy = row.field_of_study ?? row.major;

    if (!institution && !degree && !fieldOfStudy) return [];

    return [
      {
        institution: this.fallbackText(institution, "Unknown Institution"),
        degree: this.fallbackText(degree, "Unknown Degree"),
        fieldOfStudy: this.fallbackText(fieldOfStudy, "General Studies"),
        startYear: this.parseNumber(row.start_year) ?? new Date().getFullYear(),
        endYear: this.parseNumber(row.end_year),
      },
    ];
  }

  private buildProjects(row: Record<string, string>) {
    const projectName = row.project_name ?? row.project;
    const projectDescription = row.project_description ?? row.summary;

    if (!projectName && !projectDescription) return [];

    return [
      {
        name: this.fallbackText(projectName, "Imported Project"),
        description: this.fallbackText(
          projectDescription,
          "Imported from candidate ingestion",
        ),
        technologies: this.splitList(row.skills),
        role: this.fallbackText(row.role, "Contributor"),
        link: this.normalizeUrl(row.portfolio ?? row.project_link),
        startDate: this.fallbackText(
          row.project_start_date ?? row.start_date,
          "Unknown",
        ),
        endDate: row.project_end_date ?? row.end_date ?? undefined,
      },
    ];
  }

  private buildCertifications(row: Record<string, string>) {
    return this.splitList(row.certifications ?? row.certification).map(
      (name) => ({
        name,
        issuer: this.fallbackText(row.certification_issuer, "Unknown Issuer"),
        issueDate: this.fallbackText(row.certification_issue_date, "Unknown"),
      }),
    );
  }

  private buildSocialLinks(row: Record<string, string>) {
    return this.toDefinedStringRecord({
      linkedin: this.normalizeUrl(row.linkedin),
      github: this.normalizeUrl(row.github),
      portfolio: this.normalizeUrl(row.portfolio),
    });
  }

  private normalizeProjects(
    projects: IngestCandidateDto["projects"] | undefined,
  ) {
    if (!Array.isArray(projects)) return [];

    return projects.map((project) => ({
      name: this.fallbackText(project?.name, "Imported Project"),
      description: this.fallbackText(
        project?.description,
        "Imported from resume",
      ),
      technologies: Array.isArray(project?.technologies)
        ? project.technologies.filter(
            (technology): technology is string =>
              typeof technology === "string" && technology.trim().length > 0,
          )
        : [],
      role: this.fallbackText(project?.role, "Contributor"),
      link: this.normalizeUrl(project?.link),
      startDate: this.fallbackText(project?.startDate, "Unknown"),
      endDate: project?.endDate?.trim() || undefined,
    }));
  }

  private normalizeSocialLinks(
    socialLinks: IngestCandidateDto["socialLinks"] | undefined,
  ) {
    if (!socialLinks) return undefined;

    const normalized = this.toDefinedStringRecord(
      Object.entries(socialLinks).map(
        ([key, value]): [string, string | undefined] => [
          key,
          this.normalizeUrl(value),
        ],
      ),
    );

    return normalized;
  }

  private normalizeUrl(value?: string) {
    const raw = value?.trim();
    if (!raw) return undefined;

    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

    try {
      return new URL(candidate).toString();
    } catch {
      return undefined;
    }
  }

  private toDefinedStringRecord(
    input:
      | Record<string, string | undefined>
      | Array<[string, string | undefined]>,
  ): Record<string, string> | undefined {
    const entries = Array.isArray(input) ? input : Object.entries(input);
    const normalized = Object.fromEntries(
      entries.filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && entry[1].length > 0,
      ),
    );

    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  private cleanJsonResponse(raw?: string): string {
    return (
      raw
        ?.replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim() ?? ""
    );
  }

  private async generateContentWithRetry<T>(operation: () => Promise<T>) {
    const maxRetries = this.getPositiveIntEnv(
      "AI_MAX_RETRIES",
      DEFAULT_AI_MAX_RETRIES,
    );
    const baseDelayMs = this.getPositiveIntEnv(
      "AI_RETRY_BASE_DELAY_MS",
      DEFAULT_AI_RETRY_BASE_DELAY_MS,
    );

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        return await this.withTimeout(operation());
      } catch (error) {
        lastError = error;
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          break;
        }

        await this.delay(baseDelayMs * (attempt + 1));
      }
    }

    throw this.toAIServiceError(lastError);
  }

  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    const timeoutMs = this.getPositiveIntEnv(
      "AI_REQUEST_TIMEOUT_MS",
      DEFAULT_AI_REQUEST_TIMEOUT_MS,
    );

    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(
            new AppError(
              `Resume parsing timed out after ${timeoutMs}ms`,
              504,
            ),
          );
        }, timeoutMs);
      }),
    ]);
  }

  private isRetryableError(error: unknown) {
    if (error instanceof AppError) {
      return error.statusCode === 504;
    }

    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    return (
      message.includes("503") ||
      message.includes("429") ||
      message.includes("unavailable") ||
      message.includes("rate limit") ||
      message.includes("timed out") ||
      message.includes("timeout")
    );
  }

  private toAIServiceError(error: unknown) {
    if (error instanceof AppError) {
      return error;
    }

    const message =
      error instanceof Error ? error.message : "Unknown AI provider error";
    return new AppError(`Resume parsing failed: ${message}`, 502);
  }

  private getPositiveIntEnv(name: string, fallback: number) {
    const raw = process.env[name]?.trim();
    if (!raw) return fallback;

    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
