const express = require("express");
const auth = require("../middleware/auth");
const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");
const ResumeVersion = require("../models/ResumeVersion");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const resumes = await Resume.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(resumes);
});

// list analysis history for current user
router.get("/analysis", auth, async (req, res) => {
  try {
    const archived = req.query.archived === "true";
    const filter = { user: req.user.id, deleted: archived };
    const list = await Analysis.find(filter)
      .populate("resume", "title")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error("Fetch analysis error:", error.message || error);
    res.status(500).json({ message: "Failed to fetch analysis" });
  }
});

// analysis statistics
router.get("/analysis/stats", auth, async (req, res) => {
  try {
    const activeCount = await Analysis.countDocuments({
      user: req.user.id,
      deleted: false,
    });
    const archivedCount = await Analysis.countDocuments({
      user: req.user.id,
      deleted: true,
    });
    const latest = await Analysis.find({ user: req.user.id, deleted: false })
      .populate("resume", "title")
      .sort({ createdAt: -1 })
      .limit(3);

    const analyses = await Analysis.find({
      user: req.user.id,
      deleted: false,
    }).lean();
    const keywordCounts = analyses.reduce((acc, analysis) => {
      const missingSkills =
        analysis.result?.missingSkills ||
        analysis.result?.analysis?.missingSkills;
      const missing = Array.isArray(missingSkills) ? missingSkills : [];
      missing.forEach((keyword) => {
        const normalized = String(keyword || "")
          .trim()
          .toLowerCase();
        if (!normalized) return;
        acc[normalized] = (acc[normalized] || 0) + 1;
      });
      return acc;
    }, {});

    const topKeywords = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);

    res.json({ activeCount, archivedCount, latest, topKeywords });
  } catch (error) {
    console.error("Fetch analysis stats error:", error.message || error);
    res.status(500).json({ message: "Failed to fetch analysis stats" });
  }
});

// get single analysis
router.get("/analysis/:id", auth, async (req, res) => {
  try {
    const item = await Analysis.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("resume", "title");
    if (!item) return res.status(404).json({ message: "Analysis not found" });
    res.json(item);
  } catch (error) {
    console.error("Fetch single analysis error:", error.message || error);
    res.status(500).json({ message: "Failed to fetch analysis" });
  }
});

// soft-delete an analysis
router.delete("/analysis/:id", auth, async (req, res) => {
  try {
    const item = await Analysis.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, deleted: false },
      { deleted: true, deletedAt: Date.now() },
      { new: true },
    );
    if (!item)
      return res
        .status(404)
        .json({ message: "Analysis not found or already deleted" });
    res.json({ message: "Analysis archived" });
  } catch (error) {
    console.error("Delete analysis error:", error.message || error);
    res.status(500).json({ message: "Failed to archive analysis" });
  }
});

router.patch("/analysis/:id/restore", auth, async (req, res) => {
  try {
    const item = await Analysis.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, deleted: true },
      { deleted: false, deletedAt: undefined },
      { new: true },
    );
    if (!item)
      return res
        .status(404)
        .json({ message: "Analysis not found or not archived" });
    res.json({ message: "Analysis restored" });
  } catch (error) {
    console.error("Restore analysis error:", error.message || error);
    res.status(500).json({ message: "Failed to restore analysis" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

router.post("/", auth, async (req, res) => {
  const {
    title,
    industry,
    targetRole,
    personalInfo,
    templateType,
    theme,
    github,
    linkedin,
    portfolio,
    sections,
  } = req.body;
  try {
    const resume = new Resume({
      user: req.user.id,
      title,
      industry,
      targetRole,
      personalInfo,
      templateType,
      theme,
      github,
      linkedin,
      portfolio,
      sections,
    });
    await resume.save();
    res.json(resume);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

router.put("/:id", auth, async (req, res) => {
  const {
    title,
    industry,
    targetRole,
    personalInfo,
    templateType,
    theme,
    github,
    linkedin,
    portfolio,
    sections,
  } = req.body;
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        title,
        industry,
        targetRole,
        personalInfo,
        templateType,
        theme,
        github,
        linkedin,
        portfolio,
        sections,
      },
      { new: true },
    );
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json({ message: "Resume deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

router.post("/suggestions", auth, async (req, res) => {
  const { title, industry, sections } = req.body;
  const fallback = [
    "Use strong action verbs and quantify achievements where possible.",
    "Highlight measurable results in the summary section for stronger impact.",
    "Keep technical skills current and aligned with your target role.",
    "Use a clean layout and consistent formatting for easier readability.",
  ];

  if (!process.env.OPENAI_API_KEY) {
    return res.json({ suggestions: fallback });
  }

  const prompt = `Improve the following resume content for a strong ${industry || "software"} resume. Title: ${title}. Sections: ${JSON.stringify(
    sections,
  )}. Provide 4 concise suggestions.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 220,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const suggestions = text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((item) => item.replace(/^[\d\-\.\s]+/, "").trim())
      .slice(0, 6);

    res.json({ suggestions: suggestions.length ? suggestions : fallback });
  } catch (error) {
    console.error("AI suggestion error:", error.message || error);
    res.json({ suggestions: fallback });
  }
});

function scoreATS(sections, jobDescription = "") {
  const keywords =
    (jobDescription || `${sections.skills || ""} ${sections.summary || ""}`)
      .toLowerCase()
      .match(/\b[a-z0-9+#\.\-]+\b/g) || [];
  const uniqueKeywords = [...new Set(keywords)];
  const content =
    `${sections.summary || ""} ${sections.experience || ""} ${sections.skills || ""}`.toLowerCase();
  const matchCount = uniqueKeywords.filter((keyword) =>
    content.includes(keyword),
  ).length;
  const score = Math.min(
    100,
    Math.round((matchCount / Math.max(uniqueKeywords.length, 1)) * 100),
  );
  return score;
}

router.post("/ats", auth, async (req, res) => {
  const { sections, jobDescription } = req.body;
  const score = scoreATS(sections, jobDescription);
  const suggestions = [];
  if (score < 70) {
    suggestions.push(
      "Add more role-specific keywords to the summary and experience sections.",
    );
    suggestions.push(
      "Include measurable results and technologies used for each project.",
    );
  } else {
    suggestions.push(
      "Your resume has a good keyword match. Refine formatting and keep the content concise.",
    );
  }
  res.json({ score, suggestions });
});

router.post("/skills", auth, async (req, res) => {
  const { title, industry } = req.body;
  const fallback = [
    "React.js",
    "Node.js",
    "MongoDB",
    "TypeScript",
    "API design",
  ];

  if (!process.env.OPENAI_API_KEY) {
    return res.json({ skills: fallback });
  }

  const prompt = `Suggest the most important and trending technical skills for a ${title} in ${industry || "software development"}. Provide 6 skills.`;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 220,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const skills = text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((item) => item.replace(/^[\d\-\.\s]+/, "").trim())
      .slice(0, 8);
    res.json({ skills: skills.length ? skills : fallback });
  } catch (error) {
    console.error("AI skills error:", error.message || error);
    res.json({ skills: fallback });
  }
});

router.post("/analyze-job", auth, async (req, res) => {
  const { sections, jobDescription } = req.body;
  const score = scoreATS(sections, jobDescription);
  const missing = [];
  const jdKeywords =
    (jobDescription || "").toLowerCase().match(/\b[a-z0-9+#\.\-]+\b/g) || [];
  const uniquekeywords = [...new Set(jdKeywords)];
  uniquekeywords.forEach((keyword) => {
    if (
      !`${sections.summary || ""} ${sections.experience || ""} ${sections.skills || ""}`
        .toLowerCase()
        .includes(keyword)
    ) {
      if (missing.length < 8 && keyword.length > 2) {
        missing.push(keyword);
      }
    }
  });
  res.json({
    score,
    missingSkills: missing,
    suggestions: [
      `Match more keywords from the job description in your summary and skills sections.`,
      `Highlight experience that directly aligns with the job role.`,
    ],
  });
});

router.post("/ai-content", auth, async (req, res) => {
  const { title, industry, sections, type } = req.body;
  const fallbackFeatures = {
    objective: `A motivated ${title} with strong foundational knowledge in software engineering and a focus on delivering high-quality applications.`,
    skills: `Java, Spring Boot, React, REST APIs, SQL, Git`,
    experience: `Worked on academic projects and internships building web solutions with modern Java and React stacks. Highlight your Java internship experience, the technologies you used, and the impact you delivered.`,
    coverLetter: `I am excited to apply for this role as a ${title}. I bring strong analytical thinking, coding expertise, and a passion for building impactful software.`,
    interview: `Describe your Java internship projects, the technologies you used, and the results you achieved. Practice talking through how you solved problems and learned new tools.`,
    grammar: `Your text is clear and professional. Consider simplifying long sentences for stronger impact.`,
  };

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      content: fallbackFeatures[type] || fallbackFeatures.objective,
    });
  }

  const prompt = `Generate a professional ${type} for a ${industry || "software"} ${title}. Sections: ${JSON.stringify(sections)}.`;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    res.json({ content: text.trim() });
  } catch (error) {
    console.error("AI content error:", error.message || error);
    res.json({ content: fallbackFeatures[type] || fallbackFeatures.objective });
  }
});

router.post("/chat", auth, async (req, res) => {
  const { message, history = [] } = req.body;
  const cleanMessage = String(message || "").trim();

  if (!cleanMessage) {
    return res.status(400).json({ message: "Message is required" });
  }

  const fallbackReply =
    "I can help improve your resume summary, ATS keywords, project bullets, cover letters, and interview prep. For strongest results, share the target role and paste a job description.";

  const generateFallbackReply = (message) => {
    const text = String(message || "").toLowerCase();
    if (text.includes("summary")) {
      return 'For your resume summary, lead with your role, key skills, and impact. Example: "Full-stack developer with experience building scalable React and Node.js apps, improving user engagement and delivery speed."';
    }
    if (text.includes("keyword") || text.includes("ats")) {
      return "Use role-specific keywords like React, Node.js, JavaScript, MongoDB, REST APIs, Agile, and performance optimization. Add them naturally to your summary, skills, and experience sections.";
    }
    if (text.includes("project") || text.includes("bullet")) {
      return 'Write bullets using action verbs, the project goal, your role, and quantifiable impact. Example: "Built an AI resume builder with JWT auth, file export, and analysis features, helping users improve application quality."';
    }
    if (text.includes("cover letter")) {
      return "For a cover letter, say why you fit the role, mention your top achievements, and end with a call to action. Keep it concise and tailored to the job description.";
    }
    if (text.includes("interview")) {
      return "Prepare by explaining your resume highlights, your technical approach, and how you solved problems. Practice answers for role-related questions and ATS/keyword improvements.";
    }
    if (text.includes("what") || text.includes("how") || text.includes("why")) {
      return "I can help refine your resume or job application. Tell me your target role, paste the job description, or ask for a specific section to improve.";
    }
    return fallbackReply;
  };

  if (!process.env.OPENAI_API_KEY) {
    return res.json({ reply: generateFallbackReply(cleanMessage) });
  }

  try {
    const messages = [
      {
        role: "system",
        content:
          "You are a concise resume coach inside an AI resume builder. Give practical, ATS-friendly, industry-ready advice. Keep replies under 120 words unless the user asks for a long draft.",
      },
      ...history
        .filter((item) => ["user", "assistant"].includes(item.role))
        .slice(-8)
        .map((item) => ({
          role: item.role,
          content: String(item.content || "").slice(0, 1200),
        })),
      { role: "user", content: cleanMessage },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 240,
        temperature: 0.65,
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    res.json({ reply: reply || fallbackReply });
  } catch (error) {
    console.error("Assistant chat error:", error.message || error);
    res.json({ reply: fallbackReply });
  }
});

// save analysis result for history/analytics
router.post("/analysis", auth, async (req, res) => {
  const { resumeId, jobDescription, sections, result } = req.body;
  try {
    const analysis = new Analysis({
      user: req.user.id,
      resume: resumeId || undefined,
      jobDescription,
      sections,
      result,
    });
    await analysis.save();
    res.json({ message: "Analysis saved", analysisId: analysis._id });
  } catch (error) {
    console.error("Save analysis error:", error.message || error);
    res.status(500).json({ message: "Failed to save analysis" });
  }
});

// get version history for a resume
router.get("/:id/versions", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const versions = await ResumeVersion.find({
      resume: req.params.id,
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(versions);
  } catch (error) {
    console.error("Get versions error:", error.message || error);
    res.status(500).json({ message: "Failed to fetch versions" });
  }
});

// restore from a specific version
router.post("/:id/restore-version/:versionId", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const version = await ResumeVersion.findOne({
      _id: req.params.versionId,
      resume: req.params.id,
      user: req.user.id,
    });
    if (!version) {
      return res.status(404).json({ message: "Version not found" });
    }

    // Create a new version from current state before restoring
    const currentVersion = new ResumeVersion({
      resume: resume._id,
      user: req.user.id,
      title: resume.title,
      industry: resume.industry,
      targetRole: resume.targetRole,
      personalInfo: resume.personalInfo,
      templateType: resume.templateType,
      theme: resume.theme,
      github: resume.github,
      linkedin: resume.linkedin,
      portfolio: resume.portfolio,
      sections: resume.sections,
      versionNumber:
        (await ResumeVersion.countDocuments({ resume: resume._id })) + 1,
      versionName: `Auto-backup before restore`,
    });
    await currentVersion.save();

    // Restore from the selected version
    resume.title = version.title;
    resume.industry = version.industry;
    resume.targetRole = version.targetRole;
    resume.personalInfo = version.personalInfo;
    resume.templateType = version.templateType;
    resume.theme = version.theme;
    resume.github = version.github;
    resume.linkedin = version.linkedin;
    resume.portfolio = version.portfolio;
    resume.sections = version.sections;
    resume.updatedAt = new Date();
    await resume.save();

    res.json({ message: "Resume restored from version", resume });
  } catch (error) {
    console.error("Restore version error:", error.message || error);
    res.status(500).json({ message: "Failed to restore version" });
  }
});

module.exports = router;
