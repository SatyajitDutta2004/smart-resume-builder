import React from 'react';

export default function KeywordChart({ data = [], width = 360, height = 160, onKeywordClick }) {
  // data: [{ keyword, count }]
  if (!data || !data.length) {
    return <div className="keyword-chart empty">No keyword data</div>;
  }

  const max = Math.max(...data.map((d) => d.count));
  const padding = 8;
  const barHeight = (height - 20) / data.length - padding;

  return (
    <svg width={width} height={height} className="keyword-chart" role="img" aria-label="Top keywords">
      {data.map((d, i) => {
        const y = i * (barHeight + padding) + 10;
        const barWidth = Math.round((d.count / Math.max(max, 1)) * (width - 140));
        return (
          <g key={d.keyword}>
            <text x={8} y={y + barHeight / 1.2} className="kw-label" onClick={() => onKeywordClick?.(d.keyword)} style={{ cursor: onKeywordClick ? 'pointer' : 'default' }}>{d.keyword}</text>
            <rect x={120} y={y} width={barWidth} height={barHeight} rx={4} fill="#6c5ce7" onClick={() => onKeywordClick?.(d.keyword)} style={{ cursor: onKeywordClick ? 'pointer' : 'default' }} />
            <text x={120 + barWidth + 8} y={y + barHeight / 1.2} className="kw-count" onClick={() => onKeywordClick?.(d.keyword)} style={{ cursor: onKeywordClick ? 'pointer' : 'default' }}>{d.count}</text>
          </g>
        );
      })}
    </svg>
  );
}
