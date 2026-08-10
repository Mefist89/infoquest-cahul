import createMiddleware from 'next-intl/middleware';
import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {routing} from './i18n/routing';
import {updateSession} from './lib/supabase/proxy';

const handleI18nRouting = createMiddleware(routing);

function requestLocale(request: NextRequest) {
  return request.nextUrl.pathname.startsWith('/ro') ? 'ro' : 'ru';
}

function requestIp(request: NextRequest) {
  const forwarded = request.headers.get('x-vercel-forwarded-for')
    ?? request.headers.get('x-forwarded-for')
    ?? request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim().toLowerCase() || null;
}

async function hashIp(ip: string | null) {
  const salt = process.env.BLOCKLIST_IP_SALT;
  if (!ip || !salt) return null;
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function copySessionCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

type AccessStatus = {
  is_blocked: boolean;
  block_source: string | null;
};

export default async function proxy(request: NextRequest) {
  const {response: authResponse, supabase} = await updateSession(request);
  const locale = requestLocale(request);
  const blockedPath = `/${locale}/blocked`;
  const isBlockedPage = request.nextUrl.pathname === blockedPath;
  const ipHash = await hashIp(requestIp(request));
  const {data, error: accessError} = await supabase
    .rpc('check_access_status', {p_ip_hash: ipHash})
    .maybeSingle();
  const access = data as AccessStatus | null;

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
