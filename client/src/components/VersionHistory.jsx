import { useState, useEffect } from 'react';
import { fetchJSON } from '../api.js';

export default function VersionHistory({ resumeId, token, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (showVersions && resumeId) {
      loadVersions();
    }
  }, [showVersions, resumeId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await fetchJSON(`/resume/${resumeId}/versions`, { token });
      setVersions(data);
    } catch (err) {
      setError(err.message || 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId) => {
    if (!window.confirm('Restore this version? Current changes will be saved as a backup.')) {
      return;
    }

    try {
      const data = await fetchJSON(`/resume/${resumeId}/restore-version/${versionId}`, {
        token,
        method: 'POST',
      });
      setError('');
      if (onRestore) {
        onRestore(data.resume);
      }
      loadVersions();
    } catch (err) {
      setError(err.message || 'Failed to restore version');
    }
  };

  if (!resumeId) {
    return null;
  }

  return (
    <div className="version-history-panel">
      <button
        className="secondary"
        onClick={() => setShowVersions(!showVersions)}
        type="button"
      >
        Version History
      </button>

      {showVersions && (
        <div className="version-history-container">
          {loading && <p>Loading versions...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && versions.length === 0 && (
            <p className="hint">No previous versions saved yet.</p>
          )}

          {!loading && versions.length > 0 && (
            <div className="version-list">
              {versions.map((version) => (
                <div key={version._id} className="version-item">
                  <div className="version-info">
                    <strong>
                      {version.versionName || `Version ${version.versionNumber}`}
                    </strong>
                    <p className="version-date">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="secondary small"
                    onClick={() => handleRestore(version._id)}
                    type="button"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
