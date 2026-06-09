"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";

const links = [
  { href: "/", label: "Start" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/immobilien", label: "Immobilien" },
  { href: "/philosophie", label: "Philosophie" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [heroPassed, setHeroPassed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setHeroPassed(false);
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      setHeroPassed(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const logoVisible = pathname !== "/" || heroPassed;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-nero-anthrazit/90 backdrop-blur-md py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className={`flex-shrink-0 transition-opacity duration-500 ${
              logoVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo3.svg"
              alt="NERO Familienbesitz"
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link text-xs tracking-[0.18em] uppercase font-normal transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-nero-gold active"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile burger */}
          <button
            className="md:hidden text-white/80 hover:text-white transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Menü öffnen"
          >
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
              <line x1="0" y1="1" x2="22" y2="1" stroke="currentColor" strokeWidth="1.5" />
              <line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5" />
              <line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </header>

      <MobileNav
        links={links}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
    </>
  );
}
