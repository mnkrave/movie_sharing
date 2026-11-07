import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getWhitelist,
  addEmailToWhitelist,
  removeEmailFromWhitelist,
} from "@/lib/store";
import { Resend } from "resend";

async function isSuperAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  return email === "lukasreinle0@gmail.com" || (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const whitelist = await getWhitelist();
  return NextResponse.json(whitelist);
}

export async function POST(req: Request) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    await addEmailToWhitelist(emailLower);

    let emailSent = false;
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/register?email=${encodeURIComponent(emailLower)}`;

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "CineCircle <onboarding@resend.dev>",
          to: emailLower,
          subject: "🎬 Lukas hat dich zu CineCircle eingeladen!",
          html: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0b0f19; color: #f8fafc; border-radius: 16px;">
              <h2 style="color: #f59e0b; margin-top: 0;">🎬 Willkommen bei CineCircle!</h2>
              <p>Lukas hat dich eingeladen, gemeinsam Filme & Serien zu teilen, Top-Listen & Oscar-Gewinner abzuhaken und mit dem globalen VPN-Finder zu sehen, wo welcher Film läuft.</p>
              <a href="${inviteLink}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #f59e0b; color: #000; font-weight: bold; text-decoration: none; border-radius: 10px;">Jetzt Account erstellen</a>
            </div>
          `,
        });
        emailSent = true;
      } catch (err) {
        console.error("Optional Resend email error:", err);
      }
    }

    const whitelist = await getWhitelist();
    return NextResponse.json({ whitelist, inviteLink, emailSent });
  } catch (err) {
    console.error("Whitelist add error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email fehlt" }, { status: 400 });
  }

  await removeEmailFromWhitelist(email);
  const whitelist = await getWhitelist();
  return NextResponse.json({ whitelist });
}
