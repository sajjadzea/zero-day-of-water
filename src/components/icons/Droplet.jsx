import { useId } from 'react';
import { formatPercent } from '../../utils/locale.js';

export default function Droplet({ percent=0, size=64, label='' }) {
  const id = useId();
  const p = Math.max(0, Math.min(100, percent));
  const h = 160; // height of viewBox
  const viewW = 120;
  const fillY = h - (h * p) / 100;
  const maskId = `dropMask-${id}`;
  const outerPath = 'M60 5C42 35 20 80 20 110a40 40 0 0 0 80 0c0-30-22-75-40-105Z';

  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={(size * 160) / 120}
      role="img"
      aria-label={`${label}: ${formatPercent(p)}`}
    >
      <defs>
        <mask id={maskId}>
          <path d={outerPath} fill="#fff" />
          <rect x="0" y="0" width={viewW} height={fillY} fill="#000">
            <animate attributeName="height" from={h} to={fillY} dur="0.8s" fill="freeze" />
          </rect>
        </mask>
      </defs>
      <path d={outerPath} fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="4" />
      <rect x="0" y="0" width={viewW} height={h} fill="#0ea5e9" mask={`url(#${maskId})`} />
      <path d={outerPath} fill="none" stroke="#0ea5e9" strokeWidth="4" />
      <path d={outerPath} fill="#fff" transform="translate(26 30) scale(0.55)" />
    </svg>
  );
}

