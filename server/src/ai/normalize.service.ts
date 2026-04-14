const pdfParse = require("pdf-parse");
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { GoogleGenAI } from "@google/genai";
import { CreateCandidateDto } from "../features/candidates/candidates.dto";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export class NormalizeService {
  async fromPDF(buffer: Buffer): Promise<CreateCandidateDto> {
    const parsed = await pdfParse(buffer);
    const text = parsed.text;

    const response = await genai.models.generateContent({
      model: "gemini-1.5-flash",
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
    });

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return JSON.parse(raw) as CreateCandidateDto;
  }

  async fromCSV(buffer: Buffer): Promise<CreateCandidateDto[]> {
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

  async fromExcel(buffer: Buffer): Promise<CreateCandidateDto[]> {
    const workbook = new ExcelJS.Workbook();

    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;

    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    const rows: CreateCandidateDto[] = [];
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

  private mapCSVRow(row: Record<string, string>): CreateCandidateDto {
    const fullName = row["fullname"] ?? row["full_name"] ?? row["name"] ?? "";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") ?? "";

    return {
      firstName: firstName,
      lastName: lastName,
      email: row["email"] ?? "",
      headline: row["headline"] ?? "",
      bio: row["summary"] ?? row["bio"] ?? undefined,
      location: row["location"] ?? "Unknown",
      skills: row["skills"]
        ? row["skills"].split(",").map((s) => ({
            name: s.trim(),
            level: "Intermediate" as const,
            yearsOfExperience: 2,
          }))
        : [],
      languages: row["languages"]
        ? row["languages"].split(",").map((l) => ({
            name: l.trim(),
            proficiency: "Fluent" as const,
          }))
        : [],
      experience: [], // Assuming work experience is not in CSV, or could parse if available
      education: [],
      certifications: [],
      projects: [],
      availability: {
        status: "Available" as const,
        type: "Full-time" as const,
        startDate: undefined,
      },
      socialLinks: undefined,
    };
  }
}
