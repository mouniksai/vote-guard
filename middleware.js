import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Protect dashboard routes - redirect to login if not authenticated
    if (pathname.startsWith('/dashboard')) {
        // In a real app, check for auth token/session here
        // For now, just allow access (you can implement proper auth later)
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
