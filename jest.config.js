const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/testing/setup.js'],
    testMatch: [
        '**/testing/**/*.test.js'
    ],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/testing/mocks/styleMock.js',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/testing/mocks/fileMock.js',
        '^@/(.*)$': '<rootDir>/$1'
    },
    collectCoverageFrom: [
        'app/**/*.js',
        'middleware.js',
        '!app/layout.js',
        '!app/globals.css',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    clearMocks: true
};

module.exports = createJestConfig(customJestConfig);
