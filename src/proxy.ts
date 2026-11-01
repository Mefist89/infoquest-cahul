import createMiddleware from 'next-intl/middleware';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {routing} from './i18n/routing';
import {updateSession} from './lib/supabase/proxy';
import {requestIp, hashIp} from './lib/request-ip';

const handleI18nRouting = createMiddleware(routing);

function requestLocale(request: NextRequest) {
  return request.nextUrl.pathname.startsWith('/ru') ? 'ru' : 'ro';
}

function copySessionCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export default async function proxy(request: NextRequest) {
  const {response: authResponse, supabase} = await updateSession(request);
  const locale = requestLocale(request);
  const blockedPath = `/${locale}/blocked`;
  const isBlockedPage = request.nextUrl.pathname === blockedPath;
  const ipHash = await hashIp(requestIp(request.headers));
  const {data: access, error: accessError} = await supabase
    .rpc('check_access_status', {p_ip_hash: ipHash ?? undefined})
    .maybeSingle();

  if (accessError) {
    console.error('Access block check failed', accessError.message);
  } else if (access?.is_blocked && !isBlockedPage) {
    return copySessionCookies(authResponse, NextResponse.redirect(new URL(blockedPath, request.url)));
  } else if (!access?.is_blocked && isBlockedPage) {
    return copySessionCookies(authResponse, NextResponse.redirect(new URL(`/${locale}`, request.url)));
  }

  const response = handleI18nRouting(request);
  copySessionCookies(authResponse, response);
  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = authResponse.headers.get(header);
    if (value) response.headers.set(header, value);
  }

  return response;
}

export const config = {
  matcher: ['/', '/(ru|ro)/:path*']
};
