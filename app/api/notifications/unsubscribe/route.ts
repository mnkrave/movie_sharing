import { verifyUnsubscribeToken } from "@/lib/email";
import { updateUserWatchlistAlerts } from "@/lib/store";

function renderPage(title: string, message: string, success: boolean) {
  const badgeColor = success ? "#10b981" : "#f43f5e";
  return new Response(
    `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} – CineCircle</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#060913;color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px;">
  <div style="max-width:440px;width:100%;background:#0f1628;border:1px solid #1e293b;border-radius:20px;padding:28px;text-align:center;">
    <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:${badgeColor}20;color:${badgeColor};font-size:12px;font-weight:700;margin-bottom:14px;">
      CineCircle
    </div>
    <h1 style="margin:0 0 10px 0;font-size:22px;color:#fff;">${title}</h1>
    <p style="margin:0 0 22px 0;font-size:14px;line-height:1.6;color:#cbd5e1;">${message}</p>
    <a href="/my-list" style="display:inline-block;padding:11px 22px;border-radius:12px;background:#f59e0b;color:#090d16;font-weight:800;font-size:13px;text-decoration:none;">
      Zurück zu CineCircle
    </a>
  </div>
</body>
</html>`,
    {
      status: success ? 200 : 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";
  const userId = verifyUnsubscribeToken(token);

  if (!userId) {
    return renderPage(
      "Ungültiger Abmelde-Link",
      "Dieser Abmelde-Link ist ungültig oder abgelaufen. Du kannst deine Benachrichtigungen jederzeit in deinen Streaming-Abos in CineCircle ändern.",
      false
    );
  }

  await updateUserWatchlistAlerts(userId, false);
  return renderPage(
    "Watchlist-Alarm deaktiviert",
    "Du erhältst ab sofort keine E-Mail-Benachrichtigungen mehr für neue Streams auf deiner Watchlist. Du kannst sie jederzeit in den Streaming-Abo-Einstellungen wieder einschalten.",
    true
  );
}
