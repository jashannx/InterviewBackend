import OpenAI from "openai";
import dotenv from "dotenv";
import { z } from "zod"; 
 
    import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";


dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z.number(),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),

  preparationPlan: z.array(z.object({
    day: z.number(),
    focus: z.string(),
    tasks: z.array(z.string())
  })),
  title: z.string(),
});

const resumePdfSchema = z.object({
  resumehtml: z.string()
});

export async function generateInterviewReport({
  resume,
  selfdescription,
  jobdescription,
}) {
  try {
    const completion = await client.chat.completions.create({
    //  model: "qwen/qwen3-coder:free"
     model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Return ONLY valid JSON.

Generate an interview report using this structure:

{
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }(4questions)
  ],
  "behavioralQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }(4questions)
  ],
  "skillGaps": [
    {
      "skill": string,
      "severity": "low" | "medium" | "high"
    }(2-3 skills)
  ],
 
"preparationPlan": [
  {
    "day": 1,
    "focus": "Topic name",
    "tasks": ["activity1", "activity2"]
  }(5-6 days plan proper)
],
"title": string
//job title that best matches the job description
}
          `,
        },

        {
          role: "user",
          content: `
Resume:
${resume}

Self Description:
${selfdescription}

Job Description:
${jobdescription}
          `,

        },
      ],

      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content;

    // parse response
    const parsed = JSON.parse(raw);

    // validate using zod
    const validated = interviewReportSchema.parse(parsed);

    // console.log(validated);

    return validated;
  } catch (error) {
    console.error("Validation or API Error:", error);
  }
}

export async function generatePdf({resume,selfdescription,jobdescription}){
  
  try {
    const completion = await client.chat.completions.create({
    //  model: "qwen/qwen3-coder:free"
      model: "openai/gpt-4o-mini", 

      messages: [
        {
          role: "system",
          content: `
    You are an expert ATS resume writer and HTML designer.

    Return ONLY valid JSON.
    No Unnecessary extra spaces or line breaks.
    Single Page Resume in HTML format with inline CSS.
    Generate a professional one-page ATS-friendly resume in clean HTML with inline CSS.
    font-family: Arial, sans-serif;
    Rules:
    - Return ONLY JSON
    - No markdown
    - No backticks
    - No explanations
    - HTML must be production-ready
    - Use semantic HTML
    - Use inline CSS only
    - Make the design modern and minimal
    - Use professional fonts
    - Optimize content according to job description
    - Improve wording and bullet points
    - Include relevant keywords from the job description
    - Do NOT invent fake experience
    - Keep information truthful
    - Resume should fit properly on A4 page
    - Use proper spacing and hierarchy
    - Add sections:
      - Name
      - Contact
      - Summary
      - Skills
      - Experience
      - Projects
      - Education

    Return format:

    {
      "resumehtml": "<html>...</html>"
    }
              `
            },

            {
              role: "user",
              content: `
    Existing Resume:
    ${resume}

    Self Description:
    ${selfdescription}

    Job Description:
    ${jobdescription}
              `
            }
          ],

          temperature: 0.3
        });

        const raw = completion.choices[0].message.content;

        const parsed = JSON.parse(raw);

        const validated = resumePdfSchema.parse(parsed);

        return validated;

      } catch (error) {
        console.error("Resume PDF Generation Error:", error);
      }
    }

export async function htmlToPdf(html) {
  try {
    // Detect environment
    const isProduction = process.env.NODE_ENV === "production";

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isProduction
        ? await chromium.executablePath()   // cloud binary
        : puppeteer.executablePath(),        // local Chrome
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      preferCSSPageSize: true,
    });

    await browser.close();
    return pdfBuffer;

  } catch (error) {
    console.error("HTML to PDF Conversion Error:", error);
    throw error;
  }
}

