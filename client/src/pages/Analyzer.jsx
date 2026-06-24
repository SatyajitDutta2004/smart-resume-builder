import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineChartBar, HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineBriefcase } from 'react-icons/hi';
import { fetchJSON } from '../api.js';

export default function Analyzer({ token }) {
  const [jobDescription, setJobDescription] = useState('');
  const [sections, setSections] = useState({
    summary: '',
    experience: '',
    skills: '',
  });
  const [result, setResult] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [atsSuggestions, setAtsSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loadMessage, setLoadMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    fetchJSON('/resume', { token })
      .then((list) => setResumes(list || []))
      .catch(() => setResumes([]));
  }, [token]);

  // preload from history-open action
  useEffect(() => {
    const raw = sessionStorage.getItem('analysisToOpen');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.jobDescription) setJobDescription(parsed.jobDescription);
        if (parsed.sections) setSections(parsed.sections);
      } catch (e) {}
      sessionStorage.removeItem('analysisToOpen');
    }
  }, []);

  const handleAnalyze = async () => {
    setError('');
    setResult(null);
    setAtsScore(null);

    try {
      const data = await fetchJSON('/resume/analyze-job', {
        method: 'POST',
        token,
        body: { sections, jobDescription },
      });
      setResult(data);
      // save analysis to backend for history
      try {
        await fetchJSON('/resume/analysis', {
          method: 'POST',
          token,
          body: { resumeId: selectedResume?._id, jobDescription, sections, result: data },
        });
      } catch (e) {
        // non-blocking
        console.warn('Could not save analysis', e.message || e);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleATS = async () => {
    setError('');
    setAtsScore(null);

    try {
      const data = await fetchJSON('/resume/ats', {
        method: 'POST',
        token,
        body: { sections, jobDescription },
      });
      setAtsScore(data.score);
      setAtsSuggestions(data.suggestions || []);
      // save ATS analysis to backend
      try {
        await fetchJSON('/resume/analysis', {
          method: 'POST',
          token,
          body: { resumeId: selectedResume?._id, jobDescription, sections, result: data },
        });
      } catch (e) {
        console.warn('Could not save ATS analysis', e.message || e);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="builder-page analyzer-page">
      <div className="builder-panel">
        <div className="panel-section">
          <div className="panel-header">
            <div>
              <h2>Job Description Analyzer</h2>
              <p>Paste a job description and compare it against your resume content. Get ATS scoring and targeted suggestions.</p>
            </div>
            <div className="status-pill">ATS Tools</div>
          </div>

          <div className="form-card">
            <label>
              <span className="label-with-icon"><HiOutlineChartBar /> Job description</span>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={6} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineSparkles /> Resume summary</span>
              <textarea value={sections.summary} onChange={(e) => setSections({ ...sections, summary: e.target.value })} rows={3} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineShieldCheck /> Skills</span>
              <textarea value={sections.skills} onChange={(e) => setSections({ ...sections, skills: e.target.value })} rows={2} />
            </label>
            <label>
              <span className="label-with-icon"><HiOutlineBriefcase /> Experience</span>
              <textarea value={sections.experience} onChange={(e) => setSections({ ...sections, experience: e.target.value })} rows={4} />
            </label>
            <div className="analyzer-actions">
              <button type="button" onClick={handleAnalyze}>Analyze JD</button>
              <button type="button" className="secondary" onClick={handleATS}>
                Check ATS Score
              </button>
            </div>
            <div className="resume-tools">
              <label>
                <small>Select a saved resume</small>
                <select value={selectedResume?._id || ''} onChange={(e) => setSelectedResume(resumes.find(r=>r._id===e.target.value) || null)}>
                  <option value="">-- choose resume --</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>{r.title}</option>
                  ))}
                </select>
              </label>
              <div className="resume-tools-actions">
                <button type="button" disabled={!selectedResume} onClick={() => {
                  if (!selectedResume) return;
                  const loadedSections = {
                    summary: selectedResume.sections?.summary || '',
                    experience: selectedResume.sections?.experience || '',
                    skills: selectedResume.sections?.skills || '',
                  };
                  setSections(loadedSections);
                  setLoadMessage(`Loaded resume: ${selectedResume.title || 'Untitled resume'}`);
                  setTimeout(() => setLoadMessage(''), 4000);
                }}>
                  Load into fields
                </button>
                <button type="button" className="secondary" disabled={!selectedResume} onClick={() => selectedResume && navigate(`/builder/${selectedResume._id}`)}>
                  Open resume
                </button>
              </div>
            </div>
            {loadMessage && <div className="success-message">{loadMessage}</div>}
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>

      <aside className="suggestion-panel analyzer-right">
        <div className="metric-card">
          <h3>ATS Score</h3>
          <div className="ats-score">
            <strong>{atsScore !== null ? `${atsScore}%` : '-'}</strong>
            <div className="progress-track" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${atsScore || 0}%` }} />
            </div>
          </div>
        </div>

        {result && (
          <div className="analysis-result">
            <h3>Job match analysis</h3>
            <p><strong>Match score:</strong> {result.score}/100</p>
            <p><strong>Missing keywords:</strong> {result.missingSkills.length ? result.missingSkills.join(', ') : 'None detected'}</p>
            <ul>
              {result.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
            <div style={{marginTop:8}}>
              <button onClick={() => {
                const kw = (result.missingSkills || []).slice(0,8).join(',');
                if (!kw) return;
                if (selectedResume && selectedResume._id) {
                  navigate(`/builder/${selectedResume._id}?highlight=${encodeURIComponent(kw)}`);
                } else {
                  navigate(`/builder?highlight=${encodeURIComponent(kw)}`);
                }
              }}>Highlight in Builder</button>
            </div>
          </div>
        )}

        {atsScore !== null && (
          <div className="analysis-result">
            <h3>ATS suggestions</h3>
            <p><strong>ATS score:</strong> {atsScore}/100</p>
            <ul>
              {atsSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
            <div style={{marginTop:8}}>
              <button onClick={() => {
                const kw = (result?.missingSkills || []).slice(0,8).join(',') || '';
                if (!kw) return;
                if (selectedResume && selectedResume._id) {
                  navigate(`/builder/${selectedResume._id}?highlight=${encodeURIComponent(kw)}`);
                } else {
                  navigate(`/builder?highlight=${encodeURIComponent(kw)}`);
                }
              }}>Highlight in Builder</button>
            </div>
          </div>
        )}
        <div style={{marginTop:12}}>
          <button className="secondary" onClick={() => navigate('/analysis-history')}>View Analysis History</button>
        </div>
      </aside>
    </section>
  );
}
