import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
} from "docx";
import { saveAs } from "file-saver";

const createBorder = () => ({
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
});

export async function exportToDOCX(resumeData, filename = "resume.docx") {
  try {
    const sections = resumeData.sections || {};
    const personalInfo = resumeData.personalInfo || {};
    const title = resumeData.title || "Resume";

    const contactLinks = [];
    if (personalInfo.email) contactLinks.push(personalInfo.email);
    if (personalInfo.phone) contactLinks.push(personalInfo.phone);
    if (personalInfo.location) contactLinks.push(personalInfo.location);
    if (resumeData.github) contactLinks.push(resumeData.github);
    if (resumeData.linkedin) contactLinks.push(resumeData.linkedin);
    if (resumeData.portfolio) contactLinks.push(resumeData.portfolio);

    const docSections = [
      // Header with name and title
      new Paragraph({
        text: personalInfo.fullName || title,
        style: "Heading1",
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: resumeData.targetRole || resumeData.industry || "",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        style: "Heading2",
      }),

      // Contact info
      new Paragraph({
        text: contactLinks.join(" | "),
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        style: "Normal",
      }),
    ];

    // Summary section
    if (sections.summary) {
      docSections.push(
        new Paragraph({
          text: "PROFESSIONAL SUMMARY",
          style: "Heading2",
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: sections.summary,
          spacing: { after: 200 },
        }),
      );
    }

    // Experience section
    if (sections.experience) {
      docSections.push(
        new Paragraph({
          text: "EXPERIENCE",
          style: "Heading2",
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: sections.experience,
          spacing: { after: 200 },
        }),
      );
    }

    // Skills section
    if (sections.skills) {
      docSections.push(
        new Paragraph({
          text: "SKILLS",
          style: "Heading2",
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: sections.skills,
          spacing: { after: 200 },
        }),
      );
    }

    // Projects section
    if (sections.projects) {
      docSections.push(
        new Paragraph({
          text: "PROJECTS",
          style: "Heading2",
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: sections.projects,
          spacing: { after: 200 },
        }),
      );
    }

    // Education section
    if (sections.education) {
      docSections.push(
        new Paragraph({
          text: "EDUCATION",
          style: "Heading2",
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: sections.education,
          spacing: { after: 200 },
        }),
      );
    }

    // Certifications section
    if (sections.certifications) {
      docSections.push(
        new Paragraph({
          text: "CERTIFICATIONS",
          style: "Heading2",
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: sections.certifications,
          spacing: { after: 200 },
        }),
      );
    }

    // Internship section
    if (sections.internship) {
      docSections.push(
        new Paragraph({
          text: "INTERNSHIP",
          style: "Heading2",
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: sections.internship,
          spacing: { after: 200 },
        }),
      );
    }

    // Achievements section
    if (sections.achievements) {
      docSections.push(
        new Paragraph({
          text: "ACHIEVEMENTS",
          style: "Heading2",
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: sections.achievements,
          spacing: { after: 200 },
        }),
      );
    }

    // Languages section
    if (sections.languages) {
      docSections.push(
        new Paragraph({
          text: "LANGUAGES",
          style: "Heading2",
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: sections.languages,
          spacing: { after: 200 },
        }),
      );
    }

    const doc = new Document({
      sections: [
        {
          children: docSections,
          properties: {},
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error("DOCX export error:", error);
    throw new Error("Failed to export resume as DOCX");
  }
}
