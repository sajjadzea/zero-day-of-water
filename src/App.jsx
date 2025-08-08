import './styles/global.css';
import { formatDateJalali } from './utils/locale.js';
import KpiCard from './components/KpiCard.jsx';
import ProjectList from './components/ProjectList.jsx';
import { kpis, projects } from './data/sample.js';

export default function App(){
  const today = formatDateJalali(new Date());
  return (
    <div className="container">
      <div className="grid3">
        <KpiCard title="شهر" value={kpis.city.value} trend={kpis.city.trend} subtitle={kpis.city.subtitle} />
        <KpiCard title="سدها" value={kpis.dams.value} trend={kpis.dams.trend} subtitle={kpis.dams.subtitle} />
        <KpiCard title="شهروندان" value={kpis.residents.value} trend={kpis.residents.trend} subtitle={kpis.residents.subtitle} />
      </div>

      <div className="hero card">
        <h2>با هم می‌توانیم از «روز صفر» جلوگیری کنیم</h2>
        <small>به‌روزرسانی: {today}</small>
      </div>

      <ProjectList title="پروژه‌های دیگر شهر" items={projects} />
    </div>
  );
}
