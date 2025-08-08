import './styles/global.css';
import { formatDateJalali } from './utils/locale.js';
import KpiCard from './components/KpiCard.jsx';
import ProjectList from './components/ProjectList.jsx';
import Droplet from './components/icons/Droplet.jsx';
import DamCard from './components/DamCard.jsx';
import { kpis, projects } from './data/sample.js';
import { dams } from './data/dams.js';

export default function App(){
  const today = formatDateJalali(new Date());
  return (
    <div className="container">
      <div className="grid3">
        <KpiCard title="شهر" value={kpis.city.value} trend={kpis.city.trend} subtitle={kpis.city.subtitle} />
        <KpiCard
          title="سدها"
          value={kpis.dams.value}
          trend={kpis.dams.trend}
          subtitle={kpis.dams.subtitle}
          icon={<Droplet label="درصد پرشدگی سدها" />}
        />
      </div>

      <div className="hero card">
        <h2>با هم می‌توانیم از «روز صفر» جلوگیری کنیم</h2>
        <small>به‌روزرسانی: {today}</small>
      </div>

      <section className="dams">
        <h2>پایش سدها</h2>
        <div className="dams-grid">
          {dams.map((d) => (
            <DamCard key={d.id} {...d} />
          ))}
        </div>
      </section>

      <ProjectList title="پروژه‌های دیگر شهر" items={projects} />
    </div>
  );
}
