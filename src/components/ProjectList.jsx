import { formatPercent } from '../utils/locale.js';

function Row({ name, pct, state='ok' }) {
  return (
    <div className="project-row">
      <div className="project-name">{name}</div>
      <div className="bar"><i style={{ width: `${pct}%` }} /></div>
      <div className={`state ${state}`}>{formatPercent(pct)}</div>
    </div>
  );
}

export default function ProjectList({ title='پروژه‌های دیگر شهر', items=[] }) {
  return (
    <div className="card projects">
      <h3 className="kpi-title">{title}</h3>
      {items.map((it, i) => (<Row key={i} {...it} />))}
      <div className="legend">
        <span className="ok"><i></i> جلوتر از برنامه</span>
        <span className="warn"><i></i> طبق برنامه</span>
        <span className="bad"><i></i> عقب از برنامه</span>
      </div>
    </div>
  );
}
