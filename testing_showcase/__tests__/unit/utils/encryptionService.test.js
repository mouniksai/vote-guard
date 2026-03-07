// Unit tests for encryptionService.js
const encryptionService = require('../../../src/utils/encryptionService');

describe('EncryptionService', () => {
    describe('encrypt and decrypt', () => {
        it('should encrypt and decrypt text correctly', () => {
            const plainText = 'Hello VoteGuard!';

            const encrypted = encryptionService.encrypt(plainText);

            expect(encrypted).toBeDefined();
            expect(encrypted.encryptedData).toBeDefined();
            expect(encrypted.iv).toBeDefined();
            expect(encrypted.iv).toHaveLength(32); // 16 bytes in hex

            const decrypted = encryptionService.decrypt(encrypted.encryptedData, encrypted.iv);
            expect(decrypted).toBe(plainText);
        });

        it('should produce different encrypted outputs for same input', () => {
            const plainText = 'Test message';

            const encrypted1 = encryptionService.encrypt(plainText);
            const encrypted2 = encryptionService.encrypt(plainText);

            // Different IVs should result in different encrypted data
            expect(encrypted1.iv).not.toBe(encrypted2.iv);
            expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData);

            // But both should decrypt to same plaintext
            const decrypted1 = encryptionService.decrypt(encrypted1.encryptedData, encrypted1.iv);
            const decrypted2 = encryptionService.decrypt(encrypted2.encryptedData, encrypted2.iv);
            expect(decrypted1).toBe(plainText);
            expect(decrypted2).toBe(plainText);
        });

        it('should handle special characters and long text', () => {
            const plainText = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>? 🔒🗳️';

            const encrypted = encryptionService.encrypt(plainText);
            const decrypted = encryptionService.decrypt(encrypted.encryptedData, encrypted.iv);

            expect(decrypted).toBe(plainText);
        });
    });

    describe('encryptVote and decryptVote', () => {
        it('should encrypt and decrypt vote data correctly', () => {
            const voteData = {
                candidateId: 5,
                timestamp: new Date().toISOString(),
                sessionId: 'test-session-123'
            };

            const encrypted = encryptionService.encryptVote(voteData);

            expect(encrypted).toBeDefined();
            expect(typeof encrypted).toBe('string');
            expect(encrypted).toContain(':'); // Should contain IV:encryptedData format

            const decrypted = encryptionService.decryptVote(encrypted);

            expect(decrypted).toEqual(voteData);
            expect(decrypted.candidateId).toBe(5);
            expect(decrypted.sessionId).toBe('test-session-123');
        });

        it('should handle complex vote data objects', () => {
            const voteData = {
                candidateId: 10,
                timestamp: new Date().toISOString(),
                sessionId: 'session-456',
                metadata: {
                    browser: 'Chrome',
                    os: 'macOS'
                }
            };

            const encrypted = encryptionService.encryptVote(voteData);
            const decrypted = encryptionService.decryptVote(encrypted);

            expect(decrypted).toEqual(voteData);
            expect(decrypted.metadata.browser).toBe('Chrome');
        });

        it('should return null when decrypting null or empty string', () => {
            expect(encryptionService.decryptVote(null)).toBeNull();
            expect(encryptionService.decryptVote('')).toBeNull();
        });

        it('should throw error with invalid encrypted format', () => {
            expect(() => {
                encryptionService.decryptVote('invalid-format-no-colon');
            }).toThrow();
        });
    });

    describe('algorithm and key management', () => {
        it('should use AES-256-CBC algorithm', () => {
            expect(encryptionService.algorithm).toBe('aes-256-cbc');
        });

        it('should have a 32-byte secret key', () => {
            expect(encryptionService.secretKey).toBeDefined();
            expect(encryptionService.secretKey.length).toBe(32);
        });
    });
});
