import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { fetchJSON } from '../api.js';

export default function AnalysisHistory({ token }) {
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [filterKeyword, setFilterKeyword] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const loadList = () => {
    if (!token) return;
    const path = `/resume/analysis${showArchived ? '?archived=true' : ''}`;
    fetchJSON(path, { token })
      .then((data) => {
        let items = data || [];
        if (filterKeyword) {
          const k = String(filterKeyword || '').trim().toLowerCase();
          items = items.filter((it) => {
            const missingSkills = it.result?.missingSkills || it.result?.analysis?.missingSkills || [];
            return missingSkills.some((m) => String(m || '').toLowerCase() === k);
          });
        }
        setList(items);
        setError('');
      })
      .catch((e) => setError(e.message || 'Failed to load'));
  };

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const kw = q.get('keyword') || '';
    setFilterKeyword(kw);
    loadList();
  }, [token, showArchived, location.search]);

  const openInAnalyzer = (item) => {
    sessionStorage.setItem('analysisToOpen', JSON.stringify({ jobDescription: item.jobDescription, sections: item.sections }));
    navigate('/analyzer');
  };

  const highlightInBuilder = (item) => {
    const keywords = (item.result?.missingSkills || item.result?.analysis?.missingSkills || []).slice(0, 8).join(',');
    if (item.resume && item.resume._id) {
      navigate(`/builder/${item.resume._id}?highlight=${encodeURIComponent(keywords)}`);
    } else {
      navigate(`/builder?highlight=${encodeURIComponent(keywords)}`);
    }
  };

  const confirmArchive = (item) => {
    setConfirmState({ action: 'archive', item });
  };

  const confirmRestore = (item) => {
    setConfirmState({ action: 'restore', item });
  };

  const runConfirmAction = async () => {
    if (!confirmState) return;
    const { action, item } = confirmState;
    const id = item._id;
    try {
      if (action === 'archive') {
        await fetchJSON(`/resume/analysis/${id}`, { token, method: 'DELETE' });
        setMessage('Analysis archived. You can restore it from Archived view.');
      } else if (action === 'restore') {
        await fetchJSON(`/resume/analysis/${id}/restore`, { token, method: 'PATCH' });
        setMessage('Analysis restored successfully.');
      }
      setError('');
      setConfirmState(null);
      loadList();
    } catch (e) {
      setError(e.message || 'Action failed');
      setConfirmState(null);
    }
  };

  return (
    <section className="page analysis-history">
      <div className="history-header">
        <div>
          <h2>Analysis History</h2>
          <p>{showArchived ? 'Browse archived analyses and restore them if needed.' : 'Review your saved ATS and job-match analyses.'}</p>
        </div>
        <div className="history-header-actions">
          <button className="secondary" type="button" onClick={() => setShowArchived((prev) => !prev)}>
            {showArchived ? 'View active history' : 'View archived'}
          </button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <div className="history-list">
        {list.length === 0 && <p>{showArchived ? 'No archived analyses yet.' : 'No analyses saved yet.'}</p>}
        {list.map((item) => (
          <div key={item._id} className={`history-card ${item.deleted ? 'archived-card' : ''}`}>
            <div className="history-meta">
              <strong>{item.resume?.title || 'Untitled resume'}</strong>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <div className="history-badge-row">
              {item.deleted && <span className="status-badge archived">Archived</span>}
            </div>
            <div className="history-body">
              <p><strong>Job:</strong> {item.jobDescription || '-'}</p>
              <p><strong>Missing:</strong> {(item.result?.missingSkills || item.result?.analysis?.missingSkills || []).slice(0, 6).join(', ') || 'None'}</p>
            </div>
            <div className="history-actions">
              <button onClick={() => navigate(`/analysis/${item._id}`)}>View details</button>
              {!item.deleted && <button className="secondary" onClick={() => openInAnalyzer(item)}>Open in Analyzer</button>}
              <button className="secondary" onClick={() => highlightInBuilder(item)}>Highlight in Builder</button>
              {item.deleted ? (
                <button className="secondary" onClick={() => confirmRestore(item)}>Restore</button>
              ) : (
                <button className="danger" onClick={() => confirmArchive(item)}>Archive</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.action === 'archive' ? 'Archive analysis' : 'Restore analysis'}
        description={
          confirmState?.action === 'archive'
            ? 'Are you sure you want to archive this analysis? It will be removed from active history but can be restored later.'
            : 'Restore this archived analysis to active history?'
        }
        confirmLabel={confirmState?.action === 'archive' ? 'Archive' : 'Restore'}
        cancelLabel="Cancel"
        onConfirm={runConfirmAction}
        onCancel={() => setConfirmState(null)}
      />
    </section>
  );
}
