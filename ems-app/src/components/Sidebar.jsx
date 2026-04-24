const SEVERITY_GROUPS = [
  { label: "All", value: "All Levels", levels: [] },
  { label: "Group 1", value: "Group 1", levels: [1, 2, 3] },
  { label: "Group 2", value: "Group 2", levels: [4, 5, 6] },
  { label: "Group 3", value: "Group 3", levels: [7] },
];

const CALL_VOL_MIN = 0;
const CALL_VOL_MAX = 200;
const CALL_VOL_DEFAULT = 100;

export default function Sidebar({
  borough,
  setBorough,
  acuity,
  setAcuity,
  call_vol,
  setCall_vol,
  onRun,
}) {
  const pct = ((call_vol - CALL_VOL_MIN) / (CALL_VOL_MAX - CALL_VOL_MIN)) * 100;

  function callVolumeLabel(val) {
    if (val === CALL_VOL_DEFAULT) return "";
    return `${val}%`;
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
            Scale simulated call volume relative to the historical baseline.
            100% represents the recorded average.
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
        <div className="sidebar-section-label">Actions</div>
        <button className="sim-btn" onClick={onRun}>
          ▶ RUN SIMULATION
        </button>
      </div>
    </aside>
  );
}
