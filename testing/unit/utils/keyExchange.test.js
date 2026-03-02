// Unit tests for app/utils/keyExchange.js
// Tests the KeyExchangeClient class for RSA key exchange functionality

describe('KeyExchangeClient', () => {
    let KeyExchangeClient;
    let client;

    beforeEach(() => {
        // Reset modules and fetch mock before each test
        jest.resetModules();
        global.fetch = jest.fn();
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5001';
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();

        // Dynamically import to reset singleton state
        const module = require('../../../app/utils/keyExchange');
        KeyExchangeClient = module.KeyExchangeClient;
        client = new KeyExchangeClient();
    });

    afterEach(() => {
        console.log.mockRestore();
        console.warn.mockRestore();
        console.error.mockRestore();
    });

    describe('constructor', () => {
        it('should initialize with null publicKey', () => {
            expect(client.publicKey).toBeNull();
        });

        it('should set apiBaseUrl from env variable', () => {
            expect(client.apiBaseUrl).toBe('http://localhost:5001');
        });

        it('should use default URL when env var not set', () => {
            delete process.env.NEXT_PUBLIC_API_URL;
            jest.resetModules();
            const { KeyExchangeClient: FreshClient } = require('../../../app/utils/keyExchange');
            const freshClient = new FreshClient();
            expect(freshClient.apiBaseUrl).toBe('http://localhost:5001');
        });
    });

    describe('fetchPublicKey', () => {
        it('should fetch and cache public key successfully', async () => {
            const mockPublicKey = '-----BEGIN PUBLIC KEY-----\nMOCK_KEY\n-----END PUBLIC KEY-----';

            global.fetch.mockResolvedValue({
                json: () => Promise.resolve({
                    success: true,
                    publicKey: mockPublicKey
                })
            });

            const result = await client.fetchPublicKey();

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:5001/api/keys/public-key'
            );
            expect(result).toBe(mockPublicKey);
            expect(client.publicKey).toBe(mockPublicKey);
        });

        it('should throw error when fetch fails', async () => {
            global.fetch.mockResolvedValue({
                json: () => Promise.resolve({
                    success: false,
                    message: 'Key not available'
                })
            });

            await expect(client.fetchPublicKey()).rejects.toThrow('Key not available');
        });

        it('should throw error on network failure', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));

            await expect(client.fetchPublicKey()).rejects.toThrow('Network error');
        });

        it('should log success message on successful fetch', async () => {
            global.fetch.mockResolvedValue({
                json: () => Promise.resolve({
                    success: true,
                    publicKey: 'MOCK_KEY'
                })
            });

            await client.fetchPublicKey();

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Server public key fetched successfully')
            );
        });
    });

    describe('getPublicKey', () => {
        it('should fetch key if not cached', async () => {
            global.fetch.mockResolvedValue({
                json: () => Promise.resolve({
                    success: true,
                    publicKey: 'CACHED_KEY'
                })
            });

            const result = await client.getPublicKey();

            expect(result).toBe('CACHED_KEY');
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should return cached key without fetching again', async () => {
            client.publicKey = 'ALREADY_CACHED';

            const result = await client.getPublicKey();

            expect(result).toBe('ALREADY_CACHED');
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    describe('getKeyExchangeInfo', () => {
        it('should fetch key exchange info successfully', async () => {
            const mockInfo = {
                algorithm: 'RSA',
                keySize: 2048,
                createdAt: '2026-01-01T00:00:00Z'
            };

            global.fetch.mockResolvedValue({
                json: () => Promise.resolve({
                    success: true,
                    keyExchange: mockInfo
                })
            });

            const result = await client.getKeyExchangeInfo();

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:5001/api/keys/info'
            );
            expect(result).toEqual(mockInfo);
        });

        it('should throw error when info fetch fails', async () => {
            global.fetch.mockResolvedValue({
                json: () => Promise.resolve({
                    success: false,
                    message: 'Info not available'
                })
            });

            await expect(client.getKeyExchangeInfo()).rejects.toThrow('Info not available');
        });
    });

    describe('clearCache', () => {
        it('should set publicKey to null', () => {
            client.publicKey = 'SOME_KEY';
            client.clearCache();

            expect(client.publicKey).toBeNull();
        });

        it('should log cache cleared message', () => {
            client.clearCache();

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Public key cache cleared')
            );
        });
    });

    describe('encryptWithPublicKey', () => {
        it('should return data (placeholder implementation)', async () => {
            client.publicKey = 'MOCK_KEY';

            const result = await client.encryptWithPublicKey('sensitive data');

            expect(result).toBe('sensitive data');
        });

        it('should fetch public key if not cached before encrypting', async () => {
            global.fetch.mockResolvedValue({
                json: () => Promise.resolve({
                    success: true,
                    publicKey: 'FETCHED_KEY'
                })
            });

            await client.encryptWithPublicKey('data');

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });
});
