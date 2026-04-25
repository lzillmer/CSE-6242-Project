import { useState, useRef, useEffect } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import ChartPanel from "./components/ChartPanel";
import KpiStrip from "./components/KpiStrip";

const DIVERSION_DEFAULT = { g1: 0, g2: 0, g3: 0 };

export default function EMSDashboard() {
  const [borough, setBorough] = useState("All Boroughs");
  const [acuity, setAcuity] = useState("All Priorities");
  const [call_vol, setCall_vol] = useState(100);
  const [diversion, setDiversion] = useState(DIVERSION_DEFAULT);

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
      acuity,
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
          acuity={acuity}
          setAcuity={setAcuity}
          call_vol={call_vol}
          setCall_vol={setCall_vol}
          diversion={diversion}
          setDiversion={setDiversion}
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
