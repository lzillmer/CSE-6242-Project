export default function KpiStrip({ kpis }) {
  return (
    <div className="kpi-strip">
      {kpis.map((k) => (
        <div key={k.label} className="kpi-cell">
          <div className="kpi-label">{k.label}</div>
          <div className={`kpi-value ${k.color || ""}`}>{k.value}</div>
          <div className="kpi-delta">{k.delta}</div>
        </div>
      ))}
    </div>
  );
}
