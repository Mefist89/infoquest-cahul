import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/ru/profile";
  const next = /^\/(ru|ro)(?:\/|#|$)/.test(requestedNext) ? requestedNext : "/ru/profile";
  const locale = next.startsWith("/ro") ? "ro" : "ru";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
        const destinationOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;
        return NextResponse.redirect(`${destinationOrigin}${next}`);
      }
    } catch {
      // The login page presents a localized, user-friendly retry message.
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=oauth`);
}
