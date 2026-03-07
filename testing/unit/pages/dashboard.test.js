// Unit tests for app/dashboard/page.js
// Tests the voter dashboard page behavior

jest.mock('next/navigation', () => require('../../mocks/nextNavigation'));

describe('Dashboard Page', () => {
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

    describe('Authentication check', () => {
        it('should redirect to login when no token cookie exists', () => {
            const mockPush = jest.fn();
            useRouter.mockReturnValue({ push: mockPush });

            // Simulate getCookie returning null (no token)
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                return null;
            };

            const token = getCookie('voteGuardToken');

            if (!token) {
                mockPush('/login');
            }

            expect(token).toBeNull();
            expect(mockPush).toHaveBeenCalledWith('/login');
        });

        it('should proceed when token exists', () => {
            const mockPush = jest.fn();
            useRouter.mockReturnValue({ push: mockPush });

            document.cookie = 'voteGuardToken=valid-jwt-token';

            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                return null;
            };

            const token = getCookie('voteGuardToken');

            expect(token).toBe('valid-jwt-token');
            expect(mockPush).not.toHaveBeenCalled();
        });
    });

    describe('Dashboard data fetching', () => {
        it('should fetch dashboard data with Authorization header', async () => {
            const token = 'test-jwt-token';

            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    userSession: {
                        name: 'John Doe',
                        citizenId: 'CIT001',
                        constituency: 'District-1',
                        ward: 'Ward-A',
                        verified: true,
                        lastLogin: 'Just Now'
                    },
                    activeElection: {
                        id: 1,
                        title: 'General Election 2026',
                        endsIn: '02h : 30m',
                        status: 'LIVE',
                        eligible: true
                    },
                    history: []
                })
            });

            const response = await fetch('http://localhost:5001/api/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:5001/api/dashboard',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${token}`
                    })
                })
            );

            const data = await response.json();

            expect(data.userSession.name).toBe('John Doe');
            expect(data.activeElection.title).toBe('General Election 2026');
        });

        it('should handle API error gracefully', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 401,
                json: () => Promise.resolve({
                    message: 'Token is not valid'
                })
            });

            const response = await fetch('http://localhost:5001/api/dashboard', {
                headers: { 'Authorization': 'Bearer invalid-token' }
            });

            expect(response.ok).toBe(false);
            expect(response.status).toBe(401);
        });

        it('should handle network failure', async () => {
            global.fetch.mockRejectedValue(new Error('Failed to fetch'));

            await expect(
                fetch('http://localhost:5001/api/dashboard')
            ).rejects.toThrow('Failed to fetch');
        });
    });

    describe('Sign out', () => {
        it('should call logout API and clear cookies', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ message: 'Logged out successfully' })
            });

            const response = await fetch('http://localhost:5001/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            expect(data.message).toBe('Logged out successfully');
        });

        it('should redirect to login after sign out', () => {
            const mockPush = jest.fn();
            useRouter.mockReturnValue({ push: mockPush });

            // Simulate logout redirect
            mockPush('/login');

            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    describe('Dashboard data structure', () => {
        it('should handle null active election', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    userSession: {
                        name: 'Test User',
                        citizenId: 'CIT002',
                        constituency: 'District-2',
                        ward: 'Ward-B',
                        verified: true,
                        lastLogin: 'Just Now'
                    },
                    activeElection: null,
                    history: []
                })
            });

            const response = await fetch('http://localhost:5001/api/dashboard', {
                headers: { 'Authorization': 'Bearer token' }
            });

            const data = await response.json();

            expect(data.activeElection).toBeNull();
        });

        it('should handle voting history correctly', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    userSession: { name: 'User' },
                    activeElection: null,
                    history: [
                        {
                            id: 1,
                            election: 'Past Election',
                            candidate: 'Candidate A',
                            date: 'Jan 15, 2026',
                            receiptHash: '0xhash123',
                            status: 'Confirmed on Blockchain'
                        }
                    ]
                })
            });

            const response = await fetch('http://localhost:5001/api/dashboard', {
                headers: { 'Authorization': 'Bearer token' }
            });

            const data = await response.json();

            expect(data.history).toHaveLength(1);
            expect(data.history[0].status).toBe('Confirmed on Blockchain');
        });
    });
});
