import { useState } from 'react';
import { HiOutlineMail, HiOutlineLink } from 'react-icons/hi';

export default function ResumeShare({ resumeId, resumeTitle, targetRole, summary }) {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const shareLink = `${window.location.origin}/builder/${resumeId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateEmailTemplate = () => {
    const emailSubject = `Check out my resume - ${targetRole || resumeTitle}`;
    const emailBody = `Hi,

I'd like to share my resume with you. You can view it here: ${shareLink}

${summary ? `\nSummary:\n${summary}` : ''}

Best regards`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
  };

  if (!resumeId) {
    return null;
  }

  return (
    <div className="resume-share-panel">
      <button
        className="secondary share-toggle"
        onClick={() => setShowShare(!showShare)}
        type="button"
      >
        Share Resume
      </button>

      {showShare && (
        <div className="share-container">
          <div className="share-option">
            <button
              className="share-action"
              onClick={copyToClipboard}
              type="button"
            >
              <HiOutlineLink /> {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <input type="text" value={shareLink} readOnly className="share-link-input" />
          </div>

          <div className="share-option">
            <button
              className="secondary share-action"
              onClick={generateEmailTemplate}
              type="button"
            >
              <HiOutlineMail /> Share via Email
            </button>
          </div>

          <p className="share-hint">
            Share your resume link with recruiters and peers. They can view your latest updates anytime.
          </p>
        </div>
      )}
    </div>
  );
}
