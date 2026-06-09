"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface MountainDividerProps {
  color?: string;
  className?: string;
}

export default function MountainDivider({
  color = "currentColor",
  className = "",
}: MountainDividerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className={`w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1440 60"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 60 }}
        aria-hidden="true"
      >
        <motion.path
          d="M0,45 L60,38 L120,42 L180,30 L260,40 L320,22 L400,34 L460,18 L520,28 L580,12 L640,22 L700,8 L760,18 L820,4 L880,14 L940,2 L1000,10 L1060,5 L1120,12 L1180,3 L1240,10 L1300,16 L1360,8 L1400,14 L1440,6"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            isInView
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
