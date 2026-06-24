const API_HOST = import.meta.env.VITE_API_URL || "http://localhost:4001/api";
const AI_API_HOST =
  import.meta.env.VITE_AI_API_URL || "http://localhost:8000/api";

// Regular API calls (to Node.js backend)
export async function fetchJSON(path, options = {}) {
  try {
    const url = path.startsWith("http") ? path : `${API_HOST}${path}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      method: options.method || "GET",
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed with status ${response.status}`,
      );
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// AI Backend API calls (to Python backend)
export async function fetchAI(path, options = {}) {
  try {
    const url = path.startsWith("http") ? path : `${AI_API_HOST}${path}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      method: options.method || "GET",
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.message ||
          `AI Request failed with status ${response.status}`,
      );
    }

    return data;
  } catch (error) {
    console.error("AI API Error:", error);
    throw error;
  }
}

// AI Resume Analysis
export async function analyzeResume(resumeContent, jobDescription = "") {
  return fetchAI("/analyze-resume", {
    method: "POST",
    body: {
      content: resumeContent,
      jobDescription: jobDescription,
    },
  });
}

// Extract Keywords
export async function extractKeywords(resumeContent, jobDescription = "") {
  return fetchAI("/extract-keywords", {
    method: "POST",
    body: {
      content: resumeContent,
      jobDescription: jobDescription,
    },
  });
}

// Optimize Resume Section
export async function optimizeSection(section, content, jobDescription = "") {
  return fetchAI("/optimize-section", {
    method: "POST",
    body: {
      section: section,
      content: content,
      jobDescription: jobDescription,
    },
  });
}

// Get ATS Score
export async function getATSScore(resumeContent, jobDescription = "") {
  return fetchAI("/ats-score", {
    method: "POST",
    body: {
      content: resumeContent,
      jobDescription: jobDescription,
    },
  });
}
