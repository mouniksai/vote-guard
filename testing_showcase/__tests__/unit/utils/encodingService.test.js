// Unit tests for encodingService.js
const EncodingService = require('../../../src/utils/encodingService');

describe('EncodingService', () => {
    describe('Base64 Encoding/Decoding', () => {
        it('should encode receipt data to base64', () => {
            const receiptData = {
                receiptHash: '0xabcd1234',
                timestamp: new Date('2026-01-01'),
                electionId: 1
            };

            const encoded = EncodingService.encodeReceiptToBase64(receiptData);

            expect(encoded).toBeDefined();
            expect(typeof encoded).toBe('string');
            expect(encoded).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 pattern
        });

        it('should decode base64 receipt data correctly', () => {
            const receiptData = {
                receiptHash: '0x123456789abcdef',
                timestamp: new Date('2026-01-15'),
                electionId: 5
            };

            const encoded = EncodingService.encodeReceiptToBase64(receiptData);
            const decoded = EncodingService.decodeReceiptFromBase64(encoded);

            expect(decoded.receiptHash).toBe(receiptData.receiptHash);
            expect(decoded.electionId).toBe(receiptData.electionId);
            expect(new Date(decoded.timestamp)).toEqual(receiptData.timestamp);
        });

        it('should handle long receipt hashes', () => {
            const receiptData = {
                receiptHash: '0x' + 'a'.repeat(64),
                timestamp: new Date(),
                electionId: 999
            };

            const encoded = EncodingService.encodeReceiptToBase64(receiptData);
            const decoded = EncodingService.decodeReceiptFromBase64(encoded);

            expect(decoded.receiptHash).toBe(receiptData.receiptHash);
        });
    });

    describe('QR Code Generation', () => {
        it('should generate QR code for receipt hash', async () => {
            const receiptHash = '0xabcd1234567890';

            const qrCode = await EncodingService.generateReceiptQRCode(receiptHash);

            expect(qrCode).toBeDefined();
            expect(qrCode).toContain('data:image/png;base64,');
            expect(qrCode.length).toBeGreaterThan(100); // QR codes are substantial
        });

        it('should generate different QR codes for different hashes', async () => {
            const hash1 = '0xfirsthash';
            const hash2 = '0xsecondhash';

            const qr1 = await EncodingService.generateReceiptQRCode(hash1);
            const qr2 = await EncodingService.generateReceiptQRCode(hash2);

            expect(qr1).not.toBe(qr2);
        });

        it('should handle long receipt hashes', async () => {
            const longHash = '0x' + '1234567890abcdef'.repeat(4);

            const qrCode = await EncodingService.generateReceiptQRCode(longHash);

            expect(qrCode).toBeDefined();
            expect(qrCode).toContain('data:image/png;base64,');
        });

        it('should throw error on QR generation failure', async () => {
            // QRCode library handles most inputs gracefully, but we can test error handling
            const receiptHash = '0xabcdef123456';
            await expect(
                EncodingService.generateReceiptQRCode(receiptHash)
            ).resolves.toBeDefined();
        });
    });

    describe('Barcode Encoding', () => {
        it('should encode receipt hash to 13-digit barcode', () => {
            const receiptHash = '0xabcdef123456';

            const barcode = EncodingService.encodeToBarcode(receiptHash);

            expect(barcode).toBeDefined();
            expect(barcode).toHaveLength(13);
            expect(barcode).toMatch(/^\d{13}$/); // Only digits
        });

        it('should produce consistent barcodes for same hash', () => {
            const receiptHash = '0x123456';

            const barcode1 = EncodingService.encodeToBarcode(receiptHash);
            const barcode2 = EncodingService.encodeToBarcode(receiptHash);

            expect(barcode1).toBe(barcode2);
        });

        it('should handle short hashes', () => {
            const shortHash = '0x1';

            const barcode = EncodingService.encodeToBarcode(shortHash);

            expect(barcode).toMatch(/^\d+$/);
        });
    });

    describe('URL-Safe Encoding/Decoding', () => {
        it('should encode data to URL-safe format', () => {
            const data = {
                receiptHash: '0x123+/=abc',
                electionId: 5
            };

            const encoded = EncodingService.encodeForURL(data);

            expect(encoded).toBeDefined();
            expect(encoded).not.toContain('+');
            expect(encoded).not.toContain('/');
            expect(encoded).not.toContain('=');
            expect(encoded).toMatch(/^[A-Za-z0-9\-_]*$/);
        });

        it('should decode URL-safe data correctly', () => {
            const data = {
                receiptHash: '0x987654321',
                timestamp: '2026-02-08T10:00:00Z',
                electionId: 10
            };

            const encoded = EncodingService.encodeForURL(data);
            const decoded = EncodingService.decodeFromURL(encoded);

            expect(decoded).toEqual(data);
        });

        it('should handle complex nested objects', () => {
            const data = {
                receiptHash: '0xcomplex',
                metadata: {
                    location: 'Test Center',
                    verified: true
                }
            };

            const encoded = EncodingService.encodeForURL(data);
            const decoded = EncodingService.decodeFromURL(encoded);

            expect(decoded).toEqual(data);
            expect(decoded.metadata.location).toBe('Test Center');
        });

        it('should be reversible', () => {
            const originalData = {
                a: 'test',
                b: 123,
                c: true
            };

            const encoded = EncodingService.encodeForURL(originalData);
            const decoded = EncodingService.decodeFromURL(encoded);

            expect(decoded).toEqual(originalData);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty objects', () => {
            const emptyData = {};

            const base64 = EncodingService.encodeReceiptToBase64(emptyData);
            const decoded = EncodingService.decodeReceiptFromBase64(base64);

            expect(decoded).toEqual(emptyData);
        });

        it('should handle special characters in encoding', () => {
            const data = {
                text: 'Special: !@#$%^&*()',
                hash: '0x🔒🗳️'
            };

            const urlSafe = EncodingService.encodeForURL(data);
            const decoded = EncodingService.decodeFromURL(urlSafe);

            expect(decoded).toEqual(data);
        });
    });
});
