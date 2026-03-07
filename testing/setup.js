// Frontend test setup file
// Runs before all frontend tests

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5001';

// Mock window.matchMedia (used by some UI components)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
};

// Mock fetch globally
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
    })
);

// Suppress console warnings during tests
jest.spyOn(console, 'warn').mockImplementation(() => { });

// Global test timeout
jest.setTimeout(10000);
