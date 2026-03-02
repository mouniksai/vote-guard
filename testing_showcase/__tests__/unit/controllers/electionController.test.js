// Unit tests for electionController.js
const electionController = require('../../../src/controllers/electionController');
const prisma = require('../../../src/config/db');

jest.mock('../../../src/config/db');

describe('ElectionController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { user_id: 1 },
            params: {},
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        console.error.mockRestore();
        console.log.mockRestore();
    });

    describe('getElectionResults', () => {
        it('should return election results for user constituency', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    constituency: 'District-1'
                }
            };

            const mockElections = [
                {
                    id: 1,
                    title: 'Election 2026',
                    status: 'ENDED',
                    constituency: 'District-1',
                    endTime: new Date(),
                    candidates: [
                        { id: 1, name: 'Candidate A', party: 'Party X', voteCount: 100 },
                        { id: 2, name: 'Candidate B', party: 'Party Y', voteCount: 80 }
                    ],
                    votes: []
                }
            ];

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findMany.mockResolvedValue(mockElections);
            prisma.auditLog.create.mockResolvedValue({});

            await electionController.getElectionResults(req, res);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { userId: 1 },
                include: { citizen: true }
            });
            expect(prisma.election.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { constituency: 'District-1' }
                })
            );
            expect(res.json).toHaveBeenCalledWith({
                elections: expect.any(Array),
                summary: expect.objectContaining({
                    total: 1,
                    ended: 1,
                    live: 0,
                    upcoming: 0
                })
            });
        });

        it('should calculate total votes correctly', async () => {
            const mockUser = {
                userId: 1,
                citizen: { constituency: 'District-1' }
            };

            const mockElections = [
                {
                    id: 1,
                    title: 'Election',
                    status: 'ENDED',
                    constituency: 'District-1',
                    endTime: new Date(),
                    candidates: [
                        { id: 1, name: 'A', voteCount: 50 },
                        { id: 2, name: 'B', voteCount: 30 },
                        { id: 3, name: 'C', voteCount: 20 }
                    ],
                    votes: []
                }
            ];

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findMany.mockResolvedValue(mockElections);
            prisma.auditLog.create.mockResolvedValue({});

            await electionController.getElectionResults(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.elections[0].totalVotes).toBe(100);
        });

        it('should identify winner for ended elections', async () => {
            const mockUser = {
                userId: 1,
                citizen: { constituency: 'District-1' }
            };

            const mockElections = [
                {
                    id: 1,
                    title: 'Election',
                    status: 'ENDED',
                    constituency: 'District-1',
                    endTime: new Date(),
                    candidates: [
                        { id: 1, name: 'Winner', voteCount: 100 },
                        { id: 2, name: 'Runner-up', voteCount: 50 }
                    ],
                    votes: []
                }
            ];

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findMany.mockResolvedValue(mockElections);
            prisma.auditLog.create.mockResolvedValue({});

            await electionController.getElectionResults(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.elections[0].winner.name).toBe('Winner');
            expect(response.elections[0].winner.voteCount).toBe(100);
        });

        it('should calculate time remaining for live elections', async () => {
            const mockUser = {
                userId: 1,
                citizen: { constituency: 'District-1' }
            };

            const futureTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
            const mockElections = [
                {
                    id: 1,
                    title: 'Live Election',
                    status: 'LIVE',
                    constituency: 'District-1',
                    endTime: futureTime,
                    candidates: [],
                    votes: []
                }
            ];

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findMany.mockResolvedValue(mockElections);
            prisma.auditLog.create.mockResolvedValue({});

            await electionController.getElectionResults(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.elections[0].timeRemaining).toMatch(/\d{2}h : \d{2}m/);
        });

        it('should create audit log entry', async () => {
            const mockUser = {
                userId: 1,
                citizen: { constituency: 'District-1' }
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findMany.mockResolvedValue([]);
            prisma.auditLog.create.mockResolvedValue({});

            await electionController.getElectionResults(req, res);

            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    action: "VIEWED_ELECTION_RESULTS",
                    ipAddress: '127.0.0.1'
                }
            });
        });

        it('should return 404 when user not found', async () => {
            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(null);

            await electionController.getElectionResults(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found"
            });
        });
    });

    describe('getElectionDetails', () => {
        it('should return detailed election results', async () => {
            const mockElection = {
                id: 1,
                title: 'General Election',
                description: 'Description',
                status: 'ENDED',
                constituency: 'District-1',
                startTime: new Date(),
                endTime: new Date(),
                candidates: [
                    {
                        id: 1,
                        name: 'Candidate A',
                        party: 'Party X',
                        symbol: 'X',
                        voteCount: 150,
                        age: 45,
                        education: 'MBA',
                        experience: '10 years'
                    }
                ],
                votes: [
                    { id: 1, timestamp: new Date(), user: { citizen: { constituency: 'District-1', ward: 'Ward-1' } } },
                    { id: 2, timestamp: new Date(), user: { citizen: { constituency: 'District-1', ward: 'Ward-2' } } }
                ]
            };

            req.params = { id: '1' };
            req.user = { user_id: 1 };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.election.findUnique.mockResolvedValue(mockElection);
            prisma.vote.findFirst.mockResolvedValue(null);
            prisma.auditLog.create.mockResolvedValue({});

            await electionController.getElectionDetails(req, res);

            expect(prisma.election.findUnique).toHaveBeenCalledWith({
                where: { id: "1" },
                include: expect.any(Object)
            });
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalVotes: 150
                })
            );
        });

        it('should calculate voter participation percentage', async () => {
            const mockElection = {
                id: 1,
                title: 'Election',
                status: 'ENDED',
                candidates: [{ id: 1, name: 'A', voteCount: 50 }],
                votes: Array(50).fill(null).map((_, i) => ({
                    id: i + 1,
                    timestamp: new Date(),
                    user: { citizen: { constituency: 'District-1', ward: 'Ward-1' } }
                }))
            };

            req.params = { id: '1' };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.election.findUnique.mockResolvedValue(mockElection);
            prisma.vote.findFirst.mockResolvedValue(null);
            prisma.user.count.mockResolvedValue(100);
            prisma.auditLog.create.mockResolvedValue({});

            await electionController.getElectionDetails(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.analytics.turnoutPercentage).toBe(85.2);
        });
    });
});
