import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DonutChart({
  data,
  totalValue: propTotalValue,
  size = 200,
  strokeWidth = 20,
  animationDuration = 1,
  animationDelayPerSegment = 0.05,
  centerContent,
  onSegmentHover,
  className = "",
}) {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const internalTotalValue =
    propTotalValue || data.reduce((sum, s) => sum + s.value, 0);

  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercentage = 0;

  useEffect(() => {
    onSegmentHover?.(hoveredSegment);
  }, [hoveredSegment, onSegmentHover]);

  return (
    <div
      className={`donut-chart-wrapper ${className}`}
      style={{ width: size, height: size, position: "relative" }}
      onMouseLeave={() => setHoveredSegment(null)}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible", transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
        />
        <AnimatePresence>
          {data.map((segment, index) => {
            if (segment.value === 0) return null;

            const percentage =
              internalTotalValue === 0
                ? 0
                : (segment.value / internalTotalValue) * 100;

            const strokeDasharray = `${
              (percentage / 100) * circumference
            } ${circumference}`;
            const strokeDashoffset =
              (cumulativePercentage / 100) * circumference;

            const isActive = hoveredSegment?.label === segment.label;

            cumulativePercentage += percentage;

            return (
              <motion.circle
                key={segment.label || index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-strokeDashoffset}
                strokeLinecap="round"
                initial={{ opacity: 0, strokeDashoffset: circumference }}
                animate={{ opacity: 1, strokeDashoffset: -strokeDashoffset }}
                transition={{
                  opacity: {
                    duration: 0.3,
                    delay: index * animationDelayPerSegment,
                  },
                  strokeDashoffset: {
                    duration: animationDuration,
                    delay: index * animationDelayPerSegment,
                    ease: "easeOut",
                  },
                }}
                style={{
                  cursor: "pointer",
                  transformOrigin: "center",
                  filter: isActive
                    ? `drop-shadow(0px 0px 6px ${segment.color}) brightness(1.1)`
                    : "none",
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                  transition: "filter 0.2s ease-out, transform 0.2s ease-out",
                }}
                onMouseEnter={() => setHoveredSegment(segment)}
              />
            );
          })}
        </AnimatePresence>
      </svg>

      {centerContent && (
        <div
          className="donut-center-content"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: size - strokeWidth * 2.5,
            height: size - strokeWidth * 2.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {centerContent}
        </div>
      )}
    </div>
  );
}
