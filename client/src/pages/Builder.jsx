import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineCode, HiOutlineSparkles, HiOutlineDocumentText, HiOutlineLightBulb, HiOutlineTemplate } from 'react-icons/hi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fetchJSON } from '../api.js';
import highlightReact from '../utils/highlight.js';
import { exportToDOCX } from '../utils/exportDocx.js';
import SuggestionPanel from '../components/SuggestionPanel.jsx';
import QRCodePanel from '../components/QRCodePanel.jsx';
import ResumeShare from '../components/ResumeShare.jsx';
import VersionHistory from '../components/VersionHistory.jsx';

const defaultSections = {
  summary: 'Experienced developer building modern web applications with AI-powered features.',
  experience: `- Built responsive React dashboards
- Implemented backend REST APIs
- Collaborated on Agile teams`,
  skills: 'JavaScript, React, Node.js, MongoDB, Express, AI prompts, PDF generation',
  projects: 'AI Resume Builder - Full-stack MERN app with ATS scoring, PDF export, and resume analytics.',
  education: 'B.S. in Computer Science or equivalent experience',
  certifications: 'MongoDB Basics, React Foundations, Cloud Fundamentals',
  internship: 'Interned at Tech Company - Developed and deployed features using React and Node.js',
  achievements: 'Dean\'s List 2023 | Published research on AI optimization | 10K+ GitHub followers',
  languages: 'English (Native), Spanish (Intermediate), Mandarin (Beginner)',
};

const defaultPersonalInfo = {
  fullName: 'Your Name',
  email: 'you@example.com',
  phone: '+91 98765 43210',
  location: 'India',
};

export default function Builder({ token }) {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const demoMode = new URLSearchParams(location.search).get('demo') === 'true';
  const [title, setTitle] = useState('Full Stack AI Resume');
  const [industry, setIndustry] = useState('AI / Web / Product');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [personalInfo, setPersonalInfo] = useState(defaultPersonalInfo);
  const [templateType, setTemplateType] = useState('classic');
  const [theme, setTheme] = useState('blue');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [sections, setSections] = useState(defaultSections);
  const [suggestions, setSuggestions] = useState([]);
  const [skillRecommendations, setSkillRecommendations] = useState([]);
  const [highlightKeywords, setHighlightKeywords] = useState([]);
  const [contentType, setContentType] = useState('objective');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    if (!token && !demoMode) {
      navigate('/login');
      return;
    }

    if (params.id && token) {
      fetchJSON(`/resume/${params.id}`, { token })
        .then((resume) => {
          setTitle(resume.title);
          setIndustry(resume.industry || '');
          setTargetRole(resume.targetRole || '');
          setPersonalInfo({ ...defaultPersonalInfo, ...(resume.personalInfo || {}) });
          setTemplateType(resume.templateType || 'classic');
          setTheme(resume.theme || 'blue');
          setGithub(resume.github || '');
          setLinkedin(resume.linkedin || '');
          setPortfolio(resume.portfolio || '');
          setSections({ ...defaultSections, ...(resume.sections || {}) });
        })
        .catch((err) => setError(err.message));
    }
  }, [params.id, token, navigate, demoMode]);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const h = q.get('highlight');
    if (h) {
      const kws = h.split(',').map((k) => k.trim()).filter(Boolean);
      setHighlightKeywords(kws);
    }
  }, [location.search]);

  const completion = Math.min(
    100,
    Math.round(
      ([
        title,
        industry,
        targetRole,
        personalInfo.fullName,
        personalInfo.email,
        sections.summary,
        sections.experience,
        sections.skills,
        sections.projects,
        sections.education,
      ].filter(Boolean).length /
        10) *
        100,
    ),
  );

  const atsPreviewScore = Math.min(
    100,
    Math.round(
      Math.max(
        40,
        completion + (sections.skills?.split(',')?.length || 0) * 4 - Math.max(0, 6 - sections.experience?.split('\n')?.length) * 2,
      ),
    ),
  );

  const handleSave = async () => {
    if (!token) {
      setMessage('Demo preview is active. Sign in to save resumes.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      const body = { title, industry, targetRole, personalInfo, templateType, theme, github, linkedin, portfolio, sections };
      const path = params.id ? `/resume/${params.id}` : '/resume';
      const method = params.id ? 'PUT' : 'POST';
      await fetchJSON(path, { method, token, body });
      setMessage('Resume saved successfully');
      setTimeout(() => setMessage(''), 3000);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSuggestion = async () => {
    setError('');
    if (!token) {
      setSuggestions([
        'Use measurable results in every experience bullet.',
        'Mirror important role keywords from the job description.',
        'Keep formatting simple, scannable, and ATS-friendly.',
      ]);
      return;
    }
    try {
      const data = await fetchJSON('/resume/suggestions', { method: 'POST', token, body: { title, industry, sections } });
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSkillRecommendations = async () => {
    setError('');
    if (!token) {
      setSkillRecommendations(['React.js', 'Node.js', 'MongoDB', 'REST APIs', 'TypeScript', 'Git']);
      return;
    }
    try {
      const data = await fetchJSON('/resume/skills', { method: 'POST', token, body: { title: targetRole || title, industry, sections } });
      setSkillRecommendations(data.skills || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateContent = async () => {
    setError('');
    setGeneratedContent('');
    if (!token) {
      setGeneratedContent('Motivated full stack developer with practical experience building responsive web applications, REST APIs, and AI-assisted product features. Strong foundation in JavaScript, React, Node.js, MongoDB, and clean user-focused delivery.');
      return;
    }
    setIsGenerating(true);
    try {
      const data = await fetchJSON('/resume/ai-content', {
        method: 'POST',
        token,
        body: { title: targetRole || title, industry, sections, type: contentType },
      });
      setGeneratedContent(data.content || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyGeneratedContent = () => {
    if (!generatedContent) return;
    const targetMap = {
      objective: 'summary',
      skills: 'skills',
      experience: 'experience',
      grammar: 'summary',
    };
    const sectionKey = targetMap[contentType] || 'summary';
    setSections((current) => ({ ...current, [sectionKey]: generatedContent }));
    setMessage(`AI content applied to ${sectionKey}.`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExport = async () => {
    const preview = document.getElementById('resume-preview');
    if (!preview) return;
    const canvas = await html2canvas(preview, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    pdf.addImage(imgData, 'PNG', 20, 20, 560, (canvas.height * 560) / canvas.width);
    pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  return (
    <div className="builder-page">
      <div className="builder-panel">
        <div className="panel-section">
          <div className="panel-header">
            <div>
              <h2>Resume Builder</h2>
              <p>Design an AI-enhanced resume with ATS-friendly sections, template control, and live feedback.</p>
            </div>
            <div className="status-pill">{demoMode ? 'Demo Preview' : 'Modern UI'}</div>
          </div>
          <div className="resume-status-row">
            <div className="resume-status-card glass-card">
              <span>Resume Completion</span>
              <strong>{completion}%</strong>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <div className="resume-status-card glass-card">
              <span>ATS readiness</span>
              <strong>{atsPreviewScore}%</strong>
              <p>{atsPreviewScore >= 75 ? 'Good keyword coverage' : 'Add more keywords and achievements'}</p>
            </div>
          </div>
          <div className="form-card">
            <label>
              <span className="label-with-icon">
                <HiOutlineDocumentText /> Resume title
              </span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              <span className="label-with-icon">
                <HiOutlineTemplate /> Template
              </span>
              <select value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="clean">Clean</option>
                <option value="simple">Simple Professional</option>
                <option value="developer">Modern Developer</option>
                <option value="creative">Creative Portfolio</option>
                <option value="minimal">Minimal Resume</option>
              </select>
            </label>
            <label>
              <span className="label-with-icon">
                <HiOutlineLightBulb /> Industry label
              </span>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. AI / Web / Product" />
            </label>
            <label>
              <span className="label-with-icon">
                <HiOutlineBriefcase /> Target role
              </span>
              <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Java Developer, Data Analyst" />
            </label>
            <p className="field-hint">Use industry labels and target roles to tailor your resume for campus placements, internships, and fresh graduate roles.</p>
            <label>
              <span className="label-with-icon">
                <HiOutlineSparkles /> Theme
              </span>
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
              </select>
            </label>
          </div>
          <div className="form-card">
            <div className="form-grid">
              <label>
                <span className="label-with-icon"><HiOutlineDocumentText /> Full name</span>
                <input value={personalInfo.fullName} onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} />
              </label>
              <label>
                <span className="label-with-icon"><HiOutlineDocumentText /> Email</span>
                <input value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
              </label>
              <label>
                <span className="label-with-icon"><HiOutlineDocumentText /> Phone</span>
                <input value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
              </label>
              <label>
                <span className="label-with-icon"><HiOutlineDocumentText /> Location</span>
                <input value={personalInfo.location} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} />
              </label>
            </div>
            <label>
              <span className="label-with-icon"><HiOutlineCode /> GitHub URL</span>
              <input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineCode /> LinkedIn URL</span>
              <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineCode /> Portfolio URL</span>
              <input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://portfolio.example.com" />
            </label>
          </div>
          <div className="form-card">
            <label>
              <span className="label-with-icon"><HiOutlineDocumentText /> Professional summary</span>
              <textarea value={sections.summary} onChange={(e) => setSections({ ...sections, summary: e.target.value })} rows={4} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineBriefcase /> Experience</span>
              <textarea value={sections.experience} onChange={(e) => setSections({ ...sections, experience: e.target.value })} rows={5} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineCode /> Core skills</span>
              <textarea value={sections.skills} onChange={(e) => setSections({ ...sections, skills: e.target.value })} rows={3} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineSparkles /> Projects</span>
              <textarea value={sections.projects} onChange={(e) => setSections({ ...sections, projects: e.target.value })} rows={3} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineAcademicCap /> Education</span>
              <textarea value={sections.education} onChange={(e) => setSections({ ...sections, education: e.target.value })} rows={3} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineAcademicCap /> Certifications</span>
              <textarea value={sections.certifications} onChange={(e) => setSections({ ...sections, certifications: e.target.value })} rows={2} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineBriefcase /> Internship</span>
              <textarea value={sections.internship} onChange={(e) => setSections({ ...sections, internship: e.target.value })} rows={2} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineSparkles /> Achievements</span>
              <textarea value={sections.achievements} onChange={(e) => setSections({ ...sections, achievements: e.target.value })} rows={2} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineCode /> Languages</span>
              <textarea value={sections.languages} onChange={(e) => setSections({ ...sections, languages: e.target.value })} rows={2} />
            </label>
          </div>
          <div className="form-card ai-card">
            <div className="panel-header compact">
              <div>
                <h3>AI Content Studio</h3>
                <p>Generate resume copy, role-ready skills, interview prompts, or a cover letter draft.</p>
              </div>
            </div>
            <div className="ai-content-row">
              <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                <option value="objective">Professional summary</option>
                <option value="skills">Skills block</option>
                <option value="experience">Experience bullets</option>
                <option value="coverLetter">Cover letter</option>
                <option value="interview">Interview prep</option>
                <option value="grammar">Grammar polish</option>
              </select>
              <button className="secondary" onClick={handleGenerateContent} type="button" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
            {generatedContent && (
              <div className="generated-box">
                <pre>{generatedContent}</pre>
                <button type="button" onClick={applyGeneratedContent}>
                  Apply to resume
                </button>
              </div>
            )}
          </div>
          <div className="builder-actions">
            <button onClick={handleSave}>Save Resume</button>
            <button className="secondary" onClick={handleSuggestion} type="button">AI Suggestions</button>
            <button className="secondary" onClick={handleSkillRecommendations} type="button">Recommend Skills</button>
            <button className="secondary" onClick={handleExport} type="button">Download PDF</button>
            <button className="secondary" onClick={() => {
              const resumeData = {
                title,
                targetRole,
                industry,
                personalInfo,
                sections,
                github,
                linkedin,
                portfolio,
              };
              exportToDOCX(resumeData, `${title.replace(/\s+/g, '_')}.docx`).catch((err) => setError(err.message));
            }} type="button">Download DOCX</button>
            <button className="secondary" onClick={() => window.print()} type="button">Print</button>
          </div>
          <div className="builder-actions">
            <span>Zoom:</span>
            <button className="secondary" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} type="button">− Zoom Out</button>
            <span>{zoomLevel}%</span>
            <button className="secondary" onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} type="button">+ Zoom In</button>
            <button className="secondary" onClick={() => setZoomLevel(100)} type="button">Reset</button>
          </div>
          <QRCodePanel portfolio={portfolio} linkedin={linkedin} github={github} />
          <ResumeShare resumeId={params.id} resumeTitle={title} targetRole={targetRole} summary={sections.summary} />
          <VersionHistory 
            resumeId={params.id} 
            token={token} 
            onRestore={(resume) => {
              setTitle(resume.title);
              setIndustry(resume.industry);
              setTargetRole(resume.targetRole);
              setPersonalInfo(resume.personalInfo);
              setTemplateType(resume.templateType);
              setTheme(resume.theme);
              setGithub(resume.github);
              setLinkedin(resume.linkedin);
              setPortfolio(resume.portfolio);
              setSections(resume.sections);
              setMessage('Resume restored successfully!');
              setTimeout(() => setMessage(''), 3000);
            }} 
          />
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
        <SuggestionPanel suggestions={suggestions} />
      </div>

      <div id="resume-preview" className={`resume-preview ${templateType} theme-${theme}`} style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
        <header>
          <div>
            <h1>{personalInfo.fullName || title}</h1>
            <p className="resume-title-line">{targetRole || title}</p>
            <p className="industry-badge">{industry}</p>
          </div>
          <div className="contact-links">
            {personalInfo.email && <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {github && <a href={github} target="_blank" rel="noreferrer">GitHub</a>}
            {linkedin && <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            {portfolio && <a href={portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
          </div>
        </header>
        <section>
          <h3>Summary</h3>
          <p>{highlightReact(sections.summary, highlightKeywords)}</p>
        </section>
        <section>
          <h3>Experience</h3>
          <pre>{highlightReact(sections.experience, highlightKeywords)}</pre>
        </section>
        <section>
          <h3>Skills</h3>
          <p>{highlightReact(sections.skills, highlightKeywords)}</p>
        </section>
        <section>
          <h3>Projects</h3>
          <pre>{highlightReact(sections.projects, highlightKeywords)}</pre>
        </section>
        <section>
          <h3>Education</h3>
          <p>{sections.education}</p>
        </section>
        <section>
          <h3>Certifications</h3>
          <p>{sections.certifications}</p>
        </section>
        {sections.internship && (
          <section>
            <h3>Internship</h3>
            <p>{highlightReact(sections.internship, highlightKeywords)}</p>
          </section>
        )}
        {sections.achievements && (
          <section>
            <h3>Achievements</h3>
            <p>{highlightReact(sections.achievements, highlightKeywords)}</p>
          </section>
        )}
        {sections.languages && (
          <section>
            <h3>Languages</h3>
            <p>{sections.languages}</p>
          </section>
        )}
      </div>
      {skillRecommendations.length > 0 && (
        <div className="suggestion-panel floating-panel">
          <h3>Recommended Skills</h3>
          <p>Use these keywords in your resume to improve ATS match and recruiter relevance.</p>
          <ul>
            {skillRecommendations.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
