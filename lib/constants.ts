/** Shared client- and server-safe constants and validation helpers. */

export const SUPER_ADMIN_EMAIL = "lukasreinle0@gmail.com";

export function isValidEmailAddress(raw: string): boolean {
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254 || /[\s\r\n]/.test(email)) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64 || !domain || domain.length > 253) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
  const labels = domain.split(".");
  if (labels.length < 2 || labels[labels.length - 1].length < 2) return false;
  return labels.every((lbl) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(lbl));
}
