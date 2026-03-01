// Unit tests for authMiddleware.js
const authMiddleware = require('../../../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Mock jwt
jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        // Reset request, response, and next function for each test
        req = {
            header: jest.fn(),
            cookies: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        jest.clearAllMocks();
    });

    describe('Token validation from Authorization header', () => {
        it('should authenticate valid token from Authorization header', () => {
            const token = 'valid.jwt.token';
            const decoded = { user_id: 1, role: 'voter' };

            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockReturnValue(decoded);

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
            expect(req.user).toEqual(decoded);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should handle token without "Bearer " prefix', () => {
            const token = 'valid.jwt.token';
            const decoded = { user_id: 2, role: 'admin' };

            req.header.mockReturnValue(token);
            jwt.verify.mockReturnValue(decoded);

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
            expect(req.user).toEqual(decoded);
            expect(next).toHaveBeenCalled();
        });

        it('should strip Bearer prefix correctly', () => {
            const token = 'actual.token.value';
            const decoded = { user_id: 3 };

            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockReturnValue(decoded);

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
        });
    });

    describe('Token validation from cookies', () => {
        it('should authenticate valid token from cookies', () => {
            const token = 'cookie.jwt.token';
            const decoded = { user_id: 5, role: 'voter' };

            req.header.mockReturnValue(null);
            req.cookies = { voteGuardToken: token };
            jwt.verify.mockReturnValue(decoded);

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
            expect(req.user).toEqual(decoded);
            expect(next).toHaveBeenCalled();
        });

        it('should prioritize Authorization header over cookies', () => {
            const headerToken = 'header.token';
            const cookieToken = 'cookie.token';
            const decoded = { user_id: 6 };

            req.header.mockReturnValue(`Bearer ${headerToken}`);
            req.cookies = { voteGuardToken: cookieToken };
            jwt.verify.mockReturnValue(decoded);

            authMiddleware(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(headerToken, process.env.JWT_SECRET);
            expect(req.user).toEqual(decoded);
        });
    });

    describe('Missing token scenarios', () => {
        it('should reject request when no token provided', () => {
            req.header.mockReturnValue(null);
            req.cookies = {};

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "No token, authorization denied"
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should reject when Authorization header is empty', () => {
            req.header.mockReturnValue('');
            req.cookies = {};

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "No token, authorization denied"
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should reject when cookies object is null', () => {
            req.header.mockReturnValue(null);
            req.cookies = null;

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Invalid token scenarios', () => {
        it('should reject invalid JWT token', () => {
            const token = 'invalid.token';

            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Token is not valid"
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should reject expired token', () => {
            const token = 'expired.token';

            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockImplementation(() => {
                const error = new Error('jwt expired');
                error.name = 'TokenExpiredError';
                throw error;
            });

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Token is not valid"
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should reject malformed token', () => {
            const token = 'malformed';

            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockImplementation(() => {
                const error = new Error('jwt malformed');
                error.name = 'JsonWebTokenError';
                throw error;
            });

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Token is not valid"
            });
        });
    });

    describe('Token payload validation', () => {
        it('should attach user payload to request object', () => {
            const token = 'valid.token';
            const decoded = {
                user_id: 10,
                role: 'voter',
                iat: 1234567890
            };

            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockReturnValue(decoded);

            authMiddleware(req, res, next);

            expect(req.user).toEqual(decoded);
            expect(req.user.user_id).toBe(10);
            expect(req.user.role).toBe('voter');
        });

        it('should handle admin role in token', () => {
            const token = 'admin.token';
            const decoded = {
                user_id: 1,
                role: 'admin'
            };

            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockReturnValue(decoded);

            authMiddleware(req, res, next);

            expect(req.user.role).toBe('admin');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('should handle Bearer with extra spaces', () => {
            const token = 'token.value';
            const decoded = { user_id: 11 };

            req.header.mockReturnValue(`Bearer  ${token}`); // Extra space
            jwt.verify.mockReturnValue(decoded);

            authMiddleware(req, res, next);

            // Should still work despite extra space
            expect(next).toHaveBeenCalled();
        });

        it('should handle lowercase "bearer"', () => {
            const token = 'token.value';
            const decoded = { user_id: 12 };

            req.header.mockReturnValue(`bearer ${token}`);
            jwt.verify.mockReturnValue(decoded);

            authMiddleware(req, res, next);

            // Implementation uses startsWith("Bearer "), so this should fail verification
            // The token would be "bearer token.value" which is invalid
            expect(jwt.verify).toHaveBeenCalledWith(`bearer ${token}`, process.env.JWT_SECRET);
        });

        it('should not modify request if token is invalid', () => {
            const token = 'invalid.token';

            req.header.mockReturnValue(`Bearer ${token}`);
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid');
            });

            authMiddleware(req, res, next);

            expect(req.user).toBeUndefined();
        });
    });
});
