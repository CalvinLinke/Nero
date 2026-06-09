import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { name, company, role, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, E-Mail und Nachricht sind Pflichtfelder." },
        { status: 400 }
      );
    }

    const contactEmail = process.env.CONTACT_EMAIL;
    if (!contactEmail) {
      return NextResponse.json(
        { error: "Server-Konfigurationsfehler." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "NERO Website <onboarding@resend.dev>",
      to: contactEmail,
      replyTo: email,
      subject: `Neue Kontaktanfrage — ${name}${role ? ` · ${role}` : ""}${company ? ` (${company})` : ""}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #2c2c2c;">
          <h2 style="font-size: 20px; margin-bottom: 24px;">Neue Anfrage über nero-familienbesitz.de</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 120px; vertical-align: top;">Name</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding: 8px 0; color: #666; vertical-align: top;">Unternehmen</td>
              <td style="padding: 8px 0;">${company}</td>
            </tr>` : ""}
            ${role ? `
            <tr>
              <td style="padding: 8px 0; color: #666; vertical-align: top;">Kontaktart</td>
              <td style="padding: 8px 0; font-weight: bold;">${role}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 8px 0; color: #666; vertical-align: top;">E-Mail</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2d6060;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; vertical-align: top;">Nachricht</td>
              <td style="padding: 8px 0; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Fehler beim Senden der E-Mail." },
      { status: 500 }
    );
  }
}
