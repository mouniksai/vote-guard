// Unit tests for roleMiddleware.js
const roleMiddleware = require('../../../src/middleware/roleMiddleware');

describe('RoleMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        // Suppress console.warn for tests
        jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
        console.warn.mockRestore();
    });

    describe('Admin role validation', () => {
        it('should allow access when user has admin role', () => {
            req.user = { user_id: 1, role: 'admin' };

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should deny access when user role is voter', () => {
            req.user = { user_id: 2, role: 'voter' };

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "Access Forbidden: Insufficient Permissions"
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should log security warning on unauthorized access', () => {
            req.user = { user_id: 5, role: 'voter' };

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(console.warn).toHaveBeenCalledWith(
                '[SECURITY] Unauthorized Access Attempt by User: 5'
            );
        });
    });

    describe('Voter role validation', () => {
        it('should allow access when user has voter role', () => {
            req.user = { user_id: 10, role: 'voter' };

            const middleware = roleMiddleware('voter');
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should deny access when user is not voter', () => {
            req.user = { user_id: 1, role: 'admin' };

            const middleware = roleMiddleware('voter');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Missing user scenarios', () => {
        it('should deny access when req.user is null', () => {
            req.user = null;

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "Access Forbidden: Insufficient Permissions"
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should deny access when req.user is undefined', () => {
            req.user = undefined;

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('should log warning with undefined user_id', () => {
            req.user = null;

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('undefined')
            );
        });
    });

    describe('Missing role scenarios', () => {
        it('should deny access when user has no role property', () => {
            req.user = { user_id: 15 }; // No role

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('should deny access when role is null', () => {
            req.user = { user_id: 16, role: null };

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should deny access when role is empty string', () => {
            req.user = { user_id: 17, role: '' };

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('Custom role validation', () => {
        it('should work with custom role names', () => {
            req.user = { user_id: 20, role: 'moderator' };

            const middleware = roleMiddleware('moderator');
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should be case-sensitive', () => {
            req.user = { user_id: 21, role: 'Admin' };

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Multiple middleware instances', () => {
        it('should create independent middleware functions', () => {
            const adminMiddleware = roleMiddleware('admin');
            const voterMiddleware = roleMiddleware('voter');

            req.user = { user_id: 25, role: 'admin' };

            adminMiddleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);

            next.mockClear();
            res.status.mockClear();

            voterMiddleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('should handle role with whitespace', () => {
            req.user = { user_id: 30, role: ' admin ' };

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should handle numeric role values', () => {
            req.user = { user_id: 31, role: 123 };

            const middleware = roleMiddleware(123);
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should not modify request or response on success', () => {
            req.user = { user_id: 40, role: 'admin', extra: 'data' };

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(req.user).toEqual({ user_id: 40, role: 'admin', extra: 'data' });
        });
    });

    describe('Security logging', () => {
        it('should include user_id in security log', () => {
            req.user = { user_id: 100, role: 'voter' };

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(console.warn).toHaveBeenCalledWith(
                '[SECURITY] Unauthorized Access Attempt by User: 100'
            );
        });

        it('should log even when user object is malformed', () => {
            req.user = { role: 'voter' }; // Missing user_id

            const middleware = roleMiddleware('admin');
            middleware(req, res, next);

            expect(console.warn).toHaveBeenCalled();
        });
    });
});
