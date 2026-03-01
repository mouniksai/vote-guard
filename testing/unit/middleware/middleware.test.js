// Unit tests for middleware.js (Next.js edge middleware)
// Tests route protection, authenticated redirects, and public route handling

import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
    NextResponse: {
        redirect: jest.fn((url) => ({
            type: 'redirect',
            url: url.toString()
        })),
        next: jest.fn(() => ({
            type: 'next'
        }))
    }
}));

// Import the middleware function
const { middleware, config } = require('../../../middleware');

describe('Next.js Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    // Helper to create a mock request
    const createRequest = (pathname, cookies = {}) => ({
        nextUrl: {
            pathname
        },
        url: `http://localhost:3000${pathname}`,
        cookies: {
            get: jest.fn((name) => {
                const val = cookies[name];
                return val ? { value: val } : undefined;
            })
        }
    });

    describe('Protected routes without token', () => {
        const protectedPaths = ['/dashboard', '/vote', '/verify', '/admin/dashboard'];

        protectedPaths.forEach(path => {
            it(`should redirect ${path} to login when no token`, () => {
                const request = createRequest(path);

                middleware(request);

                expect(NextResponse.redirect).toHaveBeenCalled();
                const redirectUrl = NextResponse.redirect.mock.calls[0][0];
                expect(redirectUrl.pathname).toBe('/login');
            });
        });
    });

    describe('Protected routes with token', () => {
        it('should allow access to /dashboard with valid token', () => {
            const request = createRequest('/dashboard', {
                voteGuardToken: 'valid-jwt-token'
            });

            const result = middleware(request);

            expect(NextResponse.redirect).not.toHaveBeenCalled();
            expect(NextResponse.next).toHaveBeenCalled();
        });

        it('should allow access to /admin/dashboard with valid token', () => {
            const request = createRequest('/admin/dashboard', {
                voteGuardToken: 'admin-jwt-token'
            });

            const result = middleware(request);

            expect(NextResponse.redirect).not.toHaveBeenCalled();
            expect(NextResponse.next).toHaveBeenCalled();
        });

        it('should allow access to /vote with valid token', () => {
            const request = createRequest('/vote', {
                voteGuardToken: 'voter-jwt-token'
            });

            const result = middleware(request);

            expect(NextResponse.next).toHaveBeenCalled();
        });
    });

    describe('Public routes', () => {
        it('should allow unauthenticated access to /login', () => {
            const request = createRequest('/login');

            middleware(request);

            expect(NextResponse.next).toHaveBeenCalled();
        });

        it('should allow unauthenticated access to /', () => {
            const request = createRequest('/');

            middleware(request);

            expect(NextResponse.next).toHaveBeenCalled();
        });
    });

    describe('Authenticated user redirect', () => {
        it('should redirect authenticated user from /login to /dashboard', () => {
            const request = createRequest('/login', {
                voteGuardToken: 'existing-token'
            });

            middleware(request);

            expect(NextResponse.redirect).toHaveBeenCalled();
            const redirectUrl = NextResponse.redirect.mock.calls[0][0];
            expect(redirectUrl.pathname).toBe('/dashboard');
        });
    });

    describe('Middleware config', () => {
        it('should have correct matcher paths', () => {
            expect(config.matcher).toBeDefined();
            expect(config.matcher).toContain('/dashboard/:path*');
            expect(config.matcher).toContain('/vote/:path*');
            expect(config.matcher).toContain('/verify/:path*');
            expect(config.matcher).toContain('/admin/:path*');
            expect(config.matcher).toContain('/login');
        });
    });
});
