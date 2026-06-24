import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Builder = lazy(() => import('./pages/Builder.jsx'));
const Analyzer = lazy(() => import('./pages/Analyzer.jsx'));
const AnalysisHistory = lazy(() => import('./pages/AnalysisHistory.jsx'));
const AnalysisDetail = lazy(() => import('./pages/AnalysisDetail.jsx'));
const ResumeAssistant = lazy(() => import('./components/ResumeAssistant.jsx'));

const getToken = () => localStorage.getItem('ai_resume_token');

function App() {
  const [user, setUser] = useState(null);
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem('ai_resume_theme') || 'light',
  );
  const navigate = useNavigate();

  useEffect(() => {
    const store = localStorage.getItem('ai_resume_user');
    if (store) {
      setUser(JSON.parse(store));
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    localStorage.setItem('ai_resume_theme', themeMode);
  }, [themeMode]);

  const onAuth = (token, userData) => {
    localStorage.setItem('ai_resume_token', token);
    localStorage.setItem('ai_resume_user', JSON.stringify(userData));
    setUser(userData);
    navigate('/dashboard');
  };

  const toggleTheme = () => {
    setThemeMode((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const logout = () => {
    localStorage.removeItem('ai_resume_token');
    localStorage.removeItem('ai_resume_user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className={`app-shell ${themeMode}`}>
      <header className="app-header">
        <div className="brand-row">
          <div className="brand">
            <span className="brand-mark">ResumeAI</span>
            <span className="brand-subtitle">ATS Friendly</span>
          </div>
          {user && (
            <nav className="main-nav">
              <button type="button" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              <button type="button" onClick={() => navigate('/builder')}>
                Templates
              </button>
              <button type="button" onClick={() => navigate('/analyzer')}>
                Analyzer
              </button>
              <button type="button" onClick={() => navigate('/analysis-history')}>
                History
              </button>
            </nav>
          )}
        </div>
        <div className="header-actions">
          {user ? (
            <>
              <button type="button" className="icon-btn" onClick={toggleTheme}>
                {themeMode === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
              </button>
              <button type="button" className="secondary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => navigate('/login')}>
                Login
              </button>
              <button type="button" className="secondary" onClick={() => navigate('/signup')}>
                Sign up
              </button>
            </>
          )}
        </div>
      </header>
      <main>
        <Suspense fallback={<div className="page-loader">Loading…</div>}>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login onAuth={onAuth} />} />
            <Route path="/signup" element={<Signup onAuth={onAuth} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard token={getToken()} logout={logout} />} />
            <Route path="/builder" element={<Builder token={getToken()} />} />
            <Route path="/builder/:id" element={<Builder token={getToken()} />} />
            <Route path="/analyzer" element={<Analyzer token={getToken()} />} />
            <Route path="/analysis-history" element={<AnalysisHistory token={getToken()} />} />
            <Route path="/analysis/:id" element={<AnalysisDetail token={getToken()} />} />
          </Routes>
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <ResumeAssistant token={getToken()} />
      </Suspense>
    </div>
  );
}

export default App;
