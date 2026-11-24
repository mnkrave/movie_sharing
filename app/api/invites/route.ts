import { NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth";
import {
  createUserInvite,
  getAdminNotificationEmails,
  getInviteApprovalRequests,
  getUserInvitesAndQuota,
  INVITE_LIMITS,
  revokeUserInvite,
} from "@/lib/store";
import { sendAdminInviteNotificationEmail, sendInviteEmail } from "@/lib/email";

export async function GET() {
  const auth = await requireUserSession();
  if (!auth) {
    return NextResponse.json({ error: "Bitte logge dich ein." }, { status: 401 });
  }

  try {
    const [data, approvalRequests] = await Promise.all([
      getUserInvitesAndQuota(auth.userId, auth.isAdmin),
      getInviteApprovalRequests({ requesterUserId: auth.userId }),
    ]);
    return NextResponse.json(
      { ...data, approvalRequests },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (err) {
    console.error("Invites fetch error:", err);
    return NextResponse.json({ error: "Serverfehler beim Laden der Einladungen." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireUserSession();
  if (!auth) {
    return NextResponse.json({ error: "Bitte logge dich ein." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";

    const created = await createUserInvite({
      inviterId: auth.userId,
      inviterName: auth.userName,
      inviterEmail: auth.email,
      inviterIsAdmin: auth.isAdmin,
      targetEmail: rawEmail,
    });

    if (!created.success) {
      return NextResponse.json(
        {
          error: created.error,
          canRequestAdminApproval: Boolean(created.canRequestAdminApproval),
        },
        { status: created.status }
      );
    }

    const [inviteMail, adminMail, latest] = await Promise.all([
      sendInviteEmail({
        to: created.entry.email,
        invitedByName: auth.userName,
        expiresInDays: auth.isAdmin ? null : INVITE_LIMITS.inviteTtlDays,
      }),
      getAdminNotificationEmails().then((adminRecipients) =>
        sendAdminInviteNotificationEmail({
          to: adminRecipients,
          inviterId: auth.userId,
          inviterName: auth.userName,
          inviterEmail: auth.email,
          inviteeEmail: created.entry.email,
          expiresAt: created.entry.expiresAt,
          quota: created.quota,
        })
      ),
      getUserInvitesAndQuota(auth.userId, auth.isAdmin),
    ]);

    return NextResponse.json(
      {
        invite: created.entry,
        inviteLink: inviteMail.inviteLink,
        emailSent: inviteMail.sent,
        emailError: inviteMail.error,
        adminNotified: adminMail.sent,
        invites: latest.invites,
        quota: latest.quota,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (err) {
    console.error("User invite error:", err);
    return NextResponse.json({ error: "Serverfehler beim Versenden der Einladung." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireUserSession();
  if (!auth) {
    return NextResponse.json({ error: "Bitte logge dich ein." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  if (!id.trim()) {
    return NextResponse.json({ error: "Einladungs-ID fehlt." }, { status: 400 });
  }

  try {
    const res = await revokeUserInvite(auth.userId, id);
    if (!res.success) {
      return NextResponse.json({ error: res.error || "Konnte nicht widerrufen werden." }, { status: res.status || 400 });
    }

    const latest = await getUserInvitesAndQuota(auth.userId, auth.isAdmin);
    return NextResponse.json(latest, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("Invite revoke error:", err);
    return NextResponse.json({ error: "Serverfehler beim Zurückziehen." }, { status: 500 });
  }
}
