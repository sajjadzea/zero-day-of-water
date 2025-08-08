import React, { useMemo, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ReferenceLine, Brush, AreaChart, Area
} from "recharts";

// ------------------------------ Utils ------------------------------
const toISO = (d) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
const asNumber = (v, def=0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const clamp = (v,min,max) => Math.max(min, Math.min(max, v));
const parseEventDates = (raw) => !raw ? [] : raw.split(",").map(s=>s.trim()).filter(Boolean);
const buildPeakPattern = (ratio, period=20) => {
  const numPeak = Math.round(ratio*period);
  if (numPeak <= 0) return Array(period).fill(0);
  const used = new Set(); const step = period/numPeak; let x=0;
  for (let i=0;i<numPeak;i++){ let idx=Math.round(x)%period; while(used.has(idx)) idx=(idx+1)%period; used.add(idx); x+=step; }
  const pat = Array(period).fill(0); used.forEach(i=> pat[i]=1); return pat;
};
const normalizedWeights = (active, weights) => {
  const sum = active.reduce((a,d)=> a+(weights[d]||0),0);
  if (sum<=0) return Object.fromEntries(active.map(d=>[d,1/active.length]));
  return Object.fromEntries(active.map(d=>[d,(weights[d]||0)/sum]));
};

// ------------------------------ Simulation ------------------------------
function simulate(P){
  const startDate = new Date(P.startDateStr);
  let S_IR  = Math.max(0, P.initialDoostiTotal * P.iranSharePct/100);
  let S_TKM = Math.max(0, P.initialDoostiTotal - S_IR);

  let storage = {
    "دوستی (ایران)": Math.max(0,S_IR),
    "طرق": Math.max(0,P.initialTorogh),
    "کارده": Math.max(0,P.initialKardeh),
    "ارداک": Math.max(0,P.initialArdak),
  };
  const inflows = {
    "دوستی (ایران)": Math.max(0,P.inflowDoosti)*(P.iranSharePct/100),
    "طرق": Math.max(0,P.inflowTorogh),
    "کارده": Math.max(0,P.inflowKardeh),
    "ارداک": Math.max(0,P.inflowArdak),
  };
  const dams = ["دوستی (ایران)","طرق","کارده","ارداک"];
  const peak = buildPeakPattern(P.peakRatio, 20);
  const rows = [];
  let zeroDay = null;
  let zeroDayIdx = null;

  for (let day=0; day<P.maxDays; day++){
    const date = new Date(startDate.getTime()); date.setDate(startDate.getDate()+day);
    const iso = toISO(date);
    const isPeak = peak[day % peak.length] === 1;
    const cToday = P.baseConsumption * (isPeak ? P.peakMultiplier : 1);

    const active = dams.filter(d=> storage[d] > 1e-6);
    const nw = normalizedWeights(active, P.weights);
    const out = { "دوستی (ایران)":0, "طرق":0, "کارده":0, "ارداک":0 };
    active.forEach(d => out[d] = cToday * (nw[d]||0));

    dams.forEach(d => { const take = Math.min(storage[d], out[d]); storage[d] -= take; });

    const tkmTake = Math.min(S_TKM, Math.max(0,P.tkmWithdrawalDoosti||0)); S_TKM -= tkmTake;

    dams.forEach(d => storage[d] += inflows[d] || 0);
    S_TKM += Math.max(0,P.inflowDoosti) * (1 - P.iranSharePct/100);

    const totalAcc = dams.reduce((a,d)=> a+storage[d], 0);
    if (P.systemLosses > 0 && totalAcc > 0) {
      dams.forEach(d => {
        const loss = P.systemLosses * (storage[d]/totalAcc);
        storage[d] = Math.max(0, storage[d] - loss);
      });
    }

    const doostiPhysical = storage["دوستی (ایران)"] + S_TKM;
    const sumAccessible = dams.reduce((a,d)=> a+storage[d], 0);
    const crossed = (sumAccessible <= P.criticalBuffer);

    if (!zeroDay && crossed){
      zeroDayIdx = day;
      zeroDay = toISO(new Date(date.getTime()));
      if (P.zeroDayMode === "eod" && P.shiftEOD){
        const plus = new Date(date.getTime()); plus.setDate(plus.getDate()+1);
        zeroDay = toISO(plus);
      }
    }

    rows.push({
      "تاریخ": iso,
      "روز پیک؟": isPeak?1:0,
      "ذخیره دوستی (ایران)": +storage["دوستی (ایران)"].toFixed(4),
      "ذخیره طرق": +storage["طرق"].toFixed(4),
      "ذخیره کارده": +storage["کارده"].toFixed(4),
      "ذخیره ارداک": +storage["ارداک"].toFixed(4),
      "جمع قابل برداشت (میلیون م³)": +sumAccessible.toFixed(4),
      "دوستی (کل فیزیکی)": +doostiPhysical.toFixed(4),
      "مصرف امروز (میلیون م³)": +cToday.toFixed(4),
      "برداشت ترکمنستان از دوستی (میلیون م³)": +tkmTake.toFixed(4),
    });
  }
  return { rows, zeroDay, zeroDayIdx };
}

// ------------------------------ Self Tests ------------------------------
function runSelfTests(){
  const results = [];
  const expect = (cond, msg) => results.push({ ok: !!cond, msg });

  // Test 1: Share split (100 total, 30% IR => 30)
  {
    const P = { ...defaults, startDateStr:"2025-01-01", initialDoostiTotal:100, iranSharePct:30, baseConsumption:0, maxDays:1, initialTorogh:0, initialKardeh:0, initialArdak:0 };
    const { rows } = simulate(P);
    expect(Math.abs(rows[0]["ذخیره دوستی (ایران)"] - 30) < 1e-6, "Iran share = 30 when total=100, share=30%");
  }
  // Test 2: No consumption => no zero day when buffer < total
  {
    const P = { ...defaults, startDateStr:"2025-01-01", initialDoostiTotal:10, iranSharePct:100, baseConsumption:0, criticalBuffer:1, maxDays:10, initialTorogh:0, initialKardeh:0, initialArdak:0 };
    const { zeroDay } = simulate(P);
    expect(zeroDay === null, "Zero day null when consumption is zero and buffer < total");
  }
  // Test 3: Linear depletion 10 / 2 per day => 5 days to 0 (buffer 0)
  {
    const P = { ...defaults, startDateStr:"2025-01-01", initialDoostiTotal:10, iranSharePct:100, baseConsumption:2, peakRatio:0, criticalBuffer:0, maxDays:20, initialTorogh:0, initialKardeh:0, initialArdak:0, weights:{"دوستی (ایران)":1,"طرق":0,"کارده":0,"ارداک":0} };
    const { zeroDay } = simulate(P);
    const d0 = new Date("2025-01-01");
    const dz = zeroDay ? new Date(zeroDay) : null;
    const days = dz ? Math.round((dz - d0)/(1000*3600*24)) : -1;
    expect(days === 5, "Zero day occurs 5 days after start when total=10 & usage=2/day");
  }
  return results;
}

// ------------------------------ Defaults & State ------------------------------
const defaults = {
  startDateStr: new Date().toISOString().slice(0,10),
  zeroDayMode: "cross", // "cross" | "eod"
  shiftEOD: false,
  initialDoostiTotal: 69, iranSharePct: 50,
  initialTorogh: 3, initialKardeh: 4, initialArdak: 4,
  baseConsumption: 1.2, peakRatio: 0.15, peakMultiplier: 1.25,
  inflowDoosti: 0, inflowTorogh: 0, inflowKardeh: 0, inflowArdak: 0,
  systemLosses: 0, criticalBuffer: 5, maxDays: 180,
  tkmWithdrawalDoosti: 0,
  weights: { "دوستی (ایران)":0.85, "طرق":0.05, "کارده":0.05, "ارداک":0.05 },
  eventDates: "",
  showAccessible: true,
  showDoostiPhys: true
};

// ------------------------------ Components ------------------------------
function App(){
  const [P, setP] = useState(()=> {
    const saved = localStorage.getItem("zdow-react-pro");
    return saved ? JSON.parse(saved) : defaults;
  });
  const [tests, setTests] = useState([]);

  useEffect(()=> {
    localStorage.setItem("zdow-react-pro", JSON.stringify(P));
    // encode state into URL hash for shareable link
    try { location.hash = btoa(encodeURIComponent(JSON.stringify(P))); } catch {}
  }, [P]);

  // decode state from hash on mount (if present)
  useEffect(()=> {
    if (location.hash && location.hash.length > 1) {
      try {
        const parsed = JSON.parse(decodeURIComponent(atob(location.hash.slice(1))));
        setP(parsed);
      } catch {}
    }
    // eslint-disable-next-line
  }, []);

  const sim = useMemo(()=> simulate(P), [P]);
  const data = useMemo(()=> sim.rows.map(r => ({
    date: r["تاریخ"],
    acc: r["جمع قابل برداشت (میلیون م³)"],
    phys: r["دوستی (کل فیزیکی)"],
    d_ir: r["ذخیره دوستی (ایران)"],
    torogh: r["ذخیره طرق"],
    kardeh: r["ذخیره کارده"],
    ardak: r["ذخیره ارداک"],
    peak: r["روز پیک؟"]
  })), [sim]);

  const daysLeft = useMemo(()=> {
    if (!sim.zeroDay) return null;
    const d0 = new Date(P.startDateStr);
    const dz = new Date(sim.zeroDay);
    return Math.max(0, Math.round((dz - d0)/(1000*3600*24)));
  }, [sim.zeroDay, P.startDateStr]);

  const events = useMemo(()=> parseEventDates(P.eventDates), [P.eventDates]);

  const [showAcc, setShowAcc] = useState(true);
  const [showPhys, setShowPhys] = useState(true);

  useEffect(()=>{ setShowAcc(P.showAccessible); setShowPhys(P.showDoostiPhys); }, []);

  const exportCSV = () => {
    const rows = sim.rows;
    if (!rows.length) return;
    const head = Object.keys(rows[0]);
    const csv = [head.join(",")].concat(rows.map(r => head.map(k => r[k]).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "zero_day_projection_react_pro.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = (id, filename) => {
    const el = document.getElementById(id);
    if (!el) return;
    const svg = el.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.onload = function(){
      const canvas = document.createElement("canvas");
      canvas.width = 1600; canvas.height = 600;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob)=> {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = svg64;
  };

  const onNum  = (key) => (e) => setP(p => ({ ...p, [key]: asNumber(e.target.value, 0) }));
  const onText = (key) => (e) => setP(p => ({ ...p, [key]: e.target.value }));
  const onSel  = (key) => (e) => setP(p => ({ ...p, [key]: e.target.value }));

  const runTestsClick = () => setTests(runSelfTests());

  return (
    <div className="container">
      <header className="toolbar">
        <div>
          <h1>داشبورد روز صفر آب مشهد — React Pro</h1>
          <div className="muted" style={{fontSize:12}}>نسخهٔ باندل تک‌فایل برای GitHub Pages (بدون CDN در زمان اجرا)</div>
        </div>
        <div className="flex">
          <button className="btn-secondary" onClick={()=> {
            try { navigator.clipboard.writeText(location.href); alert("لینک وضعیت فعلی کپی شد"); } catch {}
          }}>کپی لینک قابل‌اشتراک</button>
          <button className="btn" onClick={()=> { exportPNG("chart-top","trend.png"); exportPNG("chart-bottom","stacked.png"); }}>
            دانلود PNG نمودارها
          </button>
        </div>
      </header>

      <div className="grid grid-3">
        {/* Inputs */}
        <aside className="card">
          <h2 className="section-title">ورودی‌ها</h2>
          <div className="row row-2">
            <div>
              <label>تاریخ شروع</label>
              <input type="date" value={P.startDateStr} onChange={onText("startDateStr")} />
            </div>
            <div>
              <label>حالت گزارش «روز صفر»</label>
              <select value={P.zeroDayMode} onChange={onSel("zeroDayMode")}>
                <option value="cross">به‌محض عبور از آستانه</option>
                <option value="eod">انتهای همان روز</option>
              </select>
            </div>
          </div>

          <div className="row row-2">
            <div>
              <label>موجودی اولیه دوستی (کل، میلیون م³)</label>
              <input type="number" step="0.1" value={P.initialDoostiTotal} onChange={onNum("initialDoostiTotal")} />
            </div>
            <div>
              <label>سهم ایران از دوستی (%)</label>
              <input type="number" step="1" value={P.iranSharePct} onChange={onNum("iranSharePct")} />
            </div>
          </div>

          <div className="row row-3">
            <div>
              <label>طرق (میلیون م³)</label>
              <input type="number" step="0.1" value={P.initialTorogh} onChange={onNum("initialTorogh")} />
            </div>
            <div>
              <label>کارده (میلیون م³)</label>
              <input type="number" step="0.1" value={P.initialKardeh} onChange={onNum("initialKardeh")} />
            </div>
            <div>
              <label>ارداک (میلیون م³)</label>
              <input type="number" step="0.1" value={P.initialArdak} onChange={onNum("initialArdak")} />
            </div>
          </div>

          <div className="row row-2">
            <div>
              <label>مصرف پایه (میلیون م³/روز)</label>
              <input type="number" step="0.01" value={P.baseConsumption} onChange={onNum("baseConsumption")} />
            </div>
            <div>
              <label>ضریب پیک</label>
              <input type="number" step="0.01" value={P.peakMultiplier} onChange={onNum("peakMultiplier")} />
            </div>
          </div>

          <div className="row row-2">
            <div>
              <label>نسبت روزهای پیک</label>
              <input type="number" step="0.01" value={P.peakRatio} onChange={onNum("peakRatio")} />
            </div>
            <div>
              <label>آستانه بحرانی (میلیون م³)</label>
              <input type="number" step="0.1" value={P.criticalBuffer} onChange={onNum("criticalBuffer")} />
            </div>
          </div>

          <div className="row row-4">
            <div>
              <label>ورودی دوستی</label>
              <input type="number" step="0.01" value={P.inflowDoosti} onChange={onNum("inflowDoosti")} />
            </div>
            <div>
              <label>ورودی طرق</label>
              <input type="number" step="0.01" value={P.inflowTorogh} onChange={onNum("inflowTorogh")} />
            </div>
            <div>
              <label>ورودی کارده</label>
              <input type="number" step="0.01" value={P.inflowKardeh} onChange={onNum("inflowKardeh")} />
            </div>
            <div>
              <label>ورودی ارداک</label>
              <input type="number" step="0.01" value={P.inflowArdak} onChange={onNum("inflowArdak")} />
            </div>
          </div>

          <div className="row row-2">
            <div>
              <label>تلفات سیستم (میلیون م³/روز)</label>
              <input type="number" step="0.01" value={P.systemLosses} onChange={onNum("systemLosses")} />
            </div>
            <div>
              <label>افق شبیه‌سازی (روز)</label>
              <input type="number" step="1" value={P.maxDays} onChange={onNum("maxDays")} />
            </div>
          </div>

          <div>
            <label>برداشت طرف ترکمنستان از دوستی (میلیون م³/روز) — اختیاری</label>
            <input type="number" step="0.01" value={P.tkmWithdrawalDoosti} onChange={onNum("tkmWithdrawalDoosti")} />
          </div>

          <div className="row row-4">
            <div>
              <label>وزن: دوستی (ایران)</label>
              <input type="number" step="0.01" value={P.weights["دوستی (ایران)"]} onChange={(e)=> setP(p=> ({...p, weights:{...p.weights, ["دوستی (ایران)"]: asNumber(e.target.value,0)}}))} />
            </div>
            <div>
              <label>وزن: طرق</label>
              <input type="number" step="0.01" value={P.weights["طرق"]} onChange={(e)=> setP(p=> ({...p, weights:{...p.weights, ["طرق"]: asNumber(e.target.value,0)}}))} />
            </div>
            <div>
              <label>وزن: کارده</label>
              <input type="number" step="0.01" value={P.weights["کارده"]} onChange={(e)=> setP(p=> ({...p, weights:{...p.weights, ["کارده"]: asNumber(e.target.value,0)}}))} />
            </div>
            <div>
              <label>وزن: ارداک</label>
              <input type="number" step="0.01" value={P.weights["ارداک"]} onChange={(e)=> setP(p=> ({...p, weights:{...p.weights, ["ارداک"]: asNumber(e.target.value,0)}}))} />
            </div>
          </div>

          <div className="row">
            <div>
              <label>تاریخ‌های رویداد (YYYY-MM-DD با کاما)</label>
              <input type="text" value={P.eventDates} onChange={onText("eventDates")} placeholder="2025-08-18, 2025-09-01" />
            </div>
            <div>
              <label>نمایش سری‌ها</label>
              <div className="flex">
                <span className="pill"><input type="checkbox" checked={showAcc} onChange={()=> setShowAcc(v=>!v)} /> <span>جمع قابل برداشت</span></span>
                <span className="pill"><input type="checkbox" checked={showPhys} onChange={()=> setShowPhys(v=>!v)} /> <span>دوستی (کل فیزیکی)</span></span>
              </div>
            </div>
          </div>

          <div className="flex">
            <button className="btn" onClick={exportCSV}>دانلود CSV</button>
            <button className="btn-secondary" onClick={()=> setTests(runSelfTests())}>اجرای تست‌ها</button>
            <button className="btn-secondary" onClick={()=> setP({...defaults})}>ریست پیش‌فرض</button>
          </div>

          <div className="mono" style={{fontSize:12, marginTop:8}}>
            {tests.map((t,i)=> <div key={i} style={{color: t.ok ? "#86efac" : "#fca5a5"}}>{t.ok? "PASS":"FAIL"} — {t.msg}</div>)}
          </div>
        </aside>

        {/* Outputs */}
        <main className="grid" style={{gap:16}}>
          <section className="grid" style={{gridTemplateColumns:"repeat(3,1fr)", gap:12}}>
            <div className="kpi">
              <div className="muted" style={{fontSize:12}}>روز صفر</div>
              <div style={{fontSize:24, fontWeight:800}}>{sim.zeroDay || "—"}</div>
            </div>
            <div className="kpi">
              <div className="muted" style={{fontSize:12}}>روزهای باقی‌مانده</div>
              <div style={{fontSize:24, fontWeight:800}}>{daysLeft ?? "—"}</div>
            </div>
            <div className="kpi">
              <div className="muted" style={{fontSize:12}}>آستانه بحرانی (میلیون م³)</div>
              <div style={{fontSize:24, fontWeight:800}}>{P.criticalBuffer}</div>
            </div>
          </section>

          <section className="card" id="chart-top">
            <div className="toolbar">
              <h2 className="section-title">روند «جمع قابل برداشت»</h2>
              <div className="muted" style={{fontSize:12}}>
                {data.length ? `${data[0].date} → ${data[data.length-1].date}` : ""}
              </div>
            </div>
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{fontSize:12}} minTickGap={20} />
                  <YAxis tick={{fontSize:12}} />
                  <Tooltip formatter={(v, n)=> [v, n]} />
                  <Legend />
                  {showAcc && <Line type="monotone" dataKey="acc" name="جمع قابل برداشت" dot={false} strokeWidth={2} />}
                  {showPhys && <Line type="monotone" dataKey="phys" name="دوستی (کل فیزیکی)" dot={false} strokeWidth={1} />}
                  {/* zero-day marker */}
                  {sim.zeroDay && <ReferenceLine x={sim.zeroDay} stroke="#ef9a9a" strokeDasharray="4 4" label={{ value: "روز صفر", position: "top", fill: "#ef9a9a" }} />}
                  {/* event markers */}
                  {events.map((d,i)=> <ReferenceLine key={i} x={d} stroke="#ef9a9a" strokeDasharray="2 2" />)}
                  <Brush dataKey="date" travellerWidth={8} height={22} stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card" id="chart-bottom">
            <h2 className="section-title">تفکیک ذخیرهٔ قابل برداشت (مساحت انباشته)</h2>
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{fontSize:12}} minTickGap={20} />
                  <YAxis tick={{fontSize:12}} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="d_ir" name="دوستی (ایران)" stackId="1" strokeWidth={1} />
                  <Area type="monotone" dataKey="torogh" name="طرق" stackId="1" strokeWidth={1} />
                  <Area type="monotone" dataKey="kardeh" name="کارده" stackId="1" strokeWidth={1} />
                  <Area type="monotone" dataKey="ardak" name="ارداک" stackId="1" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card" style={{overflow:"auto"}}>
            <h2 className="section-title">پیش‌نمایش داده‌ها (۳۰ سطر)</h2>
            <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
              <thead className="muted">
                <tr>
                  {Object.keys(sim.rows[0] || {}).map(k => (
                    <th key={k} style={{textAlign:"right", padding:"6px 8px", whiteSpace:"nowrap"}}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(sim.rows || []).slice(0,30).map((r,i)=> (
                  <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                    {Object.keys(sim.rows[0] || {}).map(k => (
                      <td key={k} style={{padding:"6px 8px", whiteSpace:"nowrap"}}>{String(r[k])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
