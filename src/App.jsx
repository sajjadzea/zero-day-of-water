import './styles/global.css';
import { formatDateJalali } from './utils/locale.js';
import KpiCard from './components/KpiCard.jsx';
import ProjectList from './components/ProjectList.jsx';
import Droplet from './components/icons/Droplet.jsx';
import PeopleRow from './components/icons/PeopleRow.jsx';
import { kpis, projects } from './data/sample.js';

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
        <KpiCard
          title="شهروندان"
          value={kpis.residents.value}
          trend={kpis.residents.trend}
          subtitle={kpis.residents.subtitle}
          icon={<PeopleRow label="درصد شهروندان کم‌مصرف" />}
        />
      </div>

      <div className="hero card">
        <h2>با هم می‌توانیم از «روز صفر» جلوگیری کنیم</h2>
        <small>به‌روزرسانی: {today}</small>
      </div>

      <ProjectList title="پروژه‌های دیگر شهر" items={projects} />
    </div>
  );
}
