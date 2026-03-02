// Unit tests for adminController.js
const adminController = require('../../../src/controllers/adminController');
const prisma = require('../../../src/config/db');

jest.mock('../../../src/config/db');

describe('AdminController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { user_id: 1 },
            body: {},
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

    describe('validateToken', () => {
        it('should validate admin token and return user data', async () => {
            const mockUser = {
                userId: 1,
                username: 'admin',
                role: 'admin',
                citizenId: 'CIT001',
                citizen: {
                    fullName: 'Admin User',
                    email: 'admin@voteguard.com',
                    constituency: 'District-1'
                }
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await adminController.validateToken(req, res);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { userId: 1 },
                select: expect.any(Object)
            });
            expect(res.json).toHaveBeenCalledWith({
                valid: true,
                user: {
                    user_id: 1,
                    email: 'admin@voteguard.com',
                    role: 'admin',
                    full_name: 'Admin User',
                    constituency: 'District-1',
                    username: 'admin'
                },
                message: "Token is valid"
            });
        });

        it('should return 404 when user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await adminController.validateToken(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found"
            });
        });

        it('should handle database errors', async () => {
            prisma.user.findUnique.mockRejectedValue(new Error('DB Error'));

            await adminController.validateToken(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Token validation error"
            });
        });
    });

    describe('getSystemStats', () => {
        it('should return system statistics', async () => {
            prisma.user.count.mockResolvedValue(150);
            prisma.vote.count.mockResolvedValue(120);
            prisma.election.findFirst.mockResolvedValue({
                id: 1,
                title: 'General Election 2026'
            });

            await adminController.getSystemStats(req, res);

            expect(prisma.user.count).toHaveBeenCalledWith({
                where: { role: 'voter' }
            });
            expect(prisma.vote.count).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                totalVoters: 150,
                totalVotes: 120,
                activeElection: 'General Election 2026',
                status: "System Operational"
            });
        });

        it('should handle no active election', async () => {
            prisma.user.count.mockResolvedValue(100);
            prisma.vote.count.mockResolvedValue(80);
            prisma.election.findFirst.mockResolvedValue(null);

            await adminController.getSystemStats(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    activeElection: "No Live Election"
                })
            );
        });

        it('should handle errors', async () => {
            prisma.user.count.mockRejectedValue(new Error('Stats error'));

            await adminController.getSystemStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Stats Error"
            });
        });
    });

    describe('createElection', () => {
        it('should create new election successfully', async () => {
            const newElection = {
                id: 1,
                title: 'New Election',
                description: 'Description',
                constituency: 'District-1',
                startTime: new Date(),
                endTime: new Date(),
                status: 'LIVE'
            };

            req.body = {
                title: 'New Election',
                description: 'Description',
                constituency: 'District-1',
                startTime: '2026-03-01T00:00:00Z',
                endTime: '2026-03-01T23:59:59Z'
            };

            prisma.election.create.mockResolvedValue(newElection);
            prisma.auditLog.create.mockResolvedValue({});

            await adminController.createElection(req, res);

            expect(prisma.election.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    title: 'New Election',
                    description: 'Description',
                    constituency: 'District-1',
                    status: 'LIVE'
                })
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Election Created",
                electionId: 1
            });
        });

        it('should create audit log for election creation', async () => {
            req.body = {
                title: 'Test Election',
                description: 'Desc',
                constituency: 'District-2',
                startTime: new Date(),
                endTime: new Date()
            };

            prisma.election.create.mockResolvedValue({ id: 5 });
            prisma.auditLog.create.mockResolvedValue({});

            await adminController.createElection(req, res);

            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    action: "CREATED_ELECTION",
                    details: "Created: Test Election (District-2)",
                    ipAddress: '127.0.0.1'
                }
            });
        });

        it('should handle errors during election creation', async () => {
            req.body = {
                title: 'Election',
                description: 'Desc',
                constituency: 'District-1',
                startTime: new Date(),
                endTime: new Date()
            };

            prisma.election.create.mockRejectedValue(new Error('Creation failed'));

            await adminController.createElection(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Server Error"
            });
        });
    });

    describe('addCandidate', () => {
        it('should add candidate to election successfully', async () => {
            const newCandidate = {
                id: 1,
                electionId: 1,
                name: 'John Doe',
                party: 'Party X',
                symbol: 'X',
                age: 45,
                education: 'MBA',
                experience: '10 years'
            };

            req.body = {
                electionId: 1,
                name: 'John Doe',
                party: 'Party X',
                symbol: 'X',
                keyPoints: ['Point 1', 'Point 2'],
                age: '45',
                education: 'MBA',
                experience: '10 years'
            };

            prisma.candidate.create.mockResolvedValue(newCandidate);
            prisma.auditLog.create.mockResolvedValue({});

            await adminController.addCandidate(req, res);

            expect(prisma.candidate.create).toHaveBeenCalledWith({
                data: {
                    electionId: 1,
                    name: 'John Doe',
                    party: 'Party X',
                    symbol: 'X',
                    age: 45,
                    education: 'MBA',
                    experience: '10 years',
                    keyPoints: ['Point 1', 'Point 2']
                }
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Candidate Added",
                candidate: newCandidate
            });
        });

        it('should create audit log for candidate addition', async () => {
            req.body = {
                electionId: 1,
                name: 'Jane Smith',
                party: 'Party Y',
                symbol: 'Y',
                keyPoints: [],
                age: '40',
                education: 'PhD',
                experience: '15 years'
            };

            prisma.candidate.create.mockResolvedValue({ id: 2 });
            prisma.auditLog.create.mockResolvedValue({});

            await adminController.addCandidate(req, res);

            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    action: "ADDED_CANDIDATE",
                    details: "Added Jane Smith to election 1",
                    ipAddress: '127.0.0.1'
                }
            });
        });

        it('should handle errors during candidate addition', async () => {
            req.body = {
                electionId: 1,
                name: 'Test',
                party: 'Party',
                symbol: 'S',
                keyPoints: [],
                age: '30',
                education: 'BSc',
                experience: '5 years'
            };

            prisma.candidate.create.mockRejectedValue(new Error('Add failed'));

            await adminController.addCandidate(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Server Error"
            });
        });
    });

    describe('getElections', () => {
        it('should return all elections with basic info', async () => {
            const mockElections = [
                { id: 1, title: 'Election 1', status: 'LIVE' },
                { id: 2, title: 'Election 2', status: 'ENDED' },
                { id: 3, title: 'Election 3', status: 'UPCOMING' }
            ];

            prisma.election.findMany.mockResolvedValue(mockElections);

            await adminController.getElections(req, res);

            expect(prisma.election.findMany).toHaveBeenCalledWith({
                select: { id: true, title: true, status: true }
            });
            expect(res.json).toHaveBeenCalledWith(mockElections);
        });

        it('should handle empty election list', async () => {
            prisma.election.findMany.mockResolvedValue([]);

            await adminController.getElections(req, res);

            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should handle errors', async () => {
            prisma.election.findMany.mockRejectedValue(new Error('Fetch failed'));

            await adminController.getElections(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error fetching elections"
            });
        });
    });
});
