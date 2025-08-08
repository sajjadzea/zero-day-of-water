import Droplet from './icons/Droplet.jsx';
import { faNum, faDateJalali } from '../utils/locale.js';
import { useScenarios } from '../hooks/useScenarios';

interface Props {
  id: string;
  name: string;
  percent: number;
  volumeNowMm3: number;
  deadStorageMm3: number;
  lessThan?: boolean;
  note?: string;
  updatedAt?: string;
  yoyVolumeMm3?: number;
}

export default function ReservoirCard({
  name,
  percent,
  volumeNowMm3,
  deadStorageMm3,
  lessThan = false,
  note = '',
  updatedAt,
  yoyVolumeMm3,
}: Props) {
  const usable = Math.max(volumeNowMm3 - deadStorageMm3, 0);

  let formattedDate = '';
  if (updatedAt) {
    const d = new Date(updatedAt);
    if (!isNaN(d.getTime())) {
      formattedDate = faDateJalali(d);
    }
  }

  const { scenarios, scenarioKey, setScenarioKey, calcDays } = useScenarios();
  const { days, lower, upper, uncertainty } = calcDays(usable);

  const delta = yoyVolumeMm3 !== undefined ? volumeNowMm3 - yoyVolumeMm3 : null;

  return (
    <div className="dam-card card">
      <h3 className="dam-title">{name}</h3>
      <div className="scenario-tabs">
        {Object.entries(scenarios).map(([key, s]) => (
          <button
            key={key}
            className={key === scenarioKey ? 'active' : ''}
            onClick={() => setScenarioKey(key as any)}
          >
            {s.labelFa}
          </button>
        ))}
      </div>
      <div className="dam-body">
        <Droplet percent={percent} label={`درصد پرشدگی ${name}`} />
        <div>
          <p className="dam-percent">{faNum(percent)}٪</p>
          <p className="dam-volume">
            حجم مفید: {lessThan && 'کمتر از '} {faNum(usable)} میلیون مترمکعب
          </p>
          <p className="dam-volume">
            روزهای باقی‌مانده: {faNum(days)} روز
          </p>
          <p className="dam-uncertainty">
            ±{faNum(uncertainty)} روز ({faNum(lower)}–{faNum(upper)})
          </p>
          {note && <span className="dam-badge">{note}</span>}
          {yoyVolumeMm3 !== undefined && (
            <div className="yoy">
              <span className="dam-badge">سال قبل: {faNum(yoyVolumeMm3)}</span>
              {delta !== null && (
                <span
                  className={`dam-badge delta ${delta >= 0 ? 'up' : 'down'}`}
                >
                  Δ: {delta > 0 ? '+' : ''}{faNum(delta)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {formattedDate && (
        <div className="dam-footer">آخرین به‌روزرسانی: {formattedDate}</div>
      )}
    </div>
  );
}
