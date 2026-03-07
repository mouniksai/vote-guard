---
title: VoteGuard Frontend
emoji: 🗳️
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# VoteGuard - Blockchain-Based Secure Voting System

<p align="center">
  <h1 align="center">🛡️ VoteGuard</h1>
  <p align="center"><strong>Blockchain-Based Secure Electronic Voting System</strong></p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-5.x-white?style=flat&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=flat&logo=ethereum" alt="Ethereum" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat" alt="License" />
</p>

---

VoteGuard is a production-ready electronic voting system that combines **PostgreSQL** for identity management with **Ethereum blockchain** for transparent, tamper-proof vote recording. Every vote is encrypted, digitally signed, and stored immutably on the Sepolia testnet.

> **[Full Documentation →](https://sanjjiiev.github.io/voteguard-docs/)** — Complete API reference, setup guides, and architecture overview.

## ✨ Key Features

| Feature | Description |
|:---|:---|
| ⛓️ **Blockchain Voting** | Votes recorded on Ethereum Sepolia via Solidity smart contracts |
| 🔐 **Two-Factor Auth** | Password + Email OTP for every login |
| 🏛️ **Govt Registry** | Citizen ID validated against PostgreSQL government database |
| 🔑 **RSA Encryption** | RSA-2048 key exchange for end-to-end encrypted communication |
| 🧾 **Vote Receipts** | SHA-256 cryptographic receipts for independent verification |
| 👥 **Team Sync** | All team members share the same blockchain state in real-time |

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  Next.js 14  │────▶│  Express.js API   │────▶│  Ethereum Sepolia    │
│  (Frontend)  │     │  (Backend)        │     │  (Smart Contracts)   │
│  Port 3000   │     │  Port 5001        │     │  Chain ID: 11155111  │
└─────────────┘     └────────┬─────────┘     └──────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   PostgreSQL     │
                    │   (Supabase)     │
                    │   Identity &     │
                    │   Auth Only      │
                    └──────────────────┘
```

## 🚀 Quick Start

### 1. Backend

```bash
cd vote-guard-server
npm install
cp .env.example .env    # Edit with your keys
npm run dev
```

**Expected:** `✅ VOTEGUARD SERVER RUNNING!` on port 5001

### 2. Frontend

```bash
cd ..                   # Back to root
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Connect Wallet

1. Install [MetaMask](https://metamask.io/) browser extension
2. Switch to **Sepolia Test Network**
3. Get free ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

## 🔧 Environment Variables

### Backend (`vote-guard-server/.env`)

```env
BLOCKCHAIN_NETWORK=sepolia
CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
ALCHEMY_API_KEY=your_alchemy_key
SEPOLIA_PRIVATE_KEY=your_private_key
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
NEXT_PUBLIC_CHAIN_ID=11155111
```

## 📁 Project Structure

```
vote-guard/
├── app/                      # Next.js App Router
│   ├── docs/                 # 📚 Documentation page
│   ├── login/                # Authentication (2FA)
│   ├── dashboard/            # Voter dashboard
│   ├── admin/                # Admin panel
│   ├── vote/                 # Ballot & voting
│   ├── results/              # Election results
│   ├── verify/               # Vote verification
│   └── middleware.js          # Route protection
├── vote-guard-server/        # Express.js Backend
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/        # Auth & role middleware
│   │   ├── blockchain/       # Sepolia integration
│   │   └── utils/            # Crypto, email, encoding
│   ├── contracts/            # Solidity smart contracts
│   ├── prisma/               # Database schema
│   └── server.js             # Entry point
└── testing/                  # Test suites
```

## 🧪 Commands

```bash
# Backend
cd vote-guard-server
npm run dev              # Start dev server
npm run test             # Run tests with coverage

# Frontend
npm run dev              # Start Next.js
npm run build            # Production build
npm run test             # Run Jest tests

# Blockchain
cd vote-guard-server
npx hardhat compile      # Compile contracts
npx hardhat test         # Test contracts
```

## 🌐 Links

- **Smart Contract**: [View on Etherscan](https://sepolia.etherscan.io/address/0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2)
- **Alchemy Dashboard**: [dashboard.alchemy.com](https://dashboard.alchemy.com/)
- **Sepolia Faucet**: [sepoliafaucet.com](https://sepoliafaucet.com/)

## 🔐 Security Notes

- Never commit `.env` files to Git
- Use dedicated test wallets for development
- Get free Sepolia ETH from faucets (never buy test ETH)
- All votes are publicly verifiable on blockchain (by design)

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**Made with 🛡️ by the VoteGuard Team** — 3rd Year CSE Project
