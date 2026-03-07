<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=for-the-badge&logo=ethereum" alt="Ethereum" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

# VoteGuard — Blockchain-Based Secure Voting System

**VoteGuard** is a production-ready electronic voting platform that combines traditional database authentication with **Ethereum blockchain** technology for transparent, tamper-proof vote recording. Every vote is encrypted, digitally signed, and stored as an immutable transaction on the Sepolia testnet.

> **[View Full Documentation →](https://mouniksai.github.io/voteguard-docs/)** — API Reference, Setup Guides, Architecture & more.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Commands](#available-commands)
- [Team Collaboration](#team-collaboration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

> **[Full Documentation →](https://sanjjiiev.github.io/voteguard-docs/)** — Complete API reference, setup guides, and architecture overview.

## Key Features

| Category | Description |
|:---|:---|
| **Blockchain Voting** | All votes recorded on Ethereum Sepolia via Solidity smart contracts — immutable and publicly verifiable |
| **Two-Factor Authentication** | Password verification followed by Email OTP for every login attempt |
| **Government Registry** | Citizen ID validated against a PostgreSQL-backed government database before registration |
| **RSA-2048 Encryption** | Asymmetric key exchange enables end-to-end encrypted communication between client and server |
| **Cryptographic Receipts** | SHA-256 hashed vote receipts allow voters to independently verify their vote was recorded |
| **Real-Time Team Sync** | All team members connected to the same smart contract see synchronized election data instantly |
| **Role-Based Access** | Admin panel with election creation, candidate management, and system statistics |
| **Digital Signatures** | Every vote transaction is digitally signed for non-repudiation |

---

## Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│   Next.js 14    │──────>│  Express.js API   │──────>│  Ethereum Sepolia    │
│   (Frontend)    │       │  (Backend)        │       │  (Smart Contracts)   │
│   Port 3000     │       │  Port 5001        │       │  Chain ID: 11155111  │
└─────────────────┘       └────────┬─────────┘       └──────────────────────┘
                                   │
                          ┌────────▼─────────┐
                          │   PostgreSQL     │
                          │   (Supabase)     │
                          │   User Identity  │
                          │   & Auth Only    │
                          └──────────────────┘
```

**Hybrid Storage Model:**
- **PostgreSQL** — User identity, authentication credentials, government registry records
- **Ethereum Blockchain** — Elections, candidates, votes, audit logs (immutable on-chain)

---

## Tech Stack

| Component | Technology | Role |
|:---|:---|:---|
| Frontend | Next.js 14, React, Tailwind CSS, Framer Motion | Voter portal, admin panel, ballot interface |
| Backend | Node.js 18, Express.js 5 | REST API server, business logic |
| Database | PostgreSQL (Supabase), Prisma ORM | Identity management, auth storage |
| Blockchain | Ethereum Sepolia, Solidity 0.8.20, Hardhat | Smart contract execution, vote storage |
| RPC Provider | Alchemy (free tier) | Blockchain read/write access |
| Authentication | JWT, bcryptjs, Email OTP (Nodemailer) | Session management, 2FA |
| Encryption | RSA-2048, SHA-256 | Key exchange, receipt hashing |
| Testing | Jest, Supertest, Hardhat Test | Unit, integration, contract tests |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MetaMask** browser extension
- **Alchemy** account ([Get a free API key](https://dashboard.alchemy.com/))
- **Sepolia ETH** ([Request from faucet](https://sepoliafaucet.com/))
- **PostgreSQL** instance (or [Supabase](https://supabase.com/) free tier)

### 1. Clone and Install

```bash
git clone https://github.com/mouniksai/vote-guard.git
cd vote-guard
```

### 2. Backend Setup

```bash
cd vote-guard-server
npm install
cp .env.example .env    # Configure your keys (see Environment Variables below)
npx prisma generate
npx prisma db push
npm run dev
```

On success, the terminal will display:
```
✅ Connected to Sepolia blockchain
📜 Contract: 0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
✅ VOTEGUARD SERVER RUNNING! (Port 5001)
```

### 3. Frontend Setup

```bash
cd ..                   # Back to root directory
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Connect Wallet

1. Install MetaMask and switch to **Sepolia Test Network**
2. Click "Connect Wallet" on any voting page
3. Approve the network switch prompt
4. You're ready to cast votes

---

## Environment Variables

### Backend (`vote-guard-server/.env`)

```env
# Server
PORT=5001

# Database
DATABASE_URL=postgresql://user:password@host:5432/vote_guard?schema=public

# Blockchain
BLOCKCHAIN_NETWORK=sepolia
CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
ALCHEMY_API_KEY=your_alchemy_api_key
SEPOLIA_PRIVATE_KEY=your_wallet_private_key

# Security
JWT_SECRET=your_jwt_secret

# Email Service (for OTP delivery)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_CHAIN_ID=11155111
```

> **Security:** Never commit `.env` files to version control. Use a dedicated test wallet for development — never purchase testnet ETH.

---

## Project Structure

```
vote-guard/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel (election management)
│   ├── dashboard/                # Voter dashboard
│   ├── docs/                     # Documentation page
│   ├── login/                    # Authentication (2FA flow)
│   ├── results/                  # Election results
│   ├── vote/                     # Ballot and voting interface
│   ├── verify/                   # Vote verification
│   ├── verify-receipt/           # Receipt verification
│   ├── verify-signature/         # Digital signature verification
│   ├── vote-history/             # Voting history
│   ├── components/               # Shared UI components
│   ├── utils/                    # Frontend utilities
│   ├── layout.js                 # Root layout
│   └── page.js                   # Landing page
├── middleware.js                  # Route protection (JWT validation)
├── vote-guard-server/            # Express.js Backend (see server README)
│   ├── contracts/                # Solidity smart contracts
│   ├── prisma/                   # Database schema
│   ├── src/
│   │   ├── blockchain/           # Sepolia blockchain integration
│   │   ├── controllers/          # Business logic (7 controllers)
│   │   ├── middleware/           # Auth & role-based access control
│   │   ├── routes/               # API route definitions (8 modules)
│   │   └── utils/                # Crypto, email, encoding, RSA keys
│   └── server.js                 # Server entry point
├── testing/                      # Test infrastructure
└── voteguard-docs/               # Standalone documentation site
```

---

## Available Commands

### Frontend

```bash
npm run dev              # Start development server (port 3000)
npm run build            # Create production build
npm run start            # Run production server
npm run lint             # Run ESLint
npm run test             # Run Jest unit tests
npm run test:coverage    # Run tests with coverage report
```

### Backend

```bash
cd vote-guard-server
npm run dev              # Start with nodemon (auto-restart)
npm run start            # Start production server
npm run test             # Run Jest tests with coverage
npm run test:unit        # Run unit tests only
```

### Blockchain

```bash
cd vote-guard-server
npx hardhat compile      # Compile Solidity contracts
npx hardhat test         # Run contract test suite
```

---

## Team Collaboration

All team members connecting to the **same contract address** will see synchronized data:

1. Member A creates an election → visible to all instantly
2. Member B casts a vote → reflected across all connected instances
3. No manual syncing, database exports, or merge conflicts needed

Ensure all `.env` files use the same `CONTRACT_ADDRESS` and `BLOCKCHAIN_NETWORK=sepolia`.

---

## Deployment

### Docker

```bash
# Backend
cd vote-guard-server
docker build -t voteguard-server .
docker run -p 5001:5001 --env-file .env voteguard-server

# Frontend
cd ..
docker build -t voteguard-frontend .
docker run -p 3000:3000 voteguard-frontend
```

See [TEAM_SYNC_SETUP_GUIDE.md](TEAM_SYNC_SETUP_GUIDE.md) for multi-member deployment configuration.

---

## Troubleshooting

| Problem | Solution |
|:---|:---|
| Backend won't start | Verify `SEPOLIA_PRIVATE_KEY` and `ALCHEMY_API_KEY` in `.env` |
| Wrong network error | Switch MetaMask to Sepolia (Settings → Advanced → Show test networks) |
| Slow transactions | Normal — Sepolia takes 15–30 seconds. Check status on [Etherscan](https://sepolia.etherscan.io/) |
| Team data mismatch | Ensure identical `CONTRACT_ADDRESS` and `BLOCKCHAIN_NETWORK` across all `.env` files |
| OTP not received | Verify `EMAIL_USER` and `EMAIL_PASS`. For Gmail, generate an App Password |
| Prisma schema errors | Run `npx prisma generate` then `npx prisma db push` |

---

## External Links

- [Smart Contract on Etherscan](https://sepolia.etherscan.io/address/0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2)
- [Alchemy Dashboard](https://dashboard.alchemy.com/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [MetaMask](https://metamask.io/)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---
