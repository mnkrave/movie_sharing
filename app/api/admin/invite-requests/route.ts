import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import {
  getInviteApprovalRequests,
  getWhitelist,
  reviewInviteApprovalRequest,
} from "@/lib/store";
import { sendInviteEmail } from "@/lib/email";

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const requests = await getInviteApprovalRequests();
    return NextResponse.json(requests, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("Admin invite requests fetch error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id : "";
    const action = body?.action === "APPROVE" || body?.action === "REJECT" ? body.action : null;

    if (!id || !action) {
      return NextResponse.json({ error: "Ungültige Anfrage-Parameter." }, { status: 400 });
    }

    const result = await reviewInviteApprovalRequest({
      requestId: id,
      adminUserId: admin.userId,
      action,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    let emailSent = false;
    let inviteLink: string | undefined;
    let emailError: string | undefined;

    if (action === "APPROVE" && result.entry) {
      const mail = await sendInviteEmail({
        to: result.entry.email,
        invitedByName: result.request.requesterName,
      });
      emailSent = mail.sent;
      inviteLink = mail.inviteLink;
      emailError = mail.error;
    }

    const [requests, whitelist] = await Promise.all([
      getInviteApprovalRequests(),
      getWhitelist(),
    ]);

    return NextResponse.json(
      {
        request: result.request,
        emailSent,
        inviteLink,
        emailError,
        requests,
        whitelist,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (err) {
    console.error("Admin invite request review error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
