# VoteGuard Frontend — Test Suite

## Overview

Unit and component test suite for the VoteGuard Next.js frontend using **Jest** and **React Testing Library**.

## Test Structure

```
testing/
├── setup.js                              # Test environment (mocks for fetch, browser)
├── run-tests.ps1                         # Windows PowerShell test runner
├── mocks/
│   ├── nextNavigation.js                 # Mock for next/navigation
│   ├── styleMock.js                      # Mock for CSS imports
│   └── fileMock.js                       # Mock for static file imports
└── unit/
    ├── utils/
    │   ├── keyExchange.test.js           # RSA key exchange client
    │   └── cookieUtils.test.js           # Cookie get/set/delete helpers
    ├── middleware/
    │   └── middleware.test.js            # Next.js edge middleware routing
    └── pages/
        ├── login.test.js                 # Login/register page flows
        ├── dashboard.test.js             # Voter dashboard page
        └── adminDashboard.test.js        # Admin dashboard page
```

## Running Tests

```powershell
# Install dependencies first
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom

# Run all tests
npx jest --config jest.config.js

# Run via PowerShell runner
.\testing\run-tests.ps1 all
.\testing\run-tests.ps1 utils
.\testing\run-tests.ps1 pages
.\testing\run-tests.ps1 coverage
```

## Test Coverage

| Category     | Files | Tests |
|------------- |-------|-------|
| Utilities    | 2     | 19    |
| Middleware   | 1     | 9     |
| Pages        | 3     | 25+   |
| **Total**    | **6** | **53+**|

## Key Testing Strategies

- **Browser API Mocking** — `fetch`, `matchMedia`, `IntersectionObserver` mocked globally
- **Next.js Navigation** — `useRouter`, `usePathname` mocked for route testing
- **Cookie Management** — document.cookie reset per test for isolation
- **Role-Based Auth** — Admin vs voter redirection tested thoroughly
