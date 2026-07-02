import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  return NextResponse.next({ request: { headers: req.headers } });
}

export const config = {
  matcher: [],
};
