export function StatCard({
  title,
  value,
  delta,
  lastValue,
  color = "blue",
  decor = "circles",
}) {
  const positive = delta >= 0;

  return (
    <div className={`stat-card stat-card--${color}`}>
 

      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value-row">
          <span className="stat-card-value">{value}</span>
          {delta !== undefined && (
            <span className={`stat-card-badge ${positive ? "up" : "down"}`}>
              {positive ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>

        {lastValue !== undefined && (
          <div className="stat-card-footer">
            Mês anterior: <strong>{lastValue}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
