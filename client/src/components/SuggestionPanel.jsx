export default function SuggestionPanel({ suggestions }) {
  return (
    <aside className="suggestion-panel">
      <h3>AI Suggestions</h3>
      {suggestions?.length ? (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      ) : (
        <p>Click "AI Suggestions" to improve your resume copy.</p>
      )}
    </aside>
  );
}
