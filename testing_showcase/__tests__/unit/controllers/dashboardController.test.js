// Unit tests for dashboardController.js
const dashboardController = require('../../../src/controllers/dashboardController');
const prisma = require('../../../src/config/db');

jest.mock('../../../src/config/db');

describe('DashboardController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { user_id: 1 },
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('getDashboardData', () => {
        it('should return complete dashboard data', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    fullName: 'John Doe',
                    citizenId: 'CIT001',
                    constituency: 'District-1',
                    ward: 'Ward-A',
                    isRegistered: true
                }
            };

            const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
            const mockActiveElection = {
                id: 1,
                title: 'General Election 2026',
                description: 'National election',
                status: 'LIVE',
                endTime: futureDate
            };

            const mockVotes = [
                {
                    id: 1,
                    timestamp: new Date('2025-12-01'),
                    receiptHash: '0xhash1',
                    election: { title: 'Previous Election' },
                    candidate: { name: 'Candidate A' }
                },
                {
                    id: 2,
                    timestamp: new Date('2024-06-15'),
                    receiptHash: '0xhash2',
                    election: { title: 'Old Election' },
                    candidate: { name: 'Candidate B' }
                }
            ];

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(mockActiveElection);
            prisma.vote.findMany.mockResolvedValue(mockVotes);
            prisma.auditLog.create.mockResolvedValue({});

            await dashboardController.getDashboardData(req, res);

            expect(res.json).toHaveBeenCalledWith({
                userSession: {
                    name: 'John Doe',
                    citizenId: 'CIT001',
                    constituency: 'District-1',
                    ward: 'Ward-A',
                    verified: true,
                    lastLogin: "Just Now"
                },
                activeElection: expect.objectContaining({
                    id: 1,
                    title: 'General Election 2026',
                    status: 'LIVE',
                    eligible: true,
                    endsIn: expect.stringMatching(/\d{2}h : \d{2}m/)
                }),
                history: expect.arrayContaining([
                    expect.objectContaining({
                        election: 'Previous Election',
                        candidate: 'Candidate A',
                        status: "Confirmed"
                    })
                ])
            });
        });

        it('should return null for activeElection when none exists', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    fullName: 'John Doe',
                    citizenId: 'CIT001',
                    constituency: 'District-1',
                    ward: 'Ward-A',
                    isRegistered: true
                }
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(null);
            prisma.vote.findMany.mockResolvedValue([]);
            prisma.auditLog.create.mockResolvedValue({});

            await dashboardController.getDashboardData(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.activeElection).toBeNull();
        });

        it('should exclude elections where user has already voted', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    fullName: 'Test User',
                    citizenId: 'CIT002',
                    constituency: 'District-2',
                    ward: 'Ward-B',
                    isRegistered: true
                }
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(null);
            prisma.vote.findMany.mockResolvedValue([]);
            prisma.auditLog.create.mockResolvedValue({});

            await dashboardController.getDashboardData(req, res);

            expect(prisma.election.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        NOT: {
                            votes: {
                                some: { userId: 1 }
                            }
                        }
                    })
                })
            );
        });

        it('should format voting history correctly', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    fullName: 'User',
                    citizenId: 'CIT001',
                    constituency: 'District-1',
                    ward: 'Ward-A',
                    isRegistered: true
                }
            };

            const mockVotes = [
                {
                    id: 1,
                    timestamp: new Date('2026-01-15T10:30:00Z'),
                    receiptHash: '0xreceipt123',
                    election: { title: 'Test Election' },
                    candidate: { name: 'Test Candidate' }
                }
            ];

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(null);
            prisma.vote.findMany.mockResolvedValue(mockVotes);
            prisma.auditLog.create.mockResolvedValue({});

            await dashboardController.getDashboardData(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.history[0]).toMatchObject({
                id: 1,
                election: 'Test Election',
                candidate: 'Test Candidate',
                receiptHash: '0xreceipt123',
                status: "Confirmed",
                date: expect.any(String)
            });
        });

        it('should create audit log for dashboard view', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    fullName: 'User',
                    citizenId: 'CIT001',
                    constituency: 'District-1',
                    ward: 'Ward-A',
                    isRegistered: true
                }
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(null);
            prisma.vote.findMany.mockResolvedValue([]);
            prisma.auditLog.create.mockResolvedValue({});

            await dashboardController.getDashboardData(req, res);

            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    action: "VIEWED_DASHBOARD",
                    ipAddress: '127.0.0.1'
                }
            });
        });

        it('should return 404 when user not found', async () => {
            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(null);

            await dashboardController.getDashboardData(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found"
            });
        });

        it('should handle database errors gracefully', async () => {
            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

            await dashboardController.getDashboardData(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Server Error"
            });
        });

        it('should calculate time remaining correctly for active election', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    fullName: 'User',
                    citizenId: 'CIT001',
                    constituency: 'District-1',
                    ward: 'Ward-A',
                    isRegistered: true
                }
            };

            const futureTime = new Date(Date.now() + 3 * 60 * 60 * 1000 + 30 * 60 * 1000);
            const mockActiveElection = {
                id: 1,
                title: 'Active Election',
                description: 'Desc',
                status: 'LIVE',
                endTime: futureTime
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(mockActiveElection);
            prisma.vote.findMany.mockResolvedValue([]);
            prisma.auditLog.create.mockResolvedValue({});

            await dashboardController.getDashboardData(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.activeElection.endsIn).toMatch(/03h : \d{2}m/);
        });

        it('should order voting history by most recent first', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    fullName: 'User',
                    citizenId: 'CIT001',
                    constituency: 'District-1',
                    ward: 'Ward-A',
                    isRegistered: true
                }
            };

            const mockVotes = [
                {
                    id: 3,
                    timestamp: new Date('2026-01-01'),
                    receiptHash: '0xhash3',
                    election: { title: 'Latest' },
                    candidate: { name: 'Candidate C' }
                },
                {
                    id: 1,
                    timestamp: new Date('2025-06-01'),
                    receiptHash: '0xhash1',
                    election: { title: 'Oldest' },
                    candidate: { name: 'Candidate A' }
                }
            ];

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(null);
            prisma.vote.findMany.mockResolvedValue(mockVotes);
            prisma.auditLog.create.mockResolvedValue({});

            await dashboardController.getDashboardData(req, res);

            expect(prisma.vote.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { timestamp: 'desc' }
                })
            );

            const response = res.json.mock.calls[0][0];
            expect(response.history[0].election).toBe('Latest');
        });
    });
});
