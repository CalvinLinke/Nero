"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface MobileNavProps {
  links: { href: string; label: string }[];
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export default function MobileNav({ links, isOpen, onClose, pathname }: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] bg-nero-black flex flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background mountain silhouette */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              className="absolute bottom-0 left-0 w-full"
              viewBox="0 0 1440 320"
              preserveAspectRatio="xMidYMax meet"
              aria-hidden="true"
            >
              <path
                d="M0,280 L60,210 L120,230 L180,180 L260,210 L320,155 L400,185 L460,130 L520,160 L580,105 L640,140 L700,85 L760,120 L820,70 L880,105 L940,60 L1000,90 L1060,55 L1120,85 L1180,45 L1240,80 L1300,110 L1360,75 L1400,100 L1440,65 L1440,320 L0,320 Z"
                fill="white"
                fillOpacity="0.04"
              />
            </svg>
          </div>

          {/* Close button */}
          <div className="relative z-10 flex justify-end p-6">
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Menü schließen"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="1" y1="1" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5" />
                <line x1="19" y1="1" x2="1" y2="19" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="relative z-10 flex flex-col justify-center flex-1 px-10 gap-2">
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`block font-display text-3xl py-2 transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-nero-gold"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Bottom tagline */}
          <div className="relative z-10 p-10">
            <p className="text-xs tracking-[0.2em] uppercase text-white/30 font-normal">
              NERO Familienbesitz GmbH
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
