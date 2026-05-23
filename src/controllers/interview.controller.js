import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import {generateInterviewReport ,generatePdf,htmlToPdf}from "../services/ai.service.js";
import interviewReportModel from "../models/interviewReport.model.js";

async function extractTextFromPDF(buffer) {
  const uint8Array = new Uint8Array(buffer);

  const pdf = await pdfjsLib.getDocument(uint8Array).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    const content = await page.getTextContent();

    const strings = content.items.map((item) => item.str);

    text += strings.join(" ");
  }

  return text;
}

export async function InterviewReportgenerator(req, res) {
  try {
    const { selfDescription, jobDescription } = req.body;
      if (!jobDescription || jobDescription.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Job Description is required"
            });
        }
if (!selfDescription || selfDescription.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Self Description is required"
            });
        }

    let resumecontent = "";

    if (req.file) {
      resumecontent = await extractTextFromPDF(req.file.buffer);
    }

    const report = await generateInterviewReport({
  resume: resumecontent,
  selfdescription: selfDescription,
  jobdescription: jobDescription,
});

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      jobDescription: jobDescription,
      resume: resumecontent,
      selfDescription: selfDescription,
      ...report,
    }); 
    res.json(interviewReport);

  } catch (error) {
console.error("FULL ERROR => ", error);

res.status(500).json({
  message: error.message,
  stack: error.stack,
});
  }
}
export async function getInterviewReport(req, res) {
  try {
    const { interviewId } = req.params;
    const report = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json({
      report,
      message: "Report retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching interview report:", error);
    res.status(500).json({ message: "Server error" });
  }
}
export async function getAllInterviewReports(req, res) {
  try {
    const reports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");
    res.status(200).json({
      reports,
      message: "Reports retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching interview reports:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function generateResumePdf(req, res) {
  const { interviewId } = req.params;
  if (!interviewId) {
    return res.status(400).json({ message: "Interview ID is required" });
  }
  try {
    const report = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    const{resume,selfDescription,jobDescription} = report;

    // Generate HTML
    const result = await generatePdf({
      resume,
      selfdescription: selfDescription,
      jobdescription: jobDescription
    });

    // Extract HTML
    const html = result.resumehtml;

    // Convert to PDF
    const pdfBuffer = await htmlToPdf(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume_${interviewId}.pdf"`,
    }) 
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating resume PDF:", error);
    res.status(500).json({ message: "Server error" });
  }
}