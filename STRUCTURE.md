# VoteGuard - Authentication Flow Structure

## 📁 Project Structure

```
cloud/
├── app/
│   ├── page.js              # Home page (redirects to /login)
│   ├── login/
│   │   └── page.js          # Login & Registration page
│   ├── dashboard/
│   │   └── page.js          # Protected dashboard (after login)
│   ├── layout.js            # Root layout
│   └── globals.css          # Global styles
├── middleware.js            # Route protection middleware
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 🔐 Authentication Flow

1. **Landing Page (`/`)**: Automatically redirects users to `/login`
2. **Login Page (`/login`)**:
   - Sign in with username/password
   - Two-factor authentication (Mobile & Email OTP)
   - Registration wizard for new users
   - After successful 2FA, redirects to `/dashboard`
3. **Dashboard (`/dashboard`)**: Protected route showing user's voting portal

## 🚀 Routes

- **`/`** → Redirects to `/login`
- **`/login`** → Authentication page (sign in & register)
- **`/dashboard`** → User dashboard (protected, accessible after login)

## 🛡️ Middleware Protection

The `middleware.js` file protects dashboard routes. Currently configured to allow access, but can be extended with proper authentication checks:

```javascript
// Check for auth tokens/session
// Redirect to /login if not authenticated
```

## 💡 Usage

1. Start the development server:

```bash
npm run dev
```

2. Open http://localhost:3000
3. You'll be redirected to `/login`
4. After completing 2FA, you'll be redirected to `/dashboard`

## 🔄 Login Flow

```
User visits /
  ↓
Redirects to /login
  ↓
Enters credentials
  ↓
Mobile OTP verification
  ↓
Email OTP verification
  ↓
Redirects to /dashboard ✓
```

## 📝 Mock Credentials

For testing, use these citizen IDs:

- `987654321012` (Aarav Sharma)
- `123456789012` (Priya Venkatesh)

## 🎨 Features

- ✅ Next.js App Router structure
- ✅ Client-side routing with redirects
- ✅ Two-factor authentication flow
- ✅ Protected dashboard route
- ✅ Responsive design with Tailwind CSS
- ✅ Framer Motion animations
- ✅ Mock government database integration

## 🔧 Next Steps

To implement real authentication:

1. Add session/token management
2. Update middleware to check auth status
3. Implement API routes for authentication
4. Add database integration
5. Implement secure token storage
