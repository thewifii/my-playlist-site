import { cookies } from "next/headers";
import { requireSession } from "@/lib/auth";
import { envVar } from "@/lib/cf";
import { callbackUrl, clearTokenCache, exchangeCode, REFRESH_TOKEN_SETTING, STATE_COOKIE } from "@/lib/dj/spotify";
import { dataSource, setSetting } from "@/lib/repo";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

function page(title: string, body: string, status = 200): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title>
<style>body{margin:0;background:#0a0a0a;color:#fff;font:16px/1.6 "Helvetica Neue",Helvetica,Arial,sans-serif}main{max-width:680px;margin:0 auto;padding:48px 20px}h1{font-size:32px;line-height:1.1;margin:0 0 12px}p{color:#b3a595}b,strong{color:#fff}code,textarea{font:14px ui-monospace,Menlo,Consolas,monospace}textarea{width:100%;box-sizing:border-box;background:#141210;color:#f5c518;border:1px solid rgba(221,195,162,.3);border-radius:6px;padding:12px;min-height:120px}a.btn{display:inline-block;margin-top:20px;background:#f5c518;color:#0a0a0a;font-weight:700;padding:12px 20px;border-radius:6px;text-decoration:none}code{background:#141210;padding:2px 6px;border-radius:4px;color:#ddc3a2}ol{color:#b3a595;padding-left:20px}</style></head><body><main>${body}</main></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "referrer-policy": "no-referrer" } });
}

/** Step 2 of the one-time setup: exchange the code, store the refresh token and show it to the admin. */
export async function GET(request: Request) {
  const auth = await requireSession("admin");
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value;
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");

  if (error) return page("Spotify authorization cancelled", `<h1>Authorization cancelled</h1><p>Spotify returned: <code>${esc(error)}</code>.</p><a class="btn" href="/api/spotify/login">Try again</a>`, 400);
  if (!code || !expected || url.searchParams.get("state") !== expected) {
    return page("Spotify authorization failed", `<h1>That link has expired</h1><p>The authorization request didn't match this browser session. Start again from the DJ builder.</p><a class="btn" href="/api/spotify/login">Start again</a>`, 400);
  }

  try {
    const tokens = await exchangeCode(code, callbackUrl(request));
    if (!tokens.refresh_token) throw new Error("Spotify didn't return a refresh token.");
    await setSetting(REFRESH_TOKEN_SETTING, tokens.refresh_token);
    clearTokenCache();
    const persisted = (await dataSource()) === "d1";
    const fromEnv = Boolean(envVar("SPOTIFY_REFRESH_TOKEN"));

    return page(
      "Spotify connected",
      `<h1>Spotify is connected.</h1>
<p>${persisted ? "The refresh token is saved in your D1 database, so the DJ builder can create playlists right away." : "<strong>D1 isn't set up yet</strong>, so the token is only held in memory and will be lost when the server restarts. Save it as a secret now."}</p>
<p>For a permanent setup, store it as the <code>SPOTIFY_REFRESH_TOKEN</code> secret${fromEnv ? " (one is already set; replace it with this new value)" : ""}:</p>
<textarea readonly onclick="this.select()" aria-label="Spotify refresh token">${esc(tokens.refresh_token)}</textarea>
<ol><li>Run <code>npx wrangler secret put SPOTIFY_REFRESH_TOKEN</code> and paste the value, or add it under Settings → Variables and Secrets in the Cloudflare dashboard.</li><li>For local development, add it to <code>.env.local</code>.</li><li>Treat it like a password. Anyone with it can edit your playlists.</li></ol>
<a class="btn" href="/dj-builder">Back to the DJ builder</a>`,
    );
  } catch (err) {
    return page(
      "Spotify authorization failed",
      `<h1>Couldn't finish connecting</h1><p>${esc(err instanceof Error ? err.message : "Unknown error.")}</p><p>Check that this exact redirect URI is listed in your Spotify app settings: <code>${esc(callbackUrl(request))}</code></p><a class="btn" href="/api/spotify/login">Try again</a>`,
      502,
    );
  }
}
