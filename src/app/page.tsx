"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import InvestmentCard from "@/components/ui/InvestmentCard";
import AnimatedSection from "@/components/ui/AnimatedSection";

const investments = [
  {
    title: "Bestandsimmobilien",
    text: "Wir kaufen, was steht — und halten es. Kein Exit-Druck, kein Quartalsziel. Unser Zeithorizont beginnt da, wo andere aufhören zu rechnen.",
  },
  {
    title: "Beteiligungen",
    text: "Für Vorhaben, die mehr brauchen als Kapital. Wir beteiligen uns selektiv — und dann dauerhaft.",
  },
  {
    title: "Erbanteile",
    text: "Eine Assetklasse, die Diskretion verlangt und Vertrauen belohnt. Wir kennen die Materie und nehmen uns die Zeit, die sie braucht.",
  },
];


export default function HomePage() {
  const headlineRef = useRef(null);
  const headlineInView = useInView(headlineRef, { once: true, margin: "-15%" });

  return (
    <>
      {/* ── Hero Video ── */}
      <section className="relative w-full bg-nero-anthrazit pb-2">
        {/* Top gradient: nav → video */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-nero-anthrazit to-transparent z-10 pointer-events-none" />
        {/* Bottom gradient: video → text section */}
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-nero-anthrazit to-transparent z-10 pointer-events-none" />

        <video
          autoPlay
          muted
          playsInline
          className="w-full h-auto block"
        >
          <source src="/NeroHero3.mp4" type="video/mp4" />
        </video>
      </section>

      {/* ── Hero Text ── */}
      <section className="bg-nero-anthrazit pt-8 md:pt-14 pb-36 md:pb-48">
        <div className="text-center px-6 max-w-3xl mx-auto">
          {/* Headline */}
          <motion.h1
            className="font-display text-2xl md:text-3xl lg:text-4xl text-nero-offwhite leading-snug mb-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
          >
            Wir überzeugen durch Haltung,<br className="hidden md:block" /> nicht durch Lautstärke.
          </motion.h1>

          {/* Divider line */}
          <motion.div
            className="w-12 h-px bg-nero-gold mx-auto mb-7"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          />

          {/* Subline */}
          <motion.p
            className="text-sm md:text-base tracking-[0.12em] text-white/40 uppercase font-light mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            Immobilien in Leipzig und im Elbtal um Dresden
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            <Link
              href="/kontakt"
              className="inline-block px-8 py-3 border border-nero-gold/50 text-nero-offwhite text-xs tracking-[0.18em] uppercase hover:border-nero-gold hover:text-nero-gold transition-all duration-300"
            >
              Kontakt aufnehmen
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="bg-nero-offwhite py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <AnimatedSection>
              <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-5 font-normal">
                Family Office
              </p>
              <h2 ref={headlineRef} className="font-display text-3xl md:text-4xl text-nero-anthrazit leading-snug mb-8">
                <span className="relative inline-block">
                  Kein Dienstleister.
                  <motion.span className="absolute bottom-0 left-0 h-[2px] w-full bg-nero-gold origin-left" initial={{ scaleX: 0 }} animate={headlineInView ? { scaleX: 1 } : {}} transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }} />
                </span>
                <br />
                <span className="relative inline-block">
                  Kein Makler.
                  <motion.span className="absolute bottom-0 left-0 h-[2px] w-full bg-nero-gold origin-left" initial={{ scaleX: 0 }} animate={headlineInView ? { scaleX: 1 } : {}} transition={{ duration: 0.7, delay: 1.5, ease: "easeOut" }} />
                </span>
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed mb-5">
                NERO Familienbesitz ist kein Dienstleister. Wir kaufen Immobilien in den Bestand — mit eigenem Kapital, ohne Zeitdruck. Unser Fokus liegt auf Bestandsobjekten in Leipzig und der Dresdner Region.
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed">
                Langfristig. Diskret. Mit klaren Kriterien.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Investment Cards ── */}
      <section className="bg-nero-anthrazit py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="mb-20">
            <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-4 font-normal">
              Investmentbereiche
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-nero-offwhite leading-snug">
              Was wir kaufen.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {investments.map((item, i) => (
              <InvestmentCard
                key={item.title}
                title={item.title}
                text={item.text}
                delay={i * 0.12}
                light
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Region ── */}
      <section className="bg-nero-beige py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <AnimatedSection>
              <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-5 font-normal">
                Regionaler Fokus
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-nero-anthrazit leading-snug mb-8">
                Leipzig.<br />
                Das Elbtal um Dresden.
              </h2>
              <p className="text-nero-anthrazit/60 font-light leading-relaxed mb-8">
                Märkte, die wir kennen — weil wir dort präsent sind. Nicht weil die Daten es empfehlen, sondern weil das Vertrauen dort gewachsen ist. Regionale Verwurzelung ist kein Zufall. Sie ist Methode.
              </p>
              <Link
                href="/immobilien"
                className="inline-block text-xs tracking-[0.18em] uppercase text-nero-anthrazit/60 hover:text-nero-anthrazit transition-colors duration-200 font-normal border-b border-nero-anthrazit/30 hover:border-nero-anthrazit/60 pb-1"
              >
                Investmentkriterien
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Bild ── */}
      <section className="w-full h-72 md:h-[480px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Bild2.png"
          alt="Stadtarchitektur Leipzig"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </section>

      {/* ── CTA ── */}
      <section className="bg-nero-offwhite py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="max-w-xl">
            <h2 className="font-display text-3xl md:text-4xl text-nero-anthrazit leading-snug mb-6">
              Haben Sie ein Objekt, das passt?
            </h2>
            <p className="text-nero-anthrazit/55 font-light mb-12 leading-relaxed">
              Kein Bieterverfahren. Kein langer Prozess. Wer ein Objekt hat, das zu unseren Kriterien passt, nimmt Kontakt auf.
            </p>
            <Link
              href="/kontakt"
              className="inline-block px-10 py-4 bg-nero-anthrazit text-nero-offwhite text-xs tracking-[0.18em] uppercase hover:bg-nero-gold transition-colors duration-300"
            >
              Kontakt aufnehmen
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
