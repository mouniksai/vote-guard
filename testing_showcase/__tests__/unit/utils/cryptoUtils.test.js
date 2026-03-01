// Unit tests for cryptoUtils.js
const { generateReceiptHash } = require('../../../src/utils/cryptoUtils');

describe('CryptoUtils', () => {
    describe('generateReceiptHash', () => {
        it('should generate a valid receipt hash', () => {
            const userId = 1;
            const electionId = 1;
            const candidateId = 1;

            const hash = generateReceiptHash(userId, electionId, candidateId);

            expect(hash).toBeDefined();
            expect(hash).toMatch(/^0x[a-f0-9]{64}$/); // SHA-256 hash format
            expect(hash.length).toBe(66); // '0x' + 64 hex chars
        });

        it('should generate unique hashes for same inputs (due to timestamp and random)', () => {
            const userId = 1;
            const electionId = 1;
            const candidateId = 1;

            const hash1 = generateReceiptHash(userId, electionId, candidateId);
            const hash2 = generateReceiptHash(userId, electionId, candidateId);

            expect(hash1).not.toBe(hash2);
        });

        it('should generate different hashes for different user IDs', () => {
            const electionId = 1;
            const candidateId = 1;

            // Mock Date.now and Math.random to ensure differences come from userId
            const mockDate = Date.now();
            jest.spyOn(Date, 'now').mockReturnValue(mockDate);
            jest.spyOn(Math, 'random').mockReturnValue(0.5);

            const hash1 = generateReceiptHash(1, electionId, candidateId);
            const hash2 = generateReceiptHash(2, electionId, candidateId);

            expect(hash1).not.toBe(hash2);

            // Restore mocks
            Date.now.mockRestore();
            Math.random.mockRestore();
        });

        it('should handle string and number inputs', () => {
            const hash1 = generateReceiptHash('1', '1', '1');
            const hash2 = generateReceiptHash(1, 1, 1);

            expect(hash1).toBeDefined();
            expect(hash2).toBeDefined();
            expect(hash1).toMatch(/^0x[a-f0-9]{64}$/);
            expect(hash2).toMatch(/^0x[a-f0-9]{64}$/);
        });
    });
});
