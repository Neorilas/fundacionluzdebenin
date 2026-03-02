import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const lang = request.nextUrl.pathname.startsWith('/fr') ? 'fr' : 'es';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-lang', lang);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next|api|uploads|admin|.*\\..*).*)'],
};
