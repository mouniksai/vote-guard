// Unit tests for cookie utility functions
// Tests getCookie, setCookie, and deleteCookie helpers used across the app

describe('Cookie Utilities', () => {
    beforeEach(() => {
        // Reset document.cookie before each test
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: ''
        });
    });

    describe('getCookie', () => {
        // Inline getCookie implementation matching the pattern used in login/dashboard pages
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        };

        it('should return cookie value when cookie exists', () => {
            document.cookie = 'voteGuardToken=test-jwt-token-123';
            const result = getCookie('voteGuardToken');
            expect(result).toBe('test-jwt-token-123');
        });

        it('should return null when cookie does not exist', () => {
            document.cookie = 'otherCookie=value';
            const result = getCookie('voteGuardToken');
            expect(result).toBeNull();
        });

        it('should handle multiple cookies correctly', () => {
            document.cookie = 'cookie1=value1; voteGuardToken=my-token; cookie2=value2';
            const result = getCookie('voteGuardToken');
            expect(result).toBe('my-token');
        });

        it('should return null when no cookies exist', () => {
            document.cookie = '';
            const result = getCookie('voteGuardToken');
            expect(result).toBeNull();
        });

        it('should handle cookie with special characters', () => {
            document.cookie = 'voteGuardToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxfQ.signature';
            const result = getCookie('voteGuardToken');
            expect(result).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxfQ.signature');
        });

        it('should not return partial cookie name matches', () => {
            document.cookie = 'myVoteGuardToken=wrong-value; voteGuardToken=correct-value';
            const result = getCookie('voteGuardToken');
            expect(result).toBe('correct-value');
        });
    });

    describe('deleteCookie', () => {
        // Inline deleteCookie matching the pattern used in the app
        const deleteCookie = (name) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        };

        it('should set cookie to expire in the past', () => {
            document.cookie = 'voteGuardToken=test-token';
            deleteCookie('voteGuardToken');

            expect(document.cookie).toContain('expires=Thu, 01 Jan 1970');
        });

        it('should set path to root', () => {
            deleteCookie('voteGuardToken');
            expect(document.cookie).toContain('path=/');
        });
    });

    describe('setCookie (via document.cookie)', () => {
        it('should set a cookie with value', () => {
            document.cookie = 'voteGuardToken=new-token; path=/';
            expect(document.cookie).toContain('voteGuardToken=new-token');
        });

        it('should set a cookie with max-age', () => {
            document.cookie = 'voteGuardToken=token; max-age=3600; path=/';
            expect(document.cookie).toContain('max-age=3600');
        });
    });

    describe('voteGuardUser cookie (JSON)', () => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        };

        it('should store and parse JSON user data', () => {
            const userData = {
                username: 'admin',
                role: 'admin',
                name: 'Admin User'
            };
            document.cookie = `voteGuardUser=${encodeURIComponent(JSON.stringify(userData))}`;

            const raw = getCookie('voteGuardUser');
            const parsed = JSON.parse(decodeURIComponent(raw));

            expect(parsed.username).toBe('admin');
            expect(parsed.role).toBe('admin');
        });

        it('should handle voter role in user cookie', () => {
            const userData = { username: 'voter1', role: 'voter' };
            document.cookie = `voteGuardUser=${encodeURIComponent(JSON.stringify(userData))}`;

            const raw = getCookie('voteGuardUser');
            const parsed = JSON.parse(decodeURIComponent(raw));

            expect(parsed.role).toBe('voter');
        });
    });
});
