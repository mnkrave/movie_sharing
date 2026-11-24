import crypto from "crypto";
import { Resend } from "resend";
import type { DeStreamingProvider } from "./tmdb";
import type { UserInviteQuota } from "./store";

export interface WatchlistDigestEmailItem {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  providers: DeStreamingProvider[];
}

export function getBaseUrl(): string {
  const raw =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return raw.replace(/\/+$/, "");
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "CineCircle <noreply@l-reinle.de>";
}

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? new Resend(key) : null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHeaderText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

function getSafePosterUrl(posterPath?: string | null): string | null {
  if (!posterPath || !/^\/[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(posterPath)) {
    return null;
  }
  return `https://image.tmdb.org/t/p/w342${posterPath}`;
}

function getSigningSecret(): string | null {
  return (
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== "production" ? "dev-local-unsubscribe-secret" : null)
  );
}

export function createUnsubscribeToken(userId: string): string | null {
  const secret = getSigningSecret();
  if (!secret || !userId) return null;
  const payload = Buffer.from(userId, "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const secret = getSigningSecret();
  if (!secret || !token || !token.includes(".")) return null;
  const [payload, providedSig] = token.split(".", 2);
  if (!payload || !providedSig) return null;

  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const userId = Buffer.from(payload, "base64url").toString("utf8");
  return userId || null;
}

function wrapEmailLayout(params: {
  eyebrow: string;
  title: string;
  contentHtml: string;
  maxWidth?: number;
}): string {
  const maxWidth = params.maxWidth ?? 580;
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #060913; padding: 28px 14px; color: #f8fafc;">
      <div style="max-width: ${maxWidth}px; margin: 0 auto; background: #0b1120; border: 1px solid #1e293b; border-radius: 22px; padding: 26px;">
        <div style="font-size: 12px; font-weight: 800; color: #f59e0b; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;">
          ${params.eyebrow}
        </div>
        <h1 style="margin: 0 0 12px 0; font-size: 24px; color: #ffffff;">
          ${params.title}
        </h1>
        ${params.contentHtml}
      </div>
    </div>
  `;
}

async function sendResendHtmlEmail(params: {
  to: string;
  subject: string;
  html: string;
  context: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY fehlt" };
  }

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error(`Resend ${params.context} error:`, error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err: any) {
    console.error(`Resend ${params.context} exception:`, err);
    return { sent: false, error: err?.message || "Unbekannter Fehler" };
  }
}

export async function sendInviteEmail(params: {
  to: string;
  invitedByName?: string;
  expiresInDays?: number | null;
}): Promise<{ sent: boolean; inviteLink: string; error?: string }> {
  const baseUrl = getBaseUrl();
  const emailLower = params.to.toLowerCase().trim();
  const inviteLink = `${baseUrl}/register?email=${encodeURIComponent(emailLower)}`;
  const loginLink = `${baseUrl}/login`;
  const rawInviterName = sanitizeHeaderText(params.invitedByName || "Lukas").slice(0, 80);
  const inviter = escapeHtml(rawInviterName);
  const expiryNotice =
    typeof params.expiresInDays === "number" && params.expiresInDays > 0
      ? `<p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">
           Hinweis: Diese Einladung ist <strong style="color:#f8fafc;">${params.expiresInDays} Tage</strong> gültig.
         </p>`
      : "";

  const html = wrapEmailLayout({
    eyebrow: "CineCircle Einladung",
    title: "🎬 Willkommen bei CineCircle!",
    maxWidth: 540,
    contentHtml: `
      <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
        ${inviter} hat deine E-Mail-Adresse (<strong style="color:#fff;">${escapeHtml(emailLower)}</strong>) freigeschaltet.
        Teile Filme &amp; Serien mit deinen Freunden, führe deine Watchlist und sieh sofort, auf welchem Abo oder VPN-Land ein Titel läuft.
      </p>
      <div style="margin: 24px 0;">
        <a href="${inviteLink}" style="display: inline-block; padding: 13px 24px; background: #f59e0b; color: #090d16; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 12px; margin-right: 10px; margin-bottom: 10px;">
          Jetzt Account erstellen
        </a>
        <a href="${loginLink}" style="display: inline-block; padding: 12px 20px; background: #1e293b; color: #f8fafc; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 12px; border: 1px solid #334155;">
          Direkt mit Google anmelden
        </a>
      </div>
      ${expiryNotice}
      <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b;">
        Falls der Button nicht funktioniert, öffne diesen Link: <a href="${inviteLink}" style="color: #f59e0b;">${escapeHtml(inviteLink)}</a>
      </p>
    `,
  });

  const res = await sendResendHtmlEmail({
    to: emailLower,
    subject: `🎬 ${rawInviterName} hat dich zu CineCircle eingeladen!`,
    html,
    context: "invite",
  });
  return { ...res, inviteLink };
}

async function sendAdminAlertEmail(params: {
  to: string[];
  excludeEmail: string;
  eyebrow: string;
  title: string;
  introHtml: string;
  rowsHtml: string;
  outroHtml?: string;
  adminHref: string;
  adminCtaLabel: string;
  profileHref: string;
  profileCtaLabel: string;
  subject: string;
  context: string;
}): Promise<{ sent: boolean; error?: string }> {
  const excludedLower = params.excludeEmail.toLowerCase().trim();
  const recipients = Array.from(
    new Set(
      params.to
        .map((e) => e.toLowerCase().trim())
        .filter((e) => Boolean(e) && e !== excludedLower)
    )
  );
  if (recipients.length === 0) {
    return { sent: false };
  }

  const baseUrl = getBaseUrl();
  const adminUrl = `${baseUrl}${params.adminHref}`;
  const profileUrl = `${baseUrl}${params.profileHref}`;

  const html = wrapEmailLayout({
    eyebrow: params.eyebrow,
    title: params.title,
    maxWidth: 560,
    contentHtml: `
      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        ${params.introHtml}
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #131c31; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 18px;">
        <tr>
          <td style="padding: 14px 16px; font-size: 13px; color: #cbd5e1; line-height: 1.7;">
            ${params.rowsHtml}
          </td>
        </tr>
      </table>
      ${params.outroHtml ?? ""}
      <div style="margin: 20px 0 6px 0;">
        <a href="${adminUrl}" style="display: inline-block; padding: 12px 22px; background: #f59e0b; color: #090d16; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 12px; margin-right: 10px; margin-bottom: 10px;">
          ${params.adminCtaLabel}
        </a>
        <a href="${profileUrl}" style="display: inline-block; padding: 11px 18px; background: #1e293b; color: #f8fafc; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 12px; border: 1px solid #334155;">
          ${params.profileCtaLabel}
        </a>
      </div>
    `,
  });

  const results = await Promise.all(
    recipients.map((recipient) =>
      sendResendHtmlEmail({
        to: recipient,
        subject: params.subject,
        html,
        context: params.context,
      })
    )
  );
  return {
    sent: results.some((r) => r.sent),
    error: results.find((r) => !r.sent)?.error,
  };
}

export async function sendAdminInviteNotificationEmail(params: {
  to: string[];
  inviterId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  expiresAt?: string | null;
  quota: UserInviteQuota;
}): Promise<{ sent: boolean; error?: string }> {
  const inviterEmailLower = params.inviterEmail.toLowerCase().trim();
  const safeInviterName = sanitizeHeaderText(params.inviterName || "Ein Nutzer").slice(0, 80);
  const safeInvitee = sanitizeHeaderText(params.inviteeEmail.toLowerCase().trim());
  const timestamp = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const expiryText = params.expiresAt
    ? new Date(params.expiresAt).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })
    : "Kein Ablaufdatum";

  return sendAdminAlertEmail({
    to: params.to,
    excludeEmail: inviterEmailLower,
    eyebrow: "CineCircle • Admin-Sicherheitshinweis",
    title: "🔔 Neue Einladung durch einen Nutzer",
    introHtml: `<strong style="color:#fff;">${escapeHtml(safeInviterName)}</strong> hat soeben eine neue E-Mail-Adresse zu CineCircle eingeladen und auf die Whitelist gesetzt.`,
    rowsHtml: `
      <div><strong style="color:#94a3b8;">Eingeladen von:</strong> <span style="color:#fff;">${escapeHtml(safeInviterName)}</span> (${escapeHtml(inviterEmailLower)})</div>
      <div><strong style="color:#94a3b8;">Eingeladene E-Mail:</strong> <span style="color:#f59e0b; font-weight:700;">${escapeHtml(safeInvitee)}</span></div>
      <div><strong style="color:#94a3b8;">Zeitpunkt:</strong> ${escapeHtml(timestamp)}</div>
      <div><strong style="color:#94a3b8;">Gültig bis:</strong> ${escapeHtml(expiryText)}</div>
      <div><strong style="color:#94a3b8;">Kontingent des Nutzers:</strong> ${params.quota.used24h}/${params.quota.limit24h} (24h) · ${params.quota.openPending}/${params.quota.maxOpenPending} offen · ${params.quota.used30d}/${params.quota.limit30d} (30 Tage)</div>
    `,
    outroHtml: `<p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
        Falls dir diese Einladung verdächtig vorkommt, kannst du die E-Mail im Admin-Dashboard sofort widerrufen oder den Nutzer sperren (dadurch werden auch alle offenen Einladungen dieses Nutzers automatisch widerrufen).
      </p>`,
    adminHref: "/admin",
    adminCtaLabel: "Admin-Dashboard öffnen",
    profileHref: `/admin/users/${encodeURIComponent(params.inviterId)}`,
    profileCtaLabel: `Profil von ${escapeHtml(safeInviterName)} prüfen`,
    subject: `🔔 CineCircle: ${safeInviterName} hat ${safeInvitee} eingeladen`,
    context: "admin-invite-alert",
  });
}

export async function sendAdminInviteApprovalRequestEmail(params: {
  to: string[];
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  targetEmail: string;
  blockedReason: string;
}): Promise<{ sent: boolean; error?: string }> {
  const requesterEmailLower = params.requesterEmail.toLowerCase().trim();
  const safeName = sanitizeHeaderText(params.requesterName || "Ein Nutzer").slice(0, 80);
  const safeTarget = sanitizeHeaderText(params.targetEmail.toLowerCase().trim());
  const safeReason = sanitizeHeaderText(params.blockedReason).slice(0, 200);

  return sendAdminAlertEmail({
    to: params.to,
    excludeEmail: requesterEmailLower,
    eyebrow: "CineCircle • Einladungs-Freigabe angefragt",
    title: "🛡️ Bitte um Ausnahme-Freigabe",
    introHtml: `<strong style="color:#fff;">${escapeHtml(safeName)}</strong> wollte eine Einladung versenden, wurde aber von einem Sicherheits-Limit gestoppt und bittet dich um manuelle Freigabe.`,
    rowsHtml: `
      <div><strong style="color:#94a3b8;">Angefragt von:</strong> <span style="color:#fff;">${escapeHtml(safeName)}</span> (${escapeHtml(requesterEmailLower)})</div>
      <div><strong style="color:#94a3b8;">Gewünschte E-Mail:</strong> <span style="color:#f59e0b; font-weight:700;">${escapeHtml(safeTarget)}</span></div>
      <div><strong style="color:#94a3b8;">Blockiert wegen:</strong> <span style="color:#fb7185; font-weight:700;">${escapeHtml(safeReason)}</span></div>
    `,
    adminHref: "/admin#invite-approvals",
    adminCtaLabel: "Im Admin-Dashboard freigeben / ablehnen",
    profileHref: `/admin/users/${encodeURIComponent(params.requesterId)}`,
    profileCtaLabel: "Profil prüfen",
    subject: `🛡️ CineCircle: ${safeName} bittet um Einladungs-Freigabe für ${safeTarget}`,
    context: "admin-invite-approval-request",
  });
}

export async function sendWatchlistDigestEmail(params: {
  to: string;
  userName: string;
  userId: string;
  items: WatchlistDigestEmailItem[];
  isTest?: boolean;
}): Promise<{ sent: boolean; error?: string }> {
  if (params.items.length === 0) return { sent: false, error: "Keine Einträge" };

  const baseUrl = getBaseUrl();
  const firstName = escapeHtml((params.userName || "Film-Fan").trim().split(/\s+/)[0]);
  const watchlistUrl = `${baseUrl}/my-list`;
  const unsubToken = createUnsubscribeToken(params.userId);
  const unsubUrl = unsubToken
    ? `${baseUrl}/api/notifications/unsubscribe?token=${encodeURIComponent(unsubToken)}`
    : null;

  const subjectPrefix = params.isTest ? "[TEST] " : "";
  const subject =
    params.items.length === 1
      ? `${subjectPrefix}🎬 Neu für deine Watchlist: ${params.items[0].title} jetzt im Stream!`
      : `${subjectPrefix}🎬 Neu für deine Watchlist: ${params.items.length} Titel jetzt in deinen Abos!`;

  const itemsHtml = params.items
    .map((item) => {
      const posterUrl = getSafePosterUrl(item.posterPath);
      const typeLabel = item.mediaType === "tv" ? "Serie" : "Film";
      const yearText = item.releaseYear ? ` (${escapeHtml(item.releaseYear)})` : "";
      const providerBadges = item.providers
        .map((p) => {
          const bg = /^#[0-9a-fA-F]{6}$/.test(p.color) ? p.color : "#f59e0b";
          return `<span style="display: inline-block; margin: 4px 6px 0 0; padding: 5px 11px; border-radius: 999px; background: ${bg}; color: #ffffff; font-size: 12px; font-weight: 700;">${escapeHtml(p.displayName)}</span>`;
        })
        .join("");

      const posterCell = posterUrl
        ? `<td width="92" valign="top" style="padding-right: 16px;">
             <img src="${posterUrl}" alt="${escapeHtml(item.title)}" width="84" style="display: block; width: 84px; height: auto; border-radius: 10px; border: 1px solid #334155;" />
           </td>`
        : "";

      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #131c31; border: 1px solid #1e293b; border-radius: 16px; margin-bottom: 14px;">
          <tr>
            <td style="padding: 14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${posterCell}
                  <td valign="top">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #f59e0b; margin-bottom: 4px;">
                      ${typeLabel} • Neu im Stream
                    </div>
                    <div style="font-size: 17px; font-weight: 800; color: #ffffff; line-height: 1.3; margin-bottom: 8px;">
                      ${escapeHtml(item.title)}${yearText}
                    </div>
                    <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;">
                      Jetzt verfügbar in deinen Abos:
                    </div>
                    <div>${providerBadges}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    })
    .join("");

  const introText =
    params.items.length === 1
      ? `Achtung – ein Titel auf deiner Watchlist war bisher bei keinem Anbieter verfügbar und ist jetzt neu in deinem Abo gestartet:`
      : `Achtung – ${params.items.length} Titel auf deiner Watchlist waren bisher bei keinem Anbieter verfügbar und sind jetzt neu in deinen Abos gestartet:`;

  const unsubHtml = unsubUrl
    ? `<p style="margin: 18px 0 0 0; font-size: 12px; color: #64748b; text-align: center;">
         Du möchtest keine Watchlist-Benachrichtigungen mehr erhalten?
         <a href="${unsubUrl}" style="color: #94a3b8; text-decoration: underline;">Hier mit 1 Klick abbestellen</a>
       </p>`
    : "";

  const html = wrapEmailLayout({
    eyebrow: "CineCircle • Watchlist-Alarm",
    title: `Hallo ${firstName}, neu für deine Watchlist! 🍿`,
    contentHtml: `
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        ${introText}
      </p>
      ${itemsHtml}
      <div style="text-align: center; margin-top: 22px;">
        <a href="${watchlistUrl}" style="display: inline-block; padding: 13px 26px; background: #f59e0b; color: #090d16; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 12px;">
          Zur Watchlist in CineCircle
        </a>
      </div>
      ${unsubHtml}
    `,
  });

  return sendResendHtmlEmail({
    to: params.to,
    subject,
    html,
    context: "digest",
  });
}
