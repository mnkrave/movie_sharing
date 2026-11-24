import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import {
  getWhitelist,
  addEmailToWhitelist,
  removeEmailFromWhitelist,
  isValidEmailAddress,
  findUserByEmail,
} from "@/lib/store";
import { sendInviteEmail } from "@/lib/email";

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const whitelist = await getWhitelist();
  return NextResponse.json(whitelist);
}

export async function POST(req: Request) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { email, resendOnly } = await req.json();
    if (!email || typeof email !== "string" || !isValidEmailAddress(email)) {
      return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const existingUser = await findUserByEmail(emailLower);
    if (existingUser?.isBanned) {
      return NextResponse.json(
        { error: "Dieser Nutzer ist aktuell gesperrt. Entsperre ihn zuerst in der Nutzer-Übersicht." },
        { status: 400 }
      );
    }

    if (!resendOnly) {
      await addEmailToWhitelist(emailLower, {
        userId: admin.userId,
        name: admin.userName,
        email: admin.email,
      });
    }

    const { sent: emailSent, inviteLink, error: emailError } = await sendInviteEmail({
      to: emailLower,
      invitedByName: admin.userName,
    });

    const whitelist = await getWhitelist();
    return NextResponse.json({ whitelist, inviteLink, emailSent, emailError });
  } catch (err) {
    console.error("Whitelist add error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdminSession())) {
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
