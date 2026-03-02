// Test helper utilities
// Common test utilities and helper functions

/**
 * Creates a mock request object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock request object
 */
const mockRequest = (overrides = {}) => {
    return {
        user: { user_id: 1 },
        body: {},
        params: {},
        query: {},
        headers: {},
        ip: '127.0.0.1',
        cookies: {},
        header: jest.fn(),
        ...overrides
    };
};

/**
 * Creates a mock response object
 * @returns {Object} Mock response object with Jest functions
 */
const mockResponse = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
        send: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn()
    };
    // Chain status().json() calls
    res.status.mockReturnValue(res);
    return res;
};

/**
 * Creates a mock next function
 * @returns {Function} Jest mock function
 */
const mockNext = () => jest.fn();

/**
 * Creates a future date (for testing election end times, OTP expiry)
 * @param {number} minutesFromNow - Minutes from current time
 * @returns {Date} Future date
 */
const futureDate = (minutesFromNow = 5) => {
    return new Date(Date.now() + minutesFromNow * 60 * 1000);
};

/**
 * Creates a past date
 * @param {number} minutesAgo - Minutes before current time
 * @returns {Date} Past date
 */
const pastDate = (minutesAgo = 5) => {
    return new Date(Date.now() - minutesAgo * 60 * 1000);
};

/**
 * Generates a mock JWT token
 * @param {Object} payload - Token payload
 * @returns {string} Mock JWT token
 */
const mockJWT = (payload = { user_id: 1, role: 'voter' }) => {
    return 'mock.jwt.token.' + Buffer.from(JSON.stringify(payload)).toString('base64');
};

/**
 * Suppresses console output during tests
 */
const suppressConsole = () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
        console.warn.mockRestore();
    });
};

/**
 * Creates mock user data
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock user object
 */
const mockUser = (overrides = {}) => ({
    userId: 1,
    username: 'testuser',
    passwordHash: 'hashedpassword',
    role: 'voter',
    citizenId: 'CIT001',
    citizen: {
        fullName: 'Test User',
        email: 'test@example.com',
        mobile: '1234567890',
        constituency: 'District-1',
        ward: 'Ward-A',
        isRegistered: true,
        photoUrl: 'https://example.com/photo.jpg'
    },
    ...overrides
});

/**
 * Creates mock election data
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock election object
 */
const mockElection = (overrides = {}) => ({
    id: 1,
    title: 'Test Election',
    description: 'Test Description',
    constituency: 'District-1',
    status: 'LIVE',
    startTime: pastDate(60),
    endTime: futureDate(120),
    candidates: [],
    votes: [],
    ...overrides
});

/**
 * Creates mock candidate data
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock candidate object
 */
const mockCandidate = (overrides = {}) => ({
    id: 1,
    name: 'Test Candidate',
    party: 'Test Party',
    symbol: 'TP',
    age: 45,
    education: 'MBA',
    experience: '10 years',
    keyPoints: ['Point 1', 'Point 2'],
    voteCount: 0,
    electionId: 1,
    ...overrides
});

/**
 * Creates mock vote data
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock vote object
 */
const mockVote = (overrides = {}) => ({
    id: 1,
    userId: 1,
    electionId: 1,
    candidateId: 1,
    receiptHash: '0x' + 'a'.repeat(64),
    timestamp: new Date(),
    encryptedDetails: 'iv:encrypted',
    ...overrides
});

module.exports = {
    mockRequest,
    mockResponse,
    mockNext,
    futureDate,
    pastDate,
    mockJWT,
    suppressConsole,
    mockUser,
    mockElection,
    mockCandidate,
    mockVote
};
