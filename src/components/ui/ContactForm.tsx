"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    company: "",
    role: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", company: "", role: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="py-12 text-center">
        <p className="font-display text-2xl text-nero-anthrazit mb-3">
          Vielen Dank.
        </p>
        <p className="text-nero-anthrazit/60 font-light">
          Ihre Anfrage ist bei uns eingegangen. Wir melden uns.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-nero-anthrazit/50 mb-2">
            Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="input-underline text-nero-anthrazit"
            placeholder="Ihr Name"
          />
        </div>
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-nero-anthrazit/50 mb-2">
            Unternehmen
          </label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            className="input-underline text-nero-anthrazit"
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-nero-anthrazit/50 mb-2">
          Ich nehme Kontakt auf als
        </label>
        <div className="relative">
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input-underline text-nero-anthrazit appearance-none pr-6 w-full"
          >
            <option value="">Bitte wählen</option>
            <option value="Eigentümer">Eigentümer</option>
            <option value="Makler">Makler</option>
            <option value="Co-Investor / Partner">Co-Investor / Partner</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
          <svg
            className="absolute right-0 bottom-3 pointer-events-none text-nero-gold/60"
            width="12" height="8" viewBox="0 0 12 8" fill="none"
          >
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-nero-anthrazit/50 mb-2">
          E-Mail *
        </label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          className="input-underline text-nero-anthrazit"
          placeholder="ihre@email.de"
        />
      </div>

      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-nero-anthrazit/50 mb-2">
          Nachricht *
        </label>
        <textarea
          name="message"
          required
          value={form.message}
          onChange={handleChange}
          rows={5}
          className="input-underline text-nero-anthrazit resize-none"
          placeholder="Beschreiben Sie kurz Ihr Anliegen oder Objekt."
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-8 py-3 bg-nero-anthrazit text-nero-offwhite text-xs tracking-[0.15em] uppercase transition-colors duration-300 hover:bg-nero-gold disabled:opacity-50"
        >
          {status === "loading" ? "Wird gesendet…" : "Anfrage senden"}
        </button>
        {status === "error" && (
          <p className="text-sm text-red-600 font-light">
            Etwas ist schiefgegangen. Bitte versuchen Sie es erneut.
          </p>
        )}
      </div>
    </form>
  );
}
