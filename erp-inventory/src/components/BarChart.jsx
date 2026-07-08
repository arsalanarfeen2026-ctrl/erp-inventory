import React from 'react';

export default function BarChart({ title, rows, color = '#2a78d6' }) {
  const max = Math.max(...rows.map(r => r.value), 1);
  return (
    <div className="chart-wrap">
      <div className="chart-title">{title}</div>
      <div className="bar-chart">
        {rows.map((r, i) => (
          <div className="bar-row" key={i}>
            <div className="bar-label" title={r.label}>{r.label}</div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.round((r.value / max) * 100)}%`, background: color }}
              />
            </div>
            <div className="bar-val">{r.value} {r.unit || ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
