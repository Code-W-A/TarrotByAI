/**
 * Base URL for Next.js API (EXPO_PUBLIC_API_BASE_URL).
 *
 * React Native fetch often strips `Authorization` when following redirects.
 * This host uses Vercel 307 from apex to www — use `https://www.cristinazurba.com`
 * (we normalize apex → www automatically for `cristinazurba.com`).
 */

export function normalizeExpoApiBaseUrl(raw: string): string {
  let url = String(raw || "").trim().replace(/\/+$/, "");
  if (!url) return "";

  if (
    url.startsWith("http://") &&
    !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url)
  ) {
    url = `https://${url.slice("http://".length)}`;
  }

  try {
    const parsed = new URL(url);
    // Vercel returns 307 apex → www; React Native fetch can drop Authorization on redirect.
    if (parsed.hostname.toLowerCase() === "cristinazurba.com") {
      parsed.hostname = "www.cristinazurba.com";
      url = parsed.origin.replace(/\/+$/, "");
    }
  } catch {
    /* keep url */
  }

  return url.replace(/\/+$/, "");
}

export function requireExpoPublicApiBaseUrl(): string {
  const raw =
    typeof process !== "undefined" ? process.env.EXPO_PUBLIC_API_BASE_URL : undefined;
  const url = normalizeExpoApiBaseUrl(String(raw || ""));
  if (!url) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
  }
  return url;
}
