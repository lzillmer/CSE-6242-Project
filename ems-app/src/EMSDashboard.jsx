import { useState, useRef, useEffect } from "react";
import "./App.css";

const SEVERITY_GROUPS = [
  { label: "All", value: "All Levels", levels: [] },
  { label: "Group 1", value: "Group 1", levels: [1, 2, 3] },
  { label: "Group 2", value: "Group 2", levels: [4, 5, 6] },
  { label: "Group 3", value: "Group 3", levels: [7] },
];

function ChartPanel({ title, tag, name, spanRows = false, chartRef }) {
  return (
    <div className={`viz-panel${spanRows ? " span-rows" : ""}`}>
      <div className="panel-header">
        <span className="panel-title">{title}</span>
        <span className="panel-tag">{tag}</span>
      </div>

      {chartRef ? (
        <div className="chart-slot" ref={chartRef} />
      ) : (
        <div>{name}</div>
      )}
    </div>
  );
}

function Sidebar({ borough, setBorough, acuity, setAcuity, onRun }) {
  return (
    <aside>
      <div>
        <div className="sidebar-section-label">Geography</div>
        <div className="control-card">
          <div className="control-label">Borough</div>
          <div className="control-desc">
            Filter analysis to a specific NYC borough or view all.
          </div>
          <select value={borough} onChange={(e) => setBorough(e.target.value)}>
            {[
              "All Boroughs",
              "Manhattan",
              "Brooklyn",
              "Queens",
              "Bronx",
              "Staten Island",
            ].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="sidebar-section-label">Severity Filter</div>
        <div className="control-card">
          <div className="control-label">Severity Level</div>
          <div className="control-desc">
            Filter by call severity group. Level 1 is most critical; Level 7 is
            lowest priority.
          </div>
          <div className="severity-group">
            {SEVERITY_GROUPS.map((g) => (
              <button
                key={g.value}
                className={`severity-btn${acuity === g.value ? " active" : ""}`}
                onClick={() => setAcuity(g.value)}
              >
                <span className="severity-btn-label">{g.label}</span>
                {g.levels.length > 0 && (
                  <span className="severity-btn-sub">
                    {g.levels.length === 1
                      ? `Level ${g.levels[0]}`
                      : `Levels ${g.levels[0]}–${g.levels[g.levels.length - 1]}`}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="sidebar-section-label">Actions</div>
        <button className="sim-btn" onClick={onRun}>
          ▶ RUN SIMULATION
        </button>
      </div>
    </aside>
  );
}

function KpiStrip({ kpis }) {
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

export default function EMSDashboard() {
  const [borough, setBorough] = useState("All Boroughs");
  const [diversionRate, setDiversionRate] = useState(0);
  const [peakHour, setPeakHour] = useState(8);
  const [acuity, setAcuity] = useState("All Priorities");
  const [equityLayer, setEquityLayer] = useState("None");

  const [kpis] = useState([
    { label: "Avg Response Time (High-Acuity)", value: "-", color: "red" },
    { label: "Projected Time Saved", value: "-", color: "amber" },
    { label: "Est. Lives Saved / Year", value: "-", color: "" },
    { label: "Precincts Above Thresholds", value: "-", color: "" },
  ]);

  const choroplethRef = useRef(null);
  const scatterRef = useRef(null);
  const simBarRef = useRef(null);

  // Add chart use effect calls here

  function handleRun() {
    // Handle simulation here
    console.log("Run Simuldation", {
      borough,
      diversionRate,
      peakHour,
      acuity,
      equityLayer,
    });
  }

  return (
    <>
      <header className="ems-header">
        <div className="logo-group">
          <div className="logo-icon"></div>
          <div>
            <div className="logo-text">EMS RESPONSE ANALYZER</div>
            <div className="logo-sub">CSE 6242 · TEAM 171</div>
          </div>
        </div>
        <div className="header-badges"></div>
      </header>

      <div className="shell">
        <Sidebar
          borough={borough}
          setBorough={setBorough}
          diversionRate={diversionRate}
          setDiversionRate={setDiversionRate}
          peakHour={peakHour}
          setPeakHour={setPeakHour}
          acuity={acuity}
          setAcuity={setAcuity}
          equityLayer={equityLayer}
          setEquityLayer={setEquityLayer}
          onRun={handleRun}
        />

        <main>
          <KpiStrip kpis={kpis} />

          <div className="viz-grid">
            <ChartPanel
              title="NYC Precinct Map -- Response Time"
              tag="d3-geo-choropleth"
              name="CHOROPLETH MAP"
              spanRows
              chartRef={choroplethRef}
            />

            <ChartPanel
              title="Call Volume vs. Response Time"
              tag="d3-scatter-regression"
              name="SCATTER PLOT"
              chartRef={scatterRef}
            />

            <ChartPanel
              title="Simulated Response Time Delta"
              tag="bar-chart-simulation"
              name="SIMULATION CHART"
              chartRef={simBarRef}
            />
          </div>
        </main>
      </div>
    </>
  );
}
