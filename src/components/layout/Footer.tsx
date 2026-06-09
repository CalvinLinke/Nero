import Link from "next/link";

const links = [
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/immobilien", label: "Immobilien" },
  { href: "/philosophie", label: "Philosophie" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
  return (
    <footer className="bg-nero-anthrazit text-nero-offwhite">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Logo + Tagline */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo3.svg"
              alt="NERO Familienbesitz"
              className="h-16 w-auto object-contain mb-6"
            />
            <p className="text-xs leading-relaxed text-white/40 font-light max-w-[200px]">
              Wir überzeugen durch Haltung, nicht durch Lautstärke.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-white/30 mb-5 font-normal">
              Navigation
            </p>
            <nav className="flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/50 hover:text-white/90 transition-colors duration-200 font-light"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-white/30 mb-5 font-normal">
              Kontakt
            </p>
            <div className="space-y-2 text-sm text-white/50 font-light">
              <p>NERO Familienbesitz GmbH</p>
              <p>Leipzig · Dresden</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-white/25 font-light">
            © {new Date().getFullYear()} NERO Familienbesitz GmbH
          </p>
          <div className="flex gap-6">
            <Link href="/impressum" className="text-xs text-white/25 hover:text-white/50 transition-colors font-light">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-xs text-white/25 hover:text-white/50 transition-colors font-light">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
