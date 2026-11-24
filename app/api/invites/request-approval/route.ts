import { NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth";
import {
  createInviteApprovalRequest,
  getAdminNotificationEmails,
  getInviteApprovalRequests,
} from "@/lib/store";
import { sendAdminInviteApprovalRequestEmail } from "@/lib/email";

export async function POST(req: Request) {
  const auth = await requireUserSession();
  if (!auth) {
    return NextResponse.json({ error: "Bitte logge dich ein." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";

    const created = await createInviteApprovalRequest({
      requesterId: auth.userId,
      requesterName: auth.userName,
      requesterEmail: auth.email,
      requesterIsAdmin: auth.isAdmin,
      targetEmail: rawEmail,
    });

    if (!created.success) {
      return NextResponse.json({ error: created.error }, { status: created.status });
    }

    const [adminMail, approvalRequests] = await Promise.all([
      getAdminNotificationEmails().then((adminRecipients) =>
        sendAdminInviteApprovalRequestEmail({
          to: adminRecipients,
          requesterId: auth.userId,
          requesterName: auth.userName,
          requesterEmail: auth.email,
          targetEmail: created.request.targetEmail,
          blockedReason: created.request.blockedReason,
        })
      ),
      getInviteApprovalRequests({ requesterUserId: auth.userId }),
    ]);

    return NextResponse.json(
      {
        request: created.request,
        adminNotified: adminMail.sent,
        approvalRequests,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (err) {
    console.error("Invite approval request error:", err);
    return NextResponse.json(
      { error: "Serverfehler beim Senden der Freigabe-Anfrage." },
      { status: 500 }
    );
  }
}
