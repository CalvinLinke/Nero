"use client";

import { motion } from "framer-motion";

export default function HeroMountain() {
  const peaks = [
    // [x, yFrom, yTo] — each peak rises from below
    { x: 0, y: 280, targetY: 240 },
    { x: 60, y: 290, targetY: 210 },
    { x: 120, y: 285, targetY: 230 },
    { x: 180, y: 295, targetY: 180 },
    { x: 260, y: 288, targetY: 210 },
    { x: 320, y: 300, targetY: 155 },
    { x: 400, y: 292, targetY: 185 },
    { x: 460, y: 305, targetY: 130 },
    { x: 520, y: 295, targetY: 160 },
    { x: 580, y: 308, targetY: 105 },
    { x: 640, y: 298, targetY: 140 },
    { x: 700, y: 310, targetY: 85 },
    { x: 760, y: 300, targetY: 120 },
    { x: 820, y: 315, targetY: 70 },
    { x: 880, y: 305, targetY: 105 },
    { x: 940, y: 315, targetY: 60 },
    { x: 1000, y: 308, targetY: 90 },
    { x: 1060, y: 318, targetY: 55 },
    { x: 1120, y: 310, targetY: 85 },
    { x: 1180, y: 318, targetY: 45 },
    { x: 1240, y: 312, targetY: 80 },
    { x: 1300, y: 308, targetY: 110 },
    { x: 1360, y: 312, targetY: 75 },
    { x: 1400, y: 308, targetY: 100 },
    { x: 1440, y: 315, targetY: 65 },
  ];

  const buildPath = (pts: typeof peaks, useTarget: boolean) => {
    const points = pts.map((p) => `${p.x},${useTarget ? p.targetY : p.y}`);
    return `M${points.join(" L")} L1440,320 L0,320 Z`;
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ height: "55%" }}
      >
        {/* Background layer — slightly more transparent */}
        <motion.path
          fill="white"
          fillOpacity={0.04}
          initial={{ d: buildPath(peaks, false) }}
          animate={{ d: buildPath(peaks, true) }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />

        {/* Foreground ridge — main silhouette */}
        {peaks.map((peak, i) => {
          const next = peaks[i + 1];
          if (!next) return null;
          return (
            <motion.line
              key={i}
              x1={peak.x}
              y1={peak.y}
              x2={next.x}
              y2={next.y}
              stroke="white"
              strokeOpacity={0}
              strokeWidth="0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
            />
          );
        })}

        {/* Main foreground fill */}
        <motion.path
          fill="white"
          fillOpacity={0.07}
          initial={{ d: buildPath(peaks, false) }}
          animate={{ d: buildPath(peaks, true) }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        />

        {/* Ridge line */}
        <motion.polyline
          points={peaks.map((p) => `${p.x},${p.targetY}`).join(" ")}
          fill="none"
          stroke="white"
          strokeWidth="0.8"
          strokeOpacity={0.25}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut", delay: 0.6 }}
        />
      </svg>
    </div>
  );
}
