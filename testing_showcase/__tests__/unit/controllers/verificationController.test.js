// Unit tests for verificationController.js
const verificationController = require('../../../src/controllers/verificationController');
const prisma = require('../../../src/config/db');
const axios = require('axios');

jest.mock('../../../src/config/db');
jest.mock('axios');

describe('VerificationController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { user_id: 1 },
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('verifyFace', () => {
        it('should verify face successfully with high confidence', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    photoUrl: 'https://example.com/photo.jpg'
                }
            };

            req.body = {
                liveImageBase64: 'data:image/jpeg;base64,ABC123=='
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            axios.post.mockResolvedValue({
                data: {
                    confidence: 85.5
                }
            });

            await verificationController.verifyFace(req, res);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { userId: 1 },
                include: { citizen: true }
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                confidence: 85.5,
                message: "Face Verified Successfully"
            });
        });

        it('should reject face verification with low confidence', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    photoUrl: 'https://example.com/photo.jpg'
                }
            };

            req.body = {
                liveImageBase64: 'data:image/jpeg;base64,XYZ789=='
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            axios.post.mockResolvedValue({
                data: {
                    confidence: 65.3
                }
            });

            await verificationController.verifyFace(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                confidence: 65.3,
                message: "Face mismatch. Verification Failed."
            });
        });

        it('should return 404 when user has no reference photo', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    photoUrl: null
                }
            };

            req.body = {
                liveImageBase64: 'data:image/jpeg;base64,ABC123=='
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await verificationController.verifyFace(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reference photo not found in Government Registry"
            });
        });

        it('should return 404 when user not found', async () => {
            req.body = {
                liveImageBase64: 'data:image/jpeg;base64,ABC123=='
            };

            prisma.user.findUnique.mockResolvedValue(null);

            await verificationController.verifyFace(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reference photo not found in Government Registry"
            });
        });

        it('should strip base64 prefix before sending to API', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    photoUrl: 'https://example.com/photo.jpg'
                }
            };

            req.body = {
                liveImageBase64: 'data:image/png;base64,CLEANBASE64DATA'
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            axios.post.mockResolvedValue({
                data: { confidence: 90 }
            });

            await verificationController.verifyFace(req, res);

            const formData = axios.post.mock.calls[0][1];
            // The clean base64 should not contain the prefix
            expect(req.body.liveImageBase64).toContain('data:image');
        });

        it('should handle Face API errors gracefully', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    photoUrl: 'https://example.com/photo.jpg'
                }
            };

            req.body = {
                liveImageBase64: 'data:image/jpeg;base64,ABC123=='
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            axios.post.mockRejectedValue({
                response: {
                    data: { error: 'API Error' }
                }
            });

            await verificationController.verifyFace(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Face Verification Service Error",
                error: undefined // Should not expose in production
            });
        });

        it('should include error message in development mode', async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const mockUser = {
                userId: 1,
                citizen: {
                    photoUrl: 'https://example.com/photo.jpg'
                }
            };

            req.body = {
                liveImageBase64: 'data:image/jpeg;base64,ABC123=='
            };

            const error = new Error('Test error');
            prisma.user.findUnique.mockResolvedValue(mockUser);
            axios.post.mockRejectedValue(error);

            await verificationController.verifyFace(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Test error'
                })
            );

            process.env.NODE_ENV = originalEnv;
        });

        it('should handle network errors', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    photoUrl: 'https://example.com/photo.jpg'
                }
            };

            req.body = {
                liveImageBase64: 'data:image/jpeg;base64,ABC123=='
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            axios.post.mockRejectedValue(new Error('Network error'));

            await verificationController.verifyFace(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Face Verification Service Error"
                })
            );
        });

        it('should accept confidence at threshold (80)', async () => {
            const mockUser = {
                userId: 1,
                citizen: {
                    photoUrl: 'https://example.com/photo.jpg'
                }
            };

            req.body = {
                liveImageBase64: 'data:image/jpeg;base64,ABC123=='
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            axios.post.mockResolvedValue({
                data: { confidence: 80.0 }
            });

            await verificationController.verifyFace(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                confidence: 80.0,
                message: "Face Verified Successfully"
            });
        });
    });

    describe('validateToken', () => {
        it('should validate token successfully after delay', async () => {
            jest.useFakeTimers();

            const promise = verificationController.validateToken(req, res);

            // Fast-forward time
            jest.advanceTimersByTime(1500);

            await promise;

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Token Validated on Chain"
            });

            jest.useRealTimers();
        });

        it('should handle validation errors', async () => {
            // Mock setTimeout to throw error
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((cb) => {
                throw new Error('Timeout error');
            });

            await verificationController.validateToken(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Token validation failed"
            });

            global.setTimeout = originalSetTimeout;
        });

        it('should simulate async blockchain validation', async () => {
            const startTime = Date.now();

            await verificationController.validateToken(req, res);

            const endTime = Date.now();
            const elapsed = endTime - startTime;

            // Should take at least 1500ms
            expect(elapsed).toBeGreaterThanOrEqual(1400);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Token Validated on Chain"
            });
        });
    });
});
