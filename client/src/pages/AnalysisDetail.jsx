import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { fetchJSON } from '../api.js';

export default function AnalysisDetail({ token }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token || !id) return;
    fetchJSON(`/resume/analysis/${id}`, { token })
      .then((d) => setItem(d))
      .catch((e) => setError(e.message || 'Failed to load'));
  }, [token, id]);

  const reopen = () => {
    if (!item) return;
    sessionStorage.setItem('analysisToOpen', JSON.stringify({ jobDescription: item.jobDescription, sections: item.sections }));
    navigate('/analyzer');
  };

  const highlight = () => {
    const kw = (item.result?.missingSkills || item.result?.analysis?.missingSkills || []).slice(0, 8).join(',');
    if (item.resume && item.resume._id) {
      navigate(`/builder/${item.resume._id}?highlight=${encodeURIComponent(kw)}`);
    } else {
      navigate(`/builder?highlight=${encodeURIComponent(kw)}`);
    }
  };

  const openConfirm = (action) => {
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const runConfirm = async () => {
    if (!item) return;
    try {
      if (confirmAction === 'archive') {
        await fetchJSON(`/resume/analysis/${id}`, { token, method: 'DELETE' });
        setMessage('Analysis archived. You can restore it from archived view.');
      } else {
        await fetchJSON(`/resume/analysis/${id}/restore`, { token, method: 'PATCH' });
        setMessage('Analysis restored successfully.');
      }
      setError('');
      setConfirmOpen(false);
      setConfirmAction('');
      const refreshed = await fetchJSON(`/resume/analysis/${id}`, { token });
      setItem(refreshed);
    } catch (e) {
      setError(e.message || 'Action failed');
      setConfirmOpen(false);
      setConfirmAction('');
    }
  };

  if (!item) return <section className="page"><p>Loading...</p>{error && <div className="error-message">{error}</div>}</section>;

  return (
    <section className="page analysis-detail">
      <div className="detail-header">
        <h2>Analysis details</h2>
        {item.deleted && <span className="status-badge archived">Archived</span>}
      </div>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <div className="detail-meta">
        <strong>{item.resume?.title || 'Untitled resume'}</strong>
        <span>{new Date(item.createdAt).toLocaleString()}</span>
      </div>
      <div className="detail-body">
        <h4>Job description</h4>
        <pre>{item.jobDescription || '-'}</pre>
        <h4>Missing keywords</h4>
        <p>{(item.result?.missingSkills || item.result?.analysis?.missingSkills || []).join(', ') || 'None'}</p>
        <h4>Suggestions</h4>
        <ul>
          {(item.result?.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
      <div className="detail-actions">
        <button onClick={reopen}>Open in Analyzer</button>
        <button className="secondary" onClick={highlight}>Highlight in Builder</button>
        <button className={item.deleted ? 'secondary' : 'danger'} onClick={() => openConfirm(item.deleted ? 'restore' : 'archive')}>
          {item.deleted ? 'Restore' : 'Archive'}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmAction === 'archive' ? 'Archive analysis' : 'Restore analysis'}
        description={
          confirmAction === 'archive'
            ? 'Archive this analysis and move it to the archived history list?'
            : 'Restore this archived analysis to the active history view?'
        }
        confirmLabel={confirmAction === 'archive' ? 'Archive' : 'Restore'}
        cancelLabel="Cancel"
        onConfirm={runConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
