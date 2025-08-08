import { formatPercent } from '../../utils/locale.js';

export default function PeopleRow({ percent=0, count=10, size=24, label='' }) {
  const p = Math.max(0, Math.min(100, percent));
  const filled = Math.round((p / 100) * count);
  const width = count * 12;

  return (
    <svg
      viewBox={`0 0 ${width} 24`}
      width={width}
      height={size}
      role="img"
      aria-label={`${label}: ${formatPercent(p)}`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const idx = count - 1 - i;
        const color = i < filled ? '#334155' : '#d1d5db';
        return (
          <g key={i} transform={`translate(${idx * 12} 0)`} fill={color}>
            <circle cx="6" cy="4" r="4" />
            <rect x="4" y="8" width="4" height="8" rx="2" />
            <rect x="2" y="16" width="8" height="8" rx="2" />
          </g>
        );
      })}
    </svg>
  );
}

