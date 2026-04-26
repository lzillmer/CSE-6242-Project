import { useState, useRef, useEffect } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import ChartPanel from "./components/ChartPanel";
import { simulation } from "./charts/simulation";
import { map } from "./charts/map";
import { heatmap } from "./charts/heatmap";
import plusIcon from "./assets/logo.png";

const DIVERSION_DEFAULT = { g1: 0, g2: 0, g3: 0 };

export default function EMSDashboard() {
  const [borough, setBorough] = useState("All Boroughs");
  const [acuity, setAcuity] = useState("All Levels");
  const [call_vol, setCall_vol] = useState(100);
  const [diversion, setDiversion] = useState(DIVERSION_DEFAULT);

  const simulationRef = useRef(null);
  const mapRef = useRef(null);
  const heatmapRef = useRef(null);

  useEffect(() => {
    if (!simulationRef.current) return;
    var draw = () => {
      simulation(simulationRef.current, {
        borough,
        acuity,
        call_vol,
        diversion,
      });
    };
    draw();
    var observer = new ResizeObserver(draw);
    observer.observe(simulationRef.current);
    return () => observer.disconnect();
  }, [borough, acuity, call_vol, diversion]);

  useEffect(() => {
    if (!mapRef.current) return;
    var draw = () => {
      map(mapRef.current, { borough, acuity });
    };
    draw();
    var observer = new ResizeObserver(draw);
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [borough, acuity]);

  useEffect(() => {
    if (!heatmapRef.current) return;
    var draw = () => {
      heatmap(heatmapRef.current, { borough, acuity });
    };
    draw();
    var observer = new ResizeObserver(draw);
    observer.observe(heatmapRef.current);
    return () => observer.disconnect();
  }, [borough, acuity]);

  return (
    <>
      <header className="ems-header">
        <div className="logo-group">
          <div className="logo-icon">
            <img
              src={plusIcon}
              alt="+"
              style={{ width: "20px", height: "20px" }}
            />
          </div>
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
        />

        <main>
          <div className="viz-grid">
            <ChartPanel
              title="Simulated 90th Percentile Response Time with Diversion"
              tag="d3-simulation"
              name="Simulation"
              spanRows
              chartRef={simulationRef}
            />

            <ChartPanel
              title="NYC 90th Percentile Response Time Map"
              tag="d3-choropleth-map"
              name="Map"
              chartRef={mapRef}
            />

            <ChartPanel
              title="Response Time Coefficient Impact Heatmap"
              tag="d3-coefficient-heatmap"
              name="Heatmap"
              chartRef={heatmapRef}
            />
          </div>
        </main>
      </div>
    </>
  );
}
