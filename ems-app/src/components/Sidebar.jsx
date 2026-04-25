const SEVERITY_GROUPS = [
  { label: "All", value: "All Levels", levels: [] },
  { label: "Group 1", value: "Group 1", levels: [1, 2, 3] },
  { label: "Group 2", value: "Group 2", levels: [4, 5, 6] },
  { label: "Group 3", value: "Group 3", levels: [7] },
];

const DIVERSION_GROUPS = [
  { key: "g1", label: "Group 1", sub: "Levels 1–3" },
  { key: "g2", label: "Group 2", sub: "Levels 4–6" },
  { key: "g3", label: "Group 3", sub: "Level 7" },
];

const CALL_VOL_MIN = 0;
const CALL_VOL_MAX = 200;
const CALL_VOL_DEFAULT = 100;

const DIVERSION_MIN = 0;
const DIVERSION_MAX = 100;
const DIVERSION_DEFAULT = 0;

export default function Sidebar({
  borough,
  setBorough,
  acuity,
  setAcuity,
  call_vol,
  setCall_vol,
  diversion,
  setDiversion,
  onRun,
}) {
  const pct = ((call_vol - CALL_VOL_MIN) / (CALL_VOL_MAX - CALL_VOL_MIN)) * 100;

  function callVolumeLabel(val) {
    if (val === CALL_VOL_DEFAULT) return "";
    return `${val}%`;
  }

  function callVolumeLabel(val) {
    if (val === CALL_VOL_DEFAULT) return "";
    return `${val}%`;
  }

  const anyDiversionChanged = DIVERSION_GROUPS.some(
    (g) => diversion[g.key] !== DIVERSION_DEFAULT,
  );

  function resetDiversion() {
    const reset = {};
    DIVERSION_GROUPS.forEach((g) => (reset[g.key] = DIVERSION_DEFAULT));
    setDiversion(reset);
  }

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
        <div className="sidebar-section-label">Call Volume</div>
        <div className="control-card">
          <div className="control-label">
            Call Volume Adjustment
            <span className="call-vol-value">{call_vol}%</span>
          </div>
          <div className="control-desc">
            Scale simulated call volume relative to the baseline.
          </div>
          <div className="slider-wrap">
            <input
              type="range"
              min={CALL_VOL_MIN}
              max={CALL_VOL_MAX}
              value={call_vol}
              onChange={(e) => setCall_vol(Number(e.target.value))}
              className="call-vol-slider"
              style={{ "--pct": `${pct}%` }}
            />
            <div className="slider-ticks">
              <span>{CALL_VOL_MIN}%</span>
              <span className="slider-tick-mid">{CALL_VOL_DEFAULT}%</span>
              <span>{CALL_VOL_MAX}%</span>
            </div>
          </div>
          {call_vol !== CALL_VOL_DEFAULT && (
            <button
              className="reset-btn"
              onClick={() => setCall_vol(CALL_VOL_DEFAULT)}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="sidebar-section-label">Diversion</div>
        <div className="control-card">
          <div className="control-label">Diversion Rate by Group</div>
          <div className="control-desc">
            Set the percentage of calls diverted away from EMS response for each
            severity group.
          </div>

          <div className="diversion-sliders">
            {DIVERSION_GROUPS.map((g) => {
              const val = diversion[g.key] ?? DIVERSION_DEFAULT;
              const divPct =
                ((val - DIVERSION_MIN) / (DIVERSION_MAX - DIVERSION_MIN)) * 100;
              return (
                <div key={g.key} className="diversion-row">
                  <div className="diversion-row-header">
                    <div className="diversion-row-labels">
                      <span className="diversion-group-label">{g.label}</span>
                      <span className="diversion-group-sub">{g.sub}</span>
                    </div>
                    <span className="diversion-value">{val}%</span>
                  </div>
                  <input
                    type="range"
                    min={DIVERSION_MIN}
                    max={DIVERSION_MAX}
                    step={1}
                    value={val}
                    onChange={(e) =>
                      setDiversion((prev) => ({
                        ...prev,
                        [g.key]: Number(e.target.value),
                      }))
                    }
                    className="call-vol-slider"
                    style={{ "--pct": `${divPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          {anyDiversionChanged && (
            <button className="reset-btn" onClick={resetDiversion}>
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* <div>
        <div className="sidebar-section-label">Actions</div>
        <button className="sim-btn" onClick={onRun}>
          ▶ RUN SIMULATION
        </button>
      </div> */}
    </aside>
  );
}
