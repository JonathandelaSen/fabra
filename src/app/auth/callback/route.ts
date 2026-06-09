import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

function resolveOrigin(request: NextRequest, requestUrl: URL) {
  // `request.url` can report the dev server bind address (e.g. 0.0.0.0) instead
  // of the host the browser actually used, which would build redirects pointing
  // at a different host where the session cookie does not exist. Prefer the
  // forwarded host headers, which reflect the real browser-facing origin.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");

  if (!host) {
    return requestUrl.origin;
  }

  const proto =
    request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.replace(":", "");

  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = resolveOrigin(request, requestUrl);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") || "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/";
  const isPasswordRecovery = next === "/account/update-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(
    new URL(
      isPasswordRecovery ? "/login?resetError=1" : "/login?oauthError=1",
      origin,
    ),
  );
}
