import { cloneElement } from 'react';
import { formatPercent } from '../utils/locale.js';

export default function KpiCard({ title, value, trend=null, subtitle=null, icon=null }) {
  const isDown = typeof trend === 'number' && trend < 0;
  const t = isDown ? 'down' : 'up';
  const arrow = isDown ? '▼' : '▲';
  const label = title;
  const aLabel = `${title}: ${formatPercent(value)}`;

  return (
    <div className="card">
      <h3 className="kpi-title">{title}</h3>
      <div className="kpi-wrap">
        {icon ? cloneElement(icon, { percent: value, label: icon.props.label || label }) : (
          <div className="donut" style={{ '--p': value }} role="img" aria-label={aLabel} />
        )}
        <div>
          <p className="kpi-value">{formatPercent(value)}</p>
          {subtitle && <div className="kpi-sub">{subtitle}</div>}
          {trend !== null && (
            <div className={`trend ${t}`} style={{marginTop:'.6rem'}}>
              <span>{arrow}</span>
              <span>{formatPercent(Math.abs(trend))}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
