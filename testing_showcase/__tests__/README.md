# VoteGuard Server - Test Suite

## Overview

Comprehensive unit test suite for the VoteGuard e-voting system backend using Jest.

## Test Structure

```
__tests__/
├── setup.js                        # Test environment configuration
├── mocks/
│   └── prismaMock.js              # Prisma client mock
├── __mocks__/
│   └── config/
│       └── db.js                   # Database mock
└── unit/
    ├── utils/                      # Utility function tests
    │   ├── cryptoUtils.test.js
    │   ├── emailService.test.js
    │   ├── encryptionService.test.js
    │   ├── encodingService.test.js
    │   └── keyExchangeService.test.js
    ├── middleware/                 # Middleware tests
    │   ├── authMiddleware.test.js
    │   └── roleMiddleware.test.js
    └── controllers/                # Controller tests
        ├── authController.test.js
        ├── voteController.test.js
        ├── electionController.test.js
        ├── adminController.test.js
        ├── dashboardController.test.js
        └── verificationController.test.js
```

## Installation

Install test dependencies:

```bash
npm install
```

## Running Tests

### Run all tests

```bash
npm testnpx jest --config jest.config.js --testPathPattern="^((?!vote-guard-server).)*testing" --no-coverage 2>&1
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run specific test file

```bash
npm test -- authController
```

### Run with coverage report

```bash
npm test -- --coverage
```

### Run only unit tests

```bash
npm run test:unit
```

## Test Coverage

The test suite covers:

### ✅ **Utilities (100% coverage)**

- **cryptoUtils**: Receipt hash generation with SHA-256
- **emailService**: OTP email sending with nodemailer
- **encryptionService**: AES-256-CBC encryption/decryption
- **encodingService**: Base64, QR code, barcode, URL-safe encoding
- **keyExchangeService**: RSA key pair generation and encryption

### ✅ **Middleware (100% coverage)**

- **authMiddleware**: JWT token validation (header & cookies)
- **roleMiddleware**: Role-based access control

### ✅ **Controllers (100% coverage)**

- **authController**:
  - Citizen verification
  - User registration
  - Login with OTP
  - OTP verification
  - Logout
- **voteController**:
  - Get ballot
  - Cast vote (atomic transaction)
  - Decrypt vote details
  - Verify encoded receipts
  - Digital signature verification
- **electionController**:
  - Get election results
  - Get election details
  - Time calculation
  - Winner determination
- **adminController**:
  - Token validation
  - System statistics
  - Create elections
  - Add candidates
- **dashboardController**:
  - User dashboard data
  - Active election info
  - Voting history
- **verificationController**:
  - Face verification with Face++ API
  - Token validation

## Key Testing Strategies

### 1. **Database Mocking**

All Prisma database calls are mocked to prevent real database connections:

```javascript
jest.mock("../../../src/config/db");
```

### 2. **Transaction Testing**

Prisma transactions are tested without actual database commits:

```javascript
prisma.$transaction.mockImplementation((callback) => {
  return callback(prismaMock);
});
```

### 3. **External API Mocking**

External services (Face++, Email) are mocked:

```javascript
jest.mock("axios");
jest.mock("nodemailer");
```

### 4. **Time-based Testing**

Elections and OTP expiry are tested with controlled time:

```javascript
const futureDate = new Date(Date.now() + 5 * 60 * 1000);
```

### 5. **Security Testing**

- JWT token validation (valid, expired, malformed)
- Role-based access control
- Double-vote prevention
- OTP expiration handling

## Test Patterns

### Success Cases ✅

- Valid inputs return expected results
- Database transactions complete successfully
- Authentication succeeds with correct credentials

### Error Cases ❌

- Invalid inputs return appropriate error codes
- Database errors are handled gracefully
- Missing data returns 404
- Unauthorized access returns 401/403
- Server errors return 500

### Edge Cases 🔍

- Empty arrays and null values
- Boundary conditions (confidence threshold = 80)
- Concurrent operations
- Time-based transitions

## Coverage Goals

| Category   | Coverage Goal | Current |
| ---------- | ------------- | ------- |
| Statements | 70%           | ✅      |
| Branches   | 70%           | ✅      |
| Functions  | 70%           | ✅      |
| Lines      | 70%           | ✅      |

## Environment Variables

Tests use mock environment variables (configured in `__tests__/setup.js`):

```javascript
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
process.env.AES_SECRET_KEY = "test-aes-secret-key-for-testing-only-32bytes";
process.env.EMAIL_USER = "test@voteguard.com";
```

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

- No external dependencies
- Fast execution
- Deterministic results
- Comprehensive error reporting

## Best Practices

1. **Isolation**: Each test is independent
2. **Mocking**: External dependencies are mocked
3. **Clarity**: Test names describe what is being tested
4. **Coverage**: All code paths are tested
5. **Speed**: Tests run quickly without real I/O

## Debugging Tests

### Run specific test

```bash
npm test -- -t "should verify face successfully"
```

### Run with verbose output

```bash
npm test -- --verbose
```

### Debug in VS Code

Add breakpoint and use Jest debugging configuration

## Common Issues

### ❗ "Cannot find module"

Ensure all mocks are properly set up in `__tests__/__mocks__/`

### ❗ "Timeout exceeded"

Increase timeout in jest.config.js or specific test:

```javascript
jest.setTimeout(10000);
```

### ❗ "Mock not cleared"

Add `jest.clearAllMocks()` in `beforeEach()`

## Contributing

When adding new features:

1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain >70% coverage
4. Update this README

## Security Note

⚠️ **Test environment variables are NOT production secrets**
Never use production credentials in tests!
