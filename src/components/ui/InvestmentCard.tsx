"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface InvestmentCardProps {
  title: string;
  text: string;
  delay?: number;
  light?: boolean;
}

export default function InvestmentCard({
  title,
  text,
  delay = 0,
  light = false,
}: InvestmentCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`relative pl-5 pt-6 transition-colors duration-200 ${
        light ? "border-t border-white/20" : "border-t border-nero-anthrazit/20"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {/* Left gold accent line */}
      <motion.div
        className="absolute left-0 top-0 w-[2px] bg-nero-gold"
        animate={{ height: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />

      <h3
        className={`font-display text-xl mb-3 transition-colors duration-200 ${
          light
            ? hovered
              ? "text-nero-gold"
              : "text-nero-offwhite"
            : hovered
              ? "text-nero-gold"
              : "text-nero-anthrazit"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm leading-relaxed font-light ${
          light ? "text-white/70" : "text-nero-anthrazit/70"
        }`}
      >
        {text}
      </p>
    </motion.div>
  );
}
