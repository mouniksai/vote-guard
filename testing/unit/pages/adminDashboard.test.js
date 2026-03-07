// Unit tests for app/admin/dashboard/page.js
// Tests the admin dashboard page behavior

jest.mock('next/navigation', () => require('../../mocks/nextNavigation'));

describe('Admin Dashboard Page', () => {
    let useRouter;
    const API_BASE_URL = 'http://localhost:5001';

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter = require('next/navigation').useRouter;

        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: ''
        });

        global.fetch = jest.fn();
    });

    describe('Authentication and Authorization', () => {
        it('should redirect to login when no token exists', () => {
            const mockPush = jest.fn();
            useRouter.mockReturnValue({ push: mockPush });

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

        it('should validate admin token with Authorization header', async () => {
            const token = 'admin-jwt-token';

            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    valid: true,
                    user: {
                        user_id: 1,
                        email: 'admin@voteguard.com',
                        role: 'admin',
                        full_name: 'Admin User',
                        constituency: 'District-1'
                    }
                })
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/validate-token`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            expect(global.fetch).toHaveBeenCalledWith(
                `${API_BASE_URL}/api/admin/validate-token`,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${token}`
                    })
                })
            );

            const data = await response.json();
            expect(data.valid).toBe(true);
            expect(data.user.role).toBe('admin');
        });

        it('should show access denied when user is not admin', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                json: () => Promise.resolve({
                    message: 'Access Forbidden: Insufficient Permissions'
                })
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/validate-token`, {
                headers: {
                    'Authorization': 'Bearer voter-token',
                    'Content-Type': 'application/json'
                }
            });

            expect(response.ok).toBe(false);
            expect(response.status).toBe(403);
        });
    });

    describe('System Statistics', () => {
        it('should fetch system stats', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    totalVoters: 150,
                    totalVotes: 120,
                    activeElection: 'General Election 2026',
                    status: 'System Operational'
                })
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                headers: { 'Authorization': 'Bearer admin-token' }
            });

            const data = await response.json();

            expect(data.totalVoters).toBe(150);
            expect(data.totalVotes).toBe(120);
            expect(data.activeElection).toBe('General Election 2026');
        });
    });

    describe('Create Election', () => {
        it('should create election with required fields', async () => {
            const electionData = {
                title: 'New Election 2026',
                description: 'Annual election',
                constituency: 'District-1',
                startTime: '2026-03-01T00:00:00Z',
                endTime: '2026-03-01T23:59:59Z'
            };

            global.fetch.mockResolvedValue({
                ok: true,
                status: 201,
                json: () => Promise.resolve({
                    message: 'Election Created',
                    electionId: 1
                })
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/create-election`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer admin-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(electionData)
            });

            const data = await response.json();

            expect(response.ok).toBe(true);
            expect(data.message).toBe('Election Created');
            expect(data.electionId).toBe(1);
        });

        it('should handle election creation failure', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ message: 'Server Error' })
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/create-election`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer admin-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'Test' })
            });

            expect(response.ok).toBe(false);
        });
    });

    describe('Add Candidate', () => {
        it('should add candidate to election', async () => {
            const candidateData = {
                electionId: 1,
                name: 'John Doe',
                party: 'Party X',
                symbol: 'X',
                keyPoints: ['Education reform', 'Infrastructure'],
                age: '45',
                education: 'MBA',
                experience: '10 years'
            };

            global.fetch.mockResolvedValue({
                ok: true,
                status: 201,
                json: () => Promise.resolve({
                    message: 'Candidate Added',
                    candidate: { id: 1, ...candidateData }
                })
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/add-candidate`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer admin-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(candidateData)
            });

            const data = await response.json();

            expect(response.ok).toBe(true);
            expect(data.message).toBe('Candidate Added');
            expect(data.candidate.name).toBe('John Doe');
        });
    });

    describe('Fetch Elections', () => {
        it('should fetch all elections for admin', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([
                    { id: 1, title: 'Election 1', status: 'LIVE' },
                    { id: 2, title: 'Election 2', status: 'ENDED' },
                    { id: 3, title: 'Election 3', status: 'UPCOMING' }
                ])
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/elections`, {
                headers: { 'Authorization': 'Bearer admin-token' }
            });

            const data = await response.json();

            expect(data).toHaveLength(3);
            expect(data[0].status).toBe('LIVE');
        });

        it('should handle empty elections list', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([])
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/elections`, {
                headers: { 'Authorization': 'Bearer admin-token' }
            });

            const data = await response.json();

            expect(data).toEqual([]);
        });
    });
});
