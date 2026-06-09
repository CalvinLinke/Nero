"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { stiffness: 300, damping: 28, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 28, mass: 0.5 });

  useEffect(() => {
    setMounted(true);

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const checkPointer = (e: MouseEvent) => {
      const el = e.target as Element;
      const isInteractive = el.closest("a, button, [data-cursor], input, textarea, select") !== null;
      setIsPointer(isInteractive);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", checkPointer);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", checkPointer);
    };
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{ left: springX, top: springY, x: "-50%", y: "-50%" }}
    >
      {/* Horizontal bar */}
      <motion.div
        className="absolute bg-nero-gold"
        style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
        animate={{
          width: isPointer ? 20 : 14,
          height: 1,
          opacity: isPointer ? 0.6 : 0.5,
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Vertical bar */}
      <motion.div
        className="absolute bg-nero-gold"
        style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
        animate={{
          width: 1,
          height: isPointer ? 20 : 14,
          opacity: isPointer ? 0.6 : 0.5,
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Center dot */}
      <motion.div
        className="absolute rounded-full bg-nero-gold"
        style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
        animate={{
          width: isPointer ? 3 : 2,
          height: isPointer ? 3 : 2,
          opacity: isPointer ? 0.9 : 0.7,
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
