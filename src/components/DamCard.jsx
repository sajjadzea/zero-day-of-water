import Droplet from './icons/Droplet.jsx';
import { faNum, faDateJalali } from '../utils/locale.js';

export default function DamCard({ name, percent, volumeMCM, lessThan=false, note='', updatedAt }) {
  return (
    <div className="dam-card card">
      <h3 className="dam-title">{name}</h3>
      <div className="dam-body">
        <Droplet percent={percent} label={`درصد پرشدگی ${name}`} />
        <div>
          <p className="dam-percent">{faNum(percent)}٪</p>
          <p className="dam-volume">
            حجم: {lessThan && 'کمتر از '}{faNum(volumeMCM)} میلیون مترمکعب
          </p>
          {note && <span className="dam-badge">{note}</span>}
        </div>
      </div>
      <div className="dam-footer">آخرین به‌روزرسانی: {faDateJalali(updatedAt)}</div>
    </div>
  );
}

