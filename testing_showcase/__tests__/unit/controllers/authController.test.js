// Unit tests for authController.js
const authController = require('../../../src/controllers/authController');
const prisma = require('../../../src/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmailOTP } = require('../../../src/utils/emailService');

// Mock dependencies
jest.mock('../../../src/config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../src/utils/emailService');

describe('AuthController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe('verifyCitizen', () => {
        it('should return citizen data when citizenId is found', async () => {
            const mockCitizen = {
                citizenId: 'CIT001',
                fullName: 'John Doe',
                email: 'john@example.com',
                isRegistered: false
            };

            req.body = { citizenId: 'CIT001' };
            prisma.govtRegistry.findUnique.mockResolvedValue(mockCitizen);

            await authController.verifyCitizen(req, res);

            expect(prisma.govtRegistry.findUnique).toHaveBeenCalledWith({
                where: { citizenId: 'CIT001' }
            });
            expect(res.json).toHaveBeenCalledWith(mockCitizen);
        });

        it('should return 404 when citizenId not found', async () => {
            req.body = { citizenId: 'INVALID' };
            prisma.govtRegistry.findUnique.mockResolvedValue(null);

            await authController.verifyCitizen(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Citizen ID not found in Government Records."
            });
        });

        it('should return 409 when citizen already registered', async () => {
            const mockCitizen = {
                citizenId: 'CIT002',
                fullName: 'Jane Doe',
                isRegistered: true
            };

            req.body = { citizenId: 'CIT002' };
            prisma.govtRegistry.findUnique.mockResolvedValue(mockCitizen);

            await authController.verifyCitizen(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: "User already registered. Please login."
            });
        });

        it('should handle database errors', async () => {
            req.body = { citizenId: 'CIT003' };
            prisma.govtRegistry.findUnique.mockRejectedValue(new Error('DB Error'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await authController.verifyCitizen(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Server Error" });

            consoleSpy.mockRestore();
        });
    });

    describe('registerUser', () => {
        it('should register new user successfully', async () => {
            const mockUser = {
                userId: 1,
                username: 'newuser',
                citizenId: 'CIT001'
            };

            req.body = {
                citizenId: 'CIT001',
                username: 'newuser',
                password: 'password123'
            };

            prisma.user.findUnique.mockResolvedValue(null); // Username available
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedpassword');
            prisma.$transaction.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('jwt-token-123');

            await authController.registerUser(req, res);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'newuser' }
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
            expect(jwt.sign).toHaveBeenCalledWith(
                { user_id: 1 },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            expect(res.cookie).toHaveBeenCalledWith(
                'voteGuardToken',
                'jwt-token-123',
                expect.any(Object)
            );
            expect(res.json).toHaveBeenCalledWith({
                token: 'jwt-token-123',
                user: mockUser
            });
        });

        it('should return 401 when username already taken', async () => {
            req.body = {
                username: 'existinguser',
                password: 'pass123',
                citizenId: 'CIT001'
            };

            prisma.user.findUnique.mockResolvedValue({ userId: 99, username: 'existinguser' });

            await authController.registerUser(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Username already taken."
            });
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('should execute transaction to create user and update registry', async () => {
            const mockUser = { userId: 2, username: 'user2', citizenId: 'CIT002' };

            req.body = {
                username: 'user2',
                password: 'pass123',
                citizenId: 'CIT002'
            };

            prisma.user.findUnique.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashed');
            prisma.$transaction.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('token');

            await authController.registerUser(req, res);

            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('should handle errors during registration', async () => {
            req.body = {
                username: 'newuser',
                password: 'pass',
                citizenId: 'CIT003'
            };

            prisma.user.findUnique.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashed');
            prisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await authController.registerUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Server Error" });

            consoleSpy.mockRestore();
        });
    });

    describe('loginUser', () => {
        it('should generate and send OTP for valid credentials', async () => {
            const mockUser = {
                userId: 1,
                username: 'testuser',
                passwordHash: 'hashedpass',
                citizen: {
                    email: 'test@example.com',
                    mobile: '1234567890'
                }
            };

            req.body = {
                username: 'testuser',
                password: 'correctpassword'
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            prisma.user.update.mockResolvedValue({});
            sendEmailOTP.mockResolvedValue(true);

            await authController.loginUser(req, res);

            expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashedpass');
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 1 },
                    data: expect.objectContaining({
                        otpCode: expect.any(String),
                        otpExpiresAt: expect.any(Date)
                    })
                })
            );
            expect(sendEmailOTP).toHaveBeenCalledWith(
                'test@example.com',
                expect.any(String)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Password verified",
                    requires2FA: true,
                    userId: 1,
                    maskedEmail: expect.stringContaining('***'),
                    maskedMobile: expect.any(String)
                })
            );
        });

        it('should return 401 for invalid username', async () => {
            req.body = {
                username: 'nonexistent',
                password: 'anypass'
            };

            prisma.user.findUnique.mockResolvedValue(null);

            await authController.loginUser(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid Credentials"
            });
        });

        it('should return 401 for invalid password', async () => {
            const mockUser = {
                userId: 1,
                username: 'testuser',
                passwordHash: 'hashedpass',
                citizen: {}
            };

            req.body = {
                username: 'testuser',
                password: 'wrongpassword'
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await authController.loginUser(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid Credentials"
            });
        });

        it('should mask email and mobile in response', async () => {
            const mockUser = {
                userId: 5,
                username: 'user5',
                passwordHash: 'hash',
                citizen: {
                    email: 'user@example.com',
                    mobile: '9876543210'
                }
            };

            req.body = { username: 'user5', password: 'pass' };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            prisma.user.update.mockResolvedValue({});
            sendEmailOTP.mockResolvedValue(true);

            await authController.loginUser(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.maskedEmail).toContain('***');
            expect(response.maskedMobile).toContain('*');
        });
    });

    describe('verifyOtp', () => {
        it('should verify correct OTP and issue token', async () => {
            const futureDate = new Date(Date.now() + 10 * 60 * 1000);
            const mockUser = {
                userId: 1,
                username: 'testuser',
                otpCode: '123456',
                otpExpiresAt: futureDate,
                role: 'voter',
                citizen: {
                    fullName: 'Test User'
                }
            };

            req.body = {
                userId: 1,
                otp: '123456'
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma.user.update.mockResolvedValue({});
            jwt.sign.mockReturnValue('final-token-123');

            await authController.verifyOtp(req, res);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { userId: 1 },
                data: { otpCode: null, otpExpiresAt: null }
            });
            expect(jwt.sign).toHaveBeenCalledWith(
                { user_id: 1, role: 'voter' },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            expect(res.cookie).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    token: 'final-token-123',
                    user: expect.objectContaining({
                        username: 'testuser',
                        role: 'voter'
                    })
                })
            );
        });

        it('should return 400 for invalid OTP', async () => {
            const mockUser = {
                userId: 1,
                otpCode: '123456',
                otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
                citizen: {}
            };

            req.body = {
                userId: 1,
                otp: '999999'
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await authController.verifyOtp(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid OTP Code"
            });
        });

        it('should return 400 for expired OTP', async () => {
            const pastDate = new Date(Date.now() - 10 * 60 * 1000);
            const mockUser = {
                userId: 1,
                otpCode: '123456',
                otpExpiresAt: pastDate,
                citizen: {}
            };

            req.body = {
                userId: 1,
                otp: '123456'
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            await authController.verifyOtp(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "OTP has expired. Login again."
            });
        });

        it('should return 400 when user not found', async () => {
            req.body = {
                userId: 999,
                otp: '123456'
            };

            prisma.user.findUnique.mockResolvedValue(null);

            await authController.verifyOtp(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found"
            });
        });
    });

    describe('logoutUser', () => {
        it('should clear cookie and return success message', async () => {
            await authController.logoutUser(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith(
                'voteGuardToken',
                expect.objectContaining({
                    httpOnly: false,
                    sameSite: 'lax',
                    path: '/'
                })
            );
            expect(res.json).toHaveBeenCalledWith({
                message: "Logged out successfully"
            });
        });

        it('should handle errors during logout', async () => {
            res.clearCookie.mockImplementation(() => {
                throw new Error('Cookie error');
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await authController.logoutUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Server Error"
            });

            consoleSpy.mockRestore();
        });
    });
});
