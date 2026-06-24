export default function ResumeCard({ resume, onEdit, onDelete }) {
  return (
    <article className="resume-card" onClick={onEdit}>
      <div className="card-meta">
        <div>
          <h3>{resume.title}</h3>
          {resume.industry && <small className="industry-tag">{resume.industry}</small>}
        </div>
        <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="card-body">
        <p>{resume.sections.summary?.slice(0, 120) || 'No summary yet.'}</p>
      </div>
      <div className="card-actions">
        <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(); }}>
          Edit resume
        </button>
        <button
          type="button"
          className="secondary"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
