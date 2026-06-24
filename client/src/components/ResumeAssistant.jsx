import { useMemo, useState } from 'react';
import { HiOutlineSparkles, HiOutlineX } from 'react-icons/hi';
import { fetchJSON } from '../api.js';

const quickPrompts = [
  'Improve my resume summary',
  'Suggest ATS keywords',
  'Write project bullets',
  'Prepare interview questions',
];

const createFallbackReply = (message) => {
  const text = String(message || '').toLowerCase();

  if (text.includes('summary') || text.includes('objective') || text.includes('profile')) {
    return 'Try this: "Motivated software developer with hands-on internship experience building Java backend services, responsive React interfaces, REST APIs, and MongoDB-backed applications. Strong focus on clean delivery, measurable outcomes, and user-friendly product experiences."';
  }

  if (text.includes('keyword') || text.includes('ats') || text.includes('match')) {
    return 'Add role-specific ATS keywords such as Java, Spring Boot, React, REST API, MongoDB, JavaScript, Git, authentication, dashboard, deployment, performance, and internships. Place them naturally in summary, skills, and experience sections.';
  }

  if (text.includes('project') || text.includes('bullet') || text.includes('experience')) {
    return 'Use project bullets like: "Built a MERN resume platform with JWT authentication, PDF export, ATS scoring, and analysis history." Add numbers where possible, such as users served, load time improved, or features delivered.';
  }

  if (text.includes('cover') || text.includes('letter')) {
    return 'For a cover letter, say why you fit the role, mention your top achievements, and end with a call to action. Keep it concise and tailored to the job description.';
  }

  if (text.includes('interview') || text.includes('questions')) {
    return 'Practice these: 1. Explain your best Java internship project. 2. How do you secure APIs? 3. How do you optimize React performance? 4. How do you debug production issues? 5. What would you improve in this resume app?';
  }

  if (text.includes('how') || text.includes('what') || text.includes('why') || text.includes('should')) {
    return 'I can help refine your resume or job application. Tell me your target role, paste the job description, or ask for a specific section to improve.';
  }

  return 'I can help with summaries, ATS keywords, project bullets, cover letters, interview prep, and resume formatting. Ask me for a specific role, job description, or resume section and I will suggest stronger wording.';
};

const formatTimestamp = (value = new Date()) => new Date(value).toLocaleString([], {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const initialMessages = [
  {
    role: 'assistant',
    content: 'Hi, I am your resume assistant. Ask me to improve content, find ATS keywords, write bullets, or prepare for interviews.',
    timestamp: new Date().toISOString(),
  },
];

export default function ResumeAssistant({ token }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [lastReplyLabel, setLastReplyLabel] = useState('Ready to help with your resume content.');
  const [copyStatus, setCopyStatus] = useState('');

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const copyLastReply = async () => {
    const latestReply = [...messages].reverse().find((item) => item.role === 'assistant');
    if (!latestReply) {
      setCopyStatus('No assistant response to copy.');
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(latestReply.content);
      setCopyStatus('Last response copied to clipboard.');
    } catch (error) {
      setCopyStatus('Could not copy response.');
    }
    setTimeout(() => setCopyStatus(''), 3000);
  };

  const exportConversation = () => {
    const text = messages
      .map((message) => {
        const time = formatTimestamp(message.timestamp);
        return `[${time}] ${message.role.toUpperCase()}:\n${message.content}`;
      })
      .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume-assistant-chat.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sendMessage = async (message = input) => {
    const cleanMessage = message.trim();
    if (!cleanMessage || loading) return;

    const nextMessages = [...messages, { role: 'user', content: cleanMessage, timestamp: new Date().toISOString() }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      let assistantReply = '';

      if (!token) {
        assistantReply = createFallbackReply(cleanMessage);
      } else {
        const data = await fetchJSON('/resume/chat', {
          method: 'POST',
          token,
          body: { message: cleanMessage, history: nextMessages.slice(-8) },
        });
        assistantReply = data.reply || createFallbackReply(cleanMessage);
      }

      setMessages([...nextMessages, { role: 'assistant', content: assistantReply, timestamp: new Date().toISOString() }]);
      setLastReplyLabel(assistantReply.split('\n')[0].slice(0, 80));
    } catch (error) {
      const assistantReply = `${createFallbackReply(cleanMessage)}\n\nNote: live assistant request failed: ${error.message}`;
      setMessages([...nextMessages, { role: 'assistant', content: assistantReply, timestamp: new Date().toISOString() }]);
      setLastReplyLabel(assistantReply.split('\n')[0].slice(0, 80));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`assistant-widget ${open ? 'open' : ''}`}>
      {open && (
        <section className="assistant-panel" aria-label="Resume assistant">
          <header className="assistant-header">
            <div>
              <span className="assistant-kicker"><HiOutlineSparkles /> AI Copilot</span>
              <h3>Resume Assistant</h3>
            </div>
            <div className="assistant-header-actions">
              <button type="button" className="secondary" onClick={copyLastReply}>
                Copy reply
              </button>
              <button type="button" className="secondary" onClick={exportConversation}>
                Export chat
              </button>
              <button type="button" className="secondary" onClick={() => {
                setMessages(initialMessages);
                setLastReplyLabel('Ready to help with your resume content.');
                setInput('');
              }}>
                Clear
              </button>
              <button type="button" className="icon-btn assistant-close" onClick={() => setOpen(false)} aria-label="Close assistant">
                <HiOutlineX />
              </button>
            </div>
          </header>

          <div className="assistant-status-row">
            <span className="assistant-status-label">Last response:</span>
            <span className="assistant-status-value">{lastReplyLabel}</span>
          </div>
          {copyStatus && <div className="assistant-note">{copyStatus}</div>}

          <div className="assistant-quick-actions">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" className="secondary" onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="assistant-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`assistant-message ${message.role}`}>
                <div className="assistant-meta">
                  <span>{message.role === 'assistant' ? 'Assistant' : 'You'}</span>
                  <time>{formatTimestamp(message.timestamp)}</time>
                </div>
                <p>{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="assistant-message assistant">
                <div className="assistant-meta">
                  <span>Assistant</span>
                  <time>{formatTimestamp()}</time>
                </div>
                <p>Thinking...</p>
              </div>
            )}
          </div>

          <form
            className="assistant-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for keywords, bullets, summary..."
            />
            <button type="submit" disabled={!canSend}>
              Send
            </button>
          </form>
        </section>
      )}

      <button type="button" className="assistant-fab" onClick={() => setOpen((current) => !current)} aria-label="Open resume assistant">
        Assist
      </button>
    </div>
  );
}
