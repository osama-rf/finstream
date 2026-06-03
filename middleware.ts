import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function hasSupabaseAuthCookie(req: NextRequest) {
  return req.cookies.getAll().some((cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token'));
}

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({ request: { headers: req.headers } });

  if (req.nextUrl.pathname.startsWith('/api/')) return response;

  const path = req.nextUrl.pathname;
  const hasAuthCookie = hasSupabaseAuthCookie(req);

  const protectedRoutes = ['/dashboard', '/bank', '/accounting', '/statements', '/approvals', '/filings', '/company', '/settings'];
  const isProtectedRoute = protectedRoutes.some((r) => path.startsWith(r));

  if (isProtectedRoute && !hasAuthCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  if (!hasAuthCookie) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: req.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if ((path.startsWith('/login') || path.startsWith('/register')) && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isProtectedRoute && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/bank/:path*',
    '/accounting/:path*',
    '/statements/:path*',
    '/approvals/:path*',
    '/filings/:path*',
    '/company/:path*',
    '/settings/:path*',
    '/login',
    '/register',
  ],
};
