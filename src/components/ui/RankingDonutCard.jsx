import { useState } from "react";
import { DonutChart } from "./DonutChart";

const CORES = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export function RankingDonutCard({ titulo, dados, campoLabel, campoValor }) {
  const [hovered, setHovered] = useState(null);

  const chartData = dados.map((item, i) => ({
    value: item[campoValor],
    color: CORES[i % CORES.length],
    label: item[campoLabel],
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  const active = chartData.find((d) => d.label === hovered);
  const displayLabel = active?.label ?? "Total";
  const displayValue = active?.value ?? total;
  const displayPercentage = active ? (active.value / total) * 100 : 100;

  if (dados.length === 0) {
    return (
      <div className="card">
        <h2>{titulo}</h2>
        <div className="card-content">
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            Sem dados disponíveis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card donut-chart-card">
      <h2>{titulo}</h2>

      <DonutChart
        data={chartData}
        size={200}
        strokeWidth={24}
        animationDuration={1.1}
        onSegmentHover={(seg) => setHovered(seg?.label ?? null)}
        centerContent={
          <>
            <span className="donut-center-label">{displayLabel}</span>
            <span className="donut-center-value">{displayValue}</span>
            {active && (
              <span className="donut-center-percentage">
                {displayPercentage.toFixed(0)}%
              </span>
            )}
          </>
        }
      />

      <div className="donut-legend">
        {chartData.map((seg) => (
          <div
            key={seg.label}
            className={`donut-legend-item ${
              hovered === seg.label ? "active" : ""
            }`}
            onMouseEnter={() => setHovered(seg.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="donut-legend-left">
              <span
                className="donut-legend-dot"
                style={{ backgroundColor: seg.color }}
              />
              <span className="donut-legend-label">{seg.label}</span>
            </div>
            <span className="donut-legend-value">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
