import { useState } from 'react';
import { analyzeResume, extractKeywords, optimizeSection, getATSScore } from '../api.js';

export default function AIAnalyzer({ resumeContent, jobDescription = '' }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalyze = async () => {
    if (!resumeContent || resumeContent.trim().length < 50) {
      setError('Resume content too short. Please add more details.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await analyzeResume(resumeContent, jobDescription);
      setAnalysis(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div className="ai-analyzer">
        <div className="analyzer-header">
          <h3>🤖 AI Resume Analyzer</h3>
          <p>Get instant feedback and suggestions to improve your resume</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          className="analyze-btn" 
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    );
  }

  return (
    <div className="ai-analyzer-results">
      <div className="analyzer-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
        >
          Keywords
        </button>
        <button 
          className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions
        </button>
      </div>

      <div className="analyzer-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="ats-score">
              <div className="score-circle">
                <span className="score-value">{analysis.atsScore?.toFixed(1) || 0}%</span>
                <span className="score-label">ATS Score</span>
              </div>
              <div className="score-feedback">
                {analysis.atsScore >= 80 && (
                  <p className="excellent">✨ Excellent! Your resume is ATS-friendly.</p>
                )}
                {analysis.atsScore >= 60 && analysis.atsScore < 80 && (
                  <p className="good">👍 Good! Some improvements possible.</p>
                )}
                {analysis.atsScore >= 40 && analysis.atsScore < 60 && (
                  <p className="fair">⚠️ Fair. Consider improvements below.</p>
                )}
                {analysis.atsScore < 40 && (
                  <p className="poor">📝 Needs improvement. Follow suggestions.</p>
                )}
              </div>
            </div>

            <div className="strength-areas">
              <h4>💪 Strengths</h4>
              <ul>
                {analysis.strengthAreas?.map((area, idx) => (
                  <li key={idx}>✓ {area}</li>
                ))}
              </ul>
            </div>

            <div className="improvement-areas">
              <h4>🎯 Improvement Areas</h4>
              <ul>
                {analysis.improvementAreas?.map((area, idx) => (
                  <li key={idx}>→ {area}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="keywords-tab">
            <div className="keyword-section">
              <h4>📌 Matched Keywords</h4>
              <div className="keyword-list">
                {analysis.keywordMatches?.length > 0 ? (
                  analysis.keywordMatches.map((keyword, idx) => (
                    <span key={idx} className="keyword matched">
                      {keyword}
                    </span>
                  ))
                ) : (
                  <p className="no-keywords">No matched keywords found.</p>
                )}
              </div>
            </div>

            <div className="keyword-section">
              <h4>🔍 Missing Keywords (if job description provided)</h4>
              <div className="keyword-list">
                {analysis.missingKeywords?.length > 0 ? (
                  analysis.missingKeywords.map((keyword, idx) => (
                    <span key={idx} className="keyword missing">
                      {keyword}
                    </span>
                  ))
                ) : (
                  <p className="no-keywords">All keywords covered!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-tab">
            <h4>💡 Suggestions</h4>
            <ol className="suggestions-list">
              {analysis.suggestions?.map((suggestion, idx) => (
                <li key={idx}>
                  <span className="suggestion-text">{suggestion}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <button 
        className="reanalyze-btn" 
        onClick={() => setAnalysis(null)}
      >
        Analyze Again
      </button>
    </div>
  );
}
