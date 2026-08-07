import createMiddleware from 'next-intl/middleware';
import type {NextRequest} from 'next/server';
import {routing} from './i18n/routing';
import {updateSession} from './lib/supabase/proxy';

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const authResponse = await updateSession(request);
  const response = handleI18nRouting(request);

  authResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = authResponse.headers.get(header);
    if (value) response.headers.set(header, value);
  }

  return response;
}

export const config = {
  matcher: ['/', '/(ru|ro)/:path*']
};
