// Unit tests for voteController.js
const voteController = require('../../../src/controllers/voteController');
const prisma = require('../../../src/config/db');
const { generateReceiptHash } = require('../../../src/utils/cryptoUtils');
const encryptionService = require('../../../src/utils/encryptionService');
const EncodingService = require('../../../src/utils/encodingService');

// Mock dependencies
jest.mock('../../../src/config/db');
jest.mock('../../../src/utils/cryptoUtils');
jest.mock('../../../src/utils/encryptionService');
jest.mock('../../../src/utils/encodingService');

describe('VoteController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { user_id: 1 },
            body: {},
            ip: '127.0.0.1',
            sessionID: 'test-session'
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

    describe('getBallot', () => {
        it('should return ballot with candidates for live election', async () => {
            const mockUser = {
                userId: 1,
                citizen: { constituency: 'District-1' }
            };

            const mockElection = {
                id: 1,
                title: 'General Election 2026',
                constituency: 'District-1',
                status: 'LIVE',
                endTime: new Date(Date.now() + 10000),
                candidates: [
                    { id: 1, name: 'Candidate A', party: 'Party X', symbol: 'X' },
                    { id: 2, name: 'Candidate B', party: 'Party Y', symbol: 'Y' }
                ]
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(mockElection);
            prisma.vote.findUnique.mockResolvedValue(null);

            await voteController.getBallot(req, res);

            expect(res.json).toHaveBeenCalledWith({
                election: expect.objectContaining({
                    id: 1,
                    title: 'General Election 2026',
                    constituency: 'District-1'
                }),
                candidates: mockElection.candidates,
                hasVoted: false
            });
        });

        it('should return 404 when no live election found', async () => {
            const mockUser = {
                userId: 1,
                citizen: { constituency: 'District-2' }
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(null);

            await voteController.getBallot(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "No live election found for your constituency."
            });
        });

        it('should return 403 if user already voted', async () => {
            const mockUser = {
                userId: 1,
                citizen: { constituency: 'District-1' }
            };

            const mockElection = {
                id: 1,
                title: 'Election',
                constituency: 'District-1',
                status: 'LIVE',
                endTime: new Date(Date.now() + 10000),
                candidates: []
            };

            const mockVote = {
                id: 1,
                receiptHash: '0xhash123',
                timestamp: new Date()
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.election.findFirst.mockResolvedValue(mockElection);
            prisma.vote.findUnique.mockResolvedValue(mockVote);

            await voteController.getBallot(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "You have already cast your vote.",
                hasVoted: true,
                receiptHash: '0xhash123',
                timestamp: mockVote.timestamp
            });
        });

        it('should return 404 when user not found', async () => {
            prisma.election.updateMany.mockResolvedValue({});
            prisma.user.findUnique.mockResolvedValue(null);

            await voteController.getBallot(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found"
            });
        });
    });

    describe('castVote', () => {
        it('should cast vote successfully and return receipt', async () => {
            const mockElection = {
                id: 1,
                status: 'LIVE',
                endTime: new Date(Date.now() + 100000)
            };

            const mockVote = {
                id: 1,
                receiptHash: '0xreceipt123',
                timestamp: new Date()
            };

            req.body = {
                electionId: 1,
                candidateId: 1
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.election.findUnique.mockResolvedValue(mockElection);
            generateReceiptHash.mockReturnValue('0xreceipt123');
            encryptionService.encryptVote.mockReturnValue('encrypted:details');
            prisma.$transaction.mockResolvedValue(mockVote);
            EncodingService.encodeReceiptToBase64.mockReturnValue('base64encoded');
            EncodingService.generateReceiptQRCode.mockResolvedValue('data:image/png;base64,qrcode');
            EncodingService.encodeToBarcode.mockReturnValue('1234567890123');

            await voteController.castVote(req, res);

            expect(generateReceiptHash).toHaveBeenCalledWith(1, 1, 1);
            expect(prisma.$transaction).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Vote cast successfully",
                receiptHash: '0xreceipt123',
                timestamp: mockVote.timestamp,
                encodedFormats: {
                    base64: 'base64encoded',
                    qrCode: 'data:image/png;base64,qrcode',
                    barcode: '1234567890123'
                }
            });
        });

        it('should return 404 if election not found', async () => {
            req.body = {
                electionId: 999,
                candidateId: 1
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.election.findUnique.mockResolvedValue(null);

            await voteController.castVote(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Election not found."
            });
        });

        it('should return 400 if election has ended', async () => {
            const mockElection = {
                id: 1,
                status: 'ENDED',
                endTime: new Date(Date.now() - 10000)
            };

            req.body = {
                electionId: 1,
                candidateId: 1
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.election.findUnique.mockResolvedValue(mockElection);

            await voteController.castVote(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Election has ended or is not active."
            });
        });

        it('should return 409 if user already voted (double vote attempt)', async () => {
            const mockElection = {
                id: 1,
                status: 'LIVE',
                endTime: new Date(Date.now() + 100000)
            };

            req.body = {
                electionId: 1,
                candidateId: 1
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.election.findUnique.mockResolvedValue(mockElection);
            generateReceiptHash.mockReturnValue('0xhash');
            encryptionService.encryptVote.mockReturnValue('encrypted');
            prisma.$transaction.mockRejectedValue(new Error('DOUBLE_VOTE_ATTEMPT'));

            await voteController.castVote(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: "You have already voted in this election."
            });
        });

        it('should handle Prisma unique constraint error', async () => {
            const mockElection = {
                id: 1,
                status: 'LIVE',
                endTime: new Date(Date.now() + 100000)
            };

            req.body = {
                electionId: 1,
                candidateId: 1
            };

            prisma.election.updateMany.mockResolvedValue({});
            prisma.election.findUnique.mockResolvedValue(mockElection);
            generateReceiptHash.mockReturnValue('0xhash');
            encryptionService.encryptVote.mockReturnValue('encrypted');

            const error = new Error('Unique constraint');
            error.code = 'P2002';
            prisma.$transaction.mockRejectedValue(error);

            await voteController.castVote(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });
    });

    describe('decryptVoteDetails', () => {
        it('should decrypt and return vote details', async () => {
            const mockVote = {
                id: 1,
                encryptedDetails: 'iv:encrypted',
                receiptHash: '0xhash',
                candidate: { name: 'Candidate A' },
                election: { title: 'Election 2026' }
            };

            req.params = { voteId: '1' };

            prisma.vote.findUnique.mockResolvedValue(mockVote);
            encryptionService.decryptVote.mockReturnValue({
                candidateId: 1,
                timestamp: '2026-01-01',
                sessionId: 'session123'
            });

            await voteController.decryptVoteDetails(req, res);

            expect(res.json).toHaveBeenCalledWith({
                voteId: 1,
                candidate: 'Candidate A',
                election: 'Election 2026',
                encryptedDetails: 'iv:encrypted',
                decryptedDetails: {
                    candidateId: 1,
                    timestamp: '2026-01-01',
                    sessionId: 'session123'
                },
                receiptHash: '0xhash'
            });
        });

        it('should return 404 if vote not found', async () => {
            req.params = { voteId: '999' };

            prisma.vote.findUnique.mockResolvedValue(null);

            await voteController.decryptVoteDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Vote not found"
            });
        });

        it('should handle decryption failure', async () => {
            const mockVote = {
                id: 1,
                encryptedDetails: 'invalid:data',
                receiptHash: '0xhash',
                candidate: { name: 'Candidate A' },
                election: { title: 'Election' }
            };

            req.params = { voteId: '1' };

            prisma.vote.findUnique.mockResolvedValue(mockVote);
            encryptionService.decryptVote.mockImplementation(() => {
                throw new Error('Decryption failed');
            });

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await voteController.decryptVoteDetails(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    decryptedDetails: { error: 'Decryption failed' }
                })
            );

            consoleSpy.mockRestore();
        });
    });

    describe('verifyEncodedReceipt', () => {
        it('should verify base64 encoded receipt', async () => {
            const mockVote = {
                id: 1,
                receiptHash: '0xhash123',
                timestamp: new Date('2026-01-01'),
                election: {
                    title: 'Election 2026',
                    constituency: 'District-1'
                }
            };

            req.body = {
                encodedReceipt: 'base64data',
                format: 'base64'
            };

            EncodingService.decodeReceiptFromBase64.mockReturnValue({
                receiptHash: '0xhash123',
                timestamp: '2026-01-01T00:00:00.000Z',
                electionId: 1
            });
            prisma.vote.findFirst.mockResolvedValue(mockVote);

            await voteController.verifyEncodedReceipt(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Receipt verified successfully",
                decodedData: expect.any(Object),
                verification: {
                    electionTitle: 'Election 2026',
                    constituency: 'District-1',
                    votedAt: mockVote.timestamp,
                    verified: true
                }
            });
        });

        it('should verify url-safe encoded receipt', async () => {
            req.body = {
                encodedReceipt: 'urlsafedata',
                format: 'url-safe'
            };

            EncodingService.decodeFromURL.mockReturnValue({
                receiptHash: '0xhash',
                timestamp: '2026-01-01',
                electionId: 1
            });
            prisma.vote.findFirst.mockResolvedValue({
                id: 1,
                receiptHash: '0xhash',
                timestamp: new Date('2026-01-01'),
                election: { title: 'Election', constituency: 'District-1' }
            });

            await voteController.verifyEncodedReceipt(req, res);

            expect(EncodingService.decodeFromURL).toHaveBeenCalledWith('urlsafedata');
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should return 400 for invalid format', async () => {
            req.body = {
                encodedReceipt: 'data',
                format: 'invalid-format'
            };

            await voteController.verifyEncodedReceipt(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid format. Use 'base64' or 'url-safe'"
            });
        });

        it('should return 404 if receipt not found in database', async () => {
            req.body = {
                encodedReceipt: 'base64data',
                format: 'base64'
            };

            EncodingService.decodeReceiptFromBase64.mockReturnValue({
                receiptHash: '0xinvalid',
                timestamp: '2026-01-01',
                electionId: 999
            });
            prisma.vote.findFirst.mockResolvedValue(null);

            await voteController.verifyEncodedReceipt(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('verifyDigitalSignature', () => {
        it('should verify valid receipt signature', async () => {
            const mockVote = {
                id: 1,
                userId: 1,
                receiptHash: '0xvalid',
                timestamp: new Date(),
                election: { id: 1, title: 'Election', constituency: 'District-1' },
                candidate: { id: 1, name: 'Candidate A', party: 'Party X' },
                user: { userId: 1 }
            };

            req.body = {
                receiptHash: '0xvalid',
                userId: 1,
                electionId: 1,
                candidateId: 1
            };

            prisma.vote.findFirst.mockResolvedValue(mockVote);

            await voteController.verifyDigitalSignature(req, res);

            expect(res.json).toHaveBeenCalledWith({
                verified: true,
                message: expect.stringContaining('verified'),
                details: expect.objectContaining({
                    existsInDatabase: true,
                    dataMatch: true
                })
            });
        });

        it('should detect data mismatch', async () => {
            const mockVote = {
                id: 1,
                userId: 1,
                receiptHash: '0xhash',
                timestamp: new Date(),
                election: { id: 1, title: 'Election', constituency: 'District-1' },
                candidate: { id: 1, name: 'Candidate A', party: 'Party X' },
                user: { userId: 1 }
            };

            req.body = {
                receiptHash: '0xhash',
                userId: 999, // Wrong user
                electionId: 1,
                candidateId: 1
            };

            prisma.vote.findFirst.mockResolvedValue(mockVote);

            await voteController.verifyDigitalSignature(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    verified: false,
                    message: expect.stringContaining('mismatch')
                })
            );
        });

        it('should return not verified when receipt not found', async () => {
            req.body = {
                receiptHash: '0xnonexistent'
            };

            prisma.vote.findFirst.mockResolvedValue(null);

            await voteController.verifyDigitalSignature(req, res);

            expect(res.json).toHaveBeenCalledWith({
                verified: false,
                message: expect.stringContaining('not found'),
                details: expect.objectContaining({
                    existsInDatabase: false,
                    dataMatch: false,
                    voteInfo: null
                })
            });
        });

        it('should return 400 when receiptHash is missing', async () => {
            req.body = {};

            await voteController.verifyDigitalSignature(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                verified: false,
                message: "Receipt hash is required for verification"
            });
        });
    });
});
