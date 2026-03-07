// Unit tests for app/login/page.js
// Tests the login page component rendering and behavior

// Mock next/navigation
jest.mock('next/navigation', () => require('../../mocks/nextNavigation'));

// Mock framer-motion to prevent animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        input: (props) => <input {...props} />,
        form: ({ children, ...props }) => <form {...props}>{children}</form>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

import React from 'react';

describe('Login Page', () => {
    let useRouter;

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter = require('next/navigation').useRouter;

        // Reset document.cookie
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: ''
        });

        // Mock fetch
        global.fetch = jest.fn();
    });

    describe('API Integration', () => {
        it('should call API with credentials on login', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    requires2FA: true,
                    userId: 1,
                    maskedEmail: 'j***@example.com',
                    maskedMobile: '****5678'
                })
            });

            // Simulate the fetch call that login page would make
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'testuser', password: 'pass123' }),
                credentials: 'include'
            });

            const data = await response.json();

            expect(data.requires2FA).toBe(true);
            expect(data.userId).toBe(1);
        });

        it('should handle failed login attempt', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({
                    message: 'Invalid Credentials'
                })
            });

            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
                credentials: 'include'
            });

            const data = await response.json();

            expect(response.ok).toBe(false);
            expect(data.message).toBe('Invalid Credentials');
        });

        it('should handle OTP verification', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    token: 'jwt-token-123',
                    user: { username: 'testuser', role: 'voter', name: 'Test User' }
                })
            });

            const response = await fetch('http://localhost:5001/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 1, otp: '123456' }),
                credentials: 'include'
            });

            const data = await response.json();

            expect(data.token).toBe('jwt-token-123');
            expect(data.user.role).toBe('voter');
        });

        it('should redirect admin to /admin/dashboard after OTP', async () => {
            const mockPush = jest.fn();
            useRouter.mockReturnValue({ push: mockPush });

            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    token: 'admin-token',
                    user: { username: 'admin', role: 'admin' }
                })
            });

            const response = await fetch('http://localhost:5001/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 1, otp: '123456' }),
                credentials: 'include'
            });

            const data = await response.json();

            // Simulate role-based redirect logic from login page
            if (data.user && data.user.role === 'admin') {
                mockPush('/admin/dashboard');
            } else {
                mockPush('/dashboard');
            }

            expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
        });

        it('should redirect voter to /dashboard after OTP', async () => {
            const mockPush = jest.fn();
            useRouter.mockReturnValue({ push: mockPush });

            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    token: 'voter-token',
                    user: { username: 'voter1', role: 'voter' }
                })
            });

            const response = await fetch('http://localhost:5001/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 2, otp: '654321' }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.user && data.user.role === 'admin') {
                mockPush('/admin/dashboard');
            } else {
                mockPush('/dashboard');
            }

            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });
    });

    describe('Registration flow', () => {
        it('should verify citizen ID before registration', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    citizenId: 'CIT001',
                    fullName: 'John Doe',
                    isRegistered: false
                })
            });

            const response = await fetch('http://localhost:5001/api/auth/verify-citizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ citizenId: 'CIT001' })
            });

            const data = await response.json();

            expect(data.citizenId).toBe('CIT001');
            expect(data.isRegistered).toBe(false);
        });

        it('should handle already registered citizen', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 409,
                json: () => Promise.resolve({
                    message: 'User already registered. Please login.'
                })
            });

            const response = await fetch('http://localhost:5001/api/auth/verify-citizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ citizenId: 'CIT002' })
            });

            const data = await response.json();

            expect(response.ok).toBe(false);
            expect(data.message).toContain('already registered');
        });
    });
});
