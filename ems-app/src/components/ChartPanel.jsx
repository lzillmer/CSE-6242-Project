export default function ChartPanel({
  title,
  tag,
  name,
  spanRows = false,
  chartRef,
}) {
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
