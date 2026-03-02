// Test setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.AES_SECRET_KEY = 'test-aes-secret-key-for-testing-only-32bytes';
process.env.EMAIL_USER = 'test@voteguard.com';
process.env.EMAIL_PASS = 'test-password';
process.env.FACE_API_KEY = 'test-face-api-key';
process.env.FACE_API_SECRET = 'test-face-api-secret';
process.env.FACE_API_URL = 'https://api-test.faceplusplus.com/facepp/v3/compare';

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs during tests (optional)
// global.console = {
//     ...console,
//     log: jest.fn(),
//     error: jest.fn(),
//     warn: jest.fn(),
// };
