import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJSON } from '../api.js';
import ResumeCard from '../components/ResumeCard.jsx';
import KeywordChart from '../components/KeywordChart.jsx';

function ConfirmModal({ title, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <h2>Delete resume?</h2>
        <p>Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="secondary" onClick={onCancel} type="button">
            Cancel
          </button>
          <button onClick={onConfirm} type="button">
            Delete resume
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ token, logout }) {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [analysisStats, setAnalysisStats] = useState({ activeCount: 0, archivedCount: 0, latest: [] });
  const [error, setError] = useState('');
  const [keywordCounts, setKeywordCounts] = useState([]);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchJSON('/resume', { token })
      .then(setResumes)
      .catch((err) => setError(err.message));

    fetchJSON('/resume/analysis/stats', { token })
      .then((data) => setAnalysisStats(data))
      .catch((err) => {
        console.warn('Unable to load analysis stats', err.message);
      });

    // fetch analyses to compute missing keyword counts for visualization
    fetchJSON('/resume/analysis?archived=false', { token })
      .then((list) => {
        const counts = list.reduce((acc, item) => {
          const missingSkills = item.result?.missingSkills || item.result?.analysis?.missingSkills;
          const missing = Array.isArray(missingSkills)
            ? missingSkills
            : [];
          missing.forEach((kw) => {
            const k = String(kw || '').trim().toLowerCase();
            if (!k) return;
            acc[k] = (acc[k] || 0) + 1;
          });
          return acc;
        }, {});
        const arr = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .map(([keyword, count]) => ({ keyword, count }));
        setKeywordCounts(arr);
      })
      .catch(() => {});
  }, [token, navigate]);

  const deleteResume = async (id) => {
    setError('');
    try {
      await fetchJSON(`/resume/${id}`, { method: 'DELETE', token });
      setResumes((current) => current.filter((resume) => resume._id !== id));
      setResumeToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const openDeleteModal = (resume) => {
    setResumeToDelete(resume);
  };

  const cancelDelete = () => {
    setResumeToDelete(null);
  };

  return (
    <section className="dashboard-page">
      <div className="hero-card glass-card">
        <div className="hero-copy">
          <p className="eyebrow">AI Resume Studio</p>
          <h1>Create ATS-Friendly AI Resumes</h1>
          <p>Build modern resumes with AI assistance, live preview, industry templates, and instant PDF export.</p>
          <div className="hero-actions">
            <button onClick={() => navigate('/builder')}>Create Resume</button>
            <button className="secondary" onClick={() => navigate('/builder')}>
              View Templates
            </button>
          </div>
        </div>
        <div className="hero-metrics">
          <div className="metric-card">
            <span>Resume Completion</span>
            <strong>85%</strong>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '85%' }} />
            </div>
          </div>
          <div className="metric-card">
            <span>ATS Score</span>
            <strong>92%</strong>
            <ul>
              <li>Formatting good</li>
              <li>Keywords matched</li>
              <li>Skills optimized</li>
            </ul>
          </div>
          <div className="metric-card">
            <span>Analysis activity</span>
            <strong>{analysisStats.activeCount}</strong>
            <p>{analysisStats.archivedCount} archived analyses</p>
            <div className="keyword-chart-list">
              {keywordCounts.length ? (
                <>
                  <KeywordChart data={keywordCounts} width={360} height={160} onKeywordClick={(kw) => navigate(`/analysis-history?keyword=${encodeURIComponent(kw)}`)} />
                  <div className="keyword-legend">
                    <ul>
                      {keywordCounts.map((k) => (
                        <li key={k.keyword} onClick={() => navigate(`/analysis-history?keyword=${encodeURIComponent(k.keyword)}`)} style={{ cursor: 'pointer' }}>
                          <span className="kw">{k.keyword}</span>
                          <span className="count">{k.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <span className="keyword-chip muted">No top keywords yet</span>
              )}
            </div>
            <ul>
              {analysisStats.latest.map((item) => (
                <li key={item._id}>{item.resume?.title || 'Resume'} - {new Date(item.createdAt).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="dashboard-header">
        <div>
          <h1>Your resume collection</h1>
          <p>Create and customize resumes with AI suggestions.</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={() => navigate('/builder')}>Create New Resume</button>
          <button className="secondary" onClick={() => navigate('/analyzer')}>
            Job Analyzer
          </button>
          <button className="secondary" onClick={() => navigate('/analysis-history')}>
            Analysis History
          </button>
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      <div className="resume-grid">
        {resumes.length ? (
          resumes.map((resume) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              onEdit={() => navigate(`/builder/${resume._id}`)}
              onDelete={() => openDeleteModal(resume)}
            />
          ))
        ) : (
          <div className="empty-state">No resumes found yet. Start with a new resume.</div>
        )}
      </div>
      {resumeToDelete && (
        <ConfirmModal
          title={resumeToDelete.title}
          onCancel={cancelDelete}
          onConfirm={() => deleteResume(resumeToDelete._id)}
        />
      )}
    </section>
  );
}
