/**
 * Frontend utility for RSA Key Exchange
 * Fetches and caches the server's public key for secure communication
 */

class KeyExchangeClient {
    constructor() {
        this.publicKey = null;
        this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    }

    /**
     * Fetch the server's public key
     * @returns {Promise<string>} Public key in PEM format
     */
    async fetchPublicKey() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/keys/public-key`);
            const data = await response.json();

            if (data.success) {
                this.publicKey = data.publicKey;
                console.log('✅ Server public key fetched successfully');
                return this.publicKey;
            } else {
                throw new Error(data.message || 'Failed to fetch public key');
            }
        } catch (error) {
            console.error('❌ Error fetching public key:', error);
            throw error;
        }
    }

    /**
     * Get the cached public key or fetch if not available
     * @returns {Promise<string>} Public key in PEM format
     */
    async getPublicKey() {
        if (!this.publicKey) {
            await this.fetchPublicKey();
        }
        return this.publicKey;
    }

    /**
     * Get key exchange information from server
     * @returns {Promise<object>} Key exchange info
     */
    async getKeyExchangeInfo() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/keys/info`);
            const data = await response.json();

            if (data.success) {
                return data.keyExchange;
            } else {
                throw new Error(data.message || 'Failed to fetch key exchange info');
            }
        } catch (error) {
            console.error('❌ Error fetching key exchange info:', error);
            throw error;
        }
    }

    /**
     * Encrypt data using the server's public key (requires crypto library on client)
     * Note: Browser's Web Crypto API can be used for RSA encryption
     * This is a placeholder - implement based on your crypto library choice
     * 
     * @param {string} data - Data to encrypt
     * @returns {Promise<string>} Encrypted data in base64
     */
    async encryptWithPublicKey(data) {
        const publicKey = await this.getPublicKey();

        // This is a placeholder implementation
        // In production, use Web Crypto API or a library like node-forge
        console.warn('⚠️ Client-side RSA encryption requires Web Crypto API or additional library');
        console.log('Public key available for encryption:', !!publicKey);

        // Example using Web Crypto API (modern browsers):
        // const publicKeyObj = await crypto.subtle.importKey(...);
        // const encrypted = await crypto.subtle.encrypt(...);

        return data; // Placeholder - implement actual encryption
    }

    /**
     * Clear cached public key
     */
    clearCache() {
        this.publicKey = null;
        console.log('🧹 Public key cache cleared');
    }
}

// Export singleton instance
const keyExchangeClient = new KeyExchangeClient();
export default keyExchangeClient;

// Also export the class for custom instances
export { KeyExchangeClient };
