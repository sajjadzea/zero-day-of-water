import { formatPercent } from '../utils/locale.js';

export default function KpiCard({ title, value, trend=null, subtitle=null }) {
  const isDown = typeof trend === 'number' && trend < 0;
  const t = isDown ? 'down' : 'up';
  const arrow = isDown ? '▼' : '▲';

  return (
    <div className="card">
      <h3 className="kpi-title">{title}</h3>
      <div className="kpi-wrap">
        <div className="donut" style={{ '--p': value }} />
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
