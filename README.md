# VoteGuard - Blockchain-Based Secure Voting System

VoteGuard is a production-ready electronic voting system that combines traditional database authentication with Ethereum blockchain for transparent, tamper-proof vote recording.

## 🌟 Key Features

- **Blockchain-Powered Voting**: All votes recorded on Sepolia Ethereum testnet
- **Citizen Verification**: Identity verification against Government Registry (PostgreSQL)
- **Team Synchronization**: All team members see the same data in real-time
- **Smart Contract Storage**: Immutable vote records using Solidity smart contracts
- **Zero Local Dependencies**: No local blockchain files or sync issues
- **Secure Authentication**: JWT-based auth with cookie sessions
- **Modern Stack**: Next.js frontend, Express.js backend, Ethereum blockchain

## 🏗️ Architecture

### Database Layer

- **PostgreSQL (Supabase)**: Citizen registry and user authentication
- **Ethereum Sepolia**: All voting data (elections, candidates, votes)

### Blockchain Layer

- **Smart Contract**: `0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2`
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **RPC Provider**: Alchemy (free tier)

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, Prisma ORM
- **Blockchain**: Solidity 0.8.20, Hardhat, Ethers.js v6
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT, bcryptjs

## 📋 Prerequisites

- Node.js v18 or higher
- MetaMask browser extension
- Alchemy account (free)
- Sepolia testnet ETH (from faucet)

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd vote-guard-server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add:
# - ALCHEMY_API_KEY (from https://dashboard.alchemy.com/)
# - SEPOLIA_PRIVATE_KEY (from MetaMask)
# - DATABASE_URL (your Supabase connection)

# Start backend
npm run dev
```

**Expected Output:**

```
✅ Connected to Sepolia blockchain
📜 Contract: 0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
✅ VOTEGUARD SERVER RUNNING!
```

### 2. Frontend Setup

```bash
cd ..  # Back to root

# Install dependencies
npm install

# Environment is pre-configured in .env.local

# Start frontend
npm run dev
```

Open http://localhost:3000

### 3. Connect Wallet

1. Click "Connect Wallet" or visit any voting page
2. MetaMask will prompt you to switch to Sepolia network
3. Approve the network switch
4. You're ready to vote!

## 📚 Documentation

- **Team Setup Guide**: [TEAM_SYNC_SETUP_GUIDE.md](TEAM_SYNC_SETUP_GUIDE.md) - Complete setup for team members
- **Migration Summary**: [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md) - What changed from local to Sepolia
- **Project Structure**: [STRUCTURE.md](STRUCTURE.md) - Code organization

## 🔧 Environment Variables

### Backend (.env)

```env
# Blockchain
BLOCKCHAIN_NETWORK=sepolia
CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
ALCHEMY_API_KEY=your_alchemy_key
SEPOLIA_PRIVATE_KEY=your_private_key

# Database
DATABASE_URL=your_supabase_connection_string

# Security
JWT_SECRET=your_jwt_secret
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## 🎯 Key Commands

```bash
# Backend
cd vote-guard-server
npm install          # Install dependencies
npm run dev          # Start development server
npm run test         # Run tests

# Frontend
npm install          # Install dependencies
npm run dev          # Start Next.js
npm run build        # Build for production

# Blockchain
cd vote-guard-server
npx hardhat compile  # Compile contracts
npx hardhat test     # Test contracts
```

## 🌐 Important Links

- **Contract on Etherscan**: https://sepolia.etherscan.io/address/0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **MetaMask**: https://metamask.io/

## 🔐 Security Notes

- Never commit `.env` files to Git
- Use dedicated test wallets for development
- Get free Sepolia ETH from faucets (never buy test ETH)
- All votes are publicly visible on blockchain (as designed)

## 👥 Team Collaboration

All team members connecting to the same contract address will see synchronized data:

1. Member A creates an election → Everyone sees it instantly
2. Member B casts a vote → Vote appears for all team members
3. No manual syncing or database exports needed!

## 📊 Project Status

- ✅ Smart contract deployed on Sepolia
- ✅ Backend connected to blockchain
- ✅ Frontend with MetaMask integration
- ✅ Network validation and switching
- ✅ Team synchronization working
- ✅ Zero local blockchain dependencies

## 🆘 Troubleshooting

**Backend won't start?**

- Check SEPOLIA_PRIVATE_KEY is set in .env
- Verify ALCHEMY_API_KEY is valid
- Ensure CONTRACT_ADDRESS is correct

**Wrong network error?**

- Open MetaMask and switch to "Sepolia Test Network"
- Enable test networks in MetaMask settings if not visible

**Slow transactions?**

- Sepolia transactions take 15-30 seconds (normal)
- Check transaction on Etherscan for status

**Different data than team?**

- Ensure everyone uses same CONTRACT_ADDRESS
- Verify BLOCKCHAIN_NETWORK=sepolia in all .env files

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for 3rd year CSE project
- Ethereum Sepolia testnet for development environment
- Alchemy for free RPC access
- Supabase for database hosting

---

**Made with 🛡️ by the VoteGuard Team** 2. MetaMask will prompt you to switch to Sepolia network 3. Approve the network switch 4. You're ready to vote!

## 📚 Documentation

- **Team Setup Guide**: [TEAM_SYNC_SETUP_GUIDE.md](TEAM_SYNC_SETUP_GUIDE.md) - Complete setup for team members
- **Migration Summary**: [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md) - What changed from local to Sepolia
- **Project Structure**: [STRUCTURE.md](STRUCTURE.md) - Code organization

## 🔧 Environment Variables

#### 1. PostgreSQL (Government Node)

Create a database (e.g., `vote_guard`) and a table named `citizens`:

```sql
CREATE TABLE citizens (
    citizen_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    mobile VARCHAR(20)
);

-- Insert dummy data for testing
INSERT INTO citizens (citizen_id, full_name, email, mobile) VALUES ('CIT-12345', 'Alice Smith', 'alice@example.com', '555-0199');
```

#### 2. MongoDB

Ensure your MongoDB instance is running. The application will automatically create the `users` collection upon the first successful registration.

### Running the Application

To start the development environment (Frontend + Backend):

```bash
npm run dev
```

> **Note**: Ensure your `package.json` is configured to run both the Next.js app (port 3000) and the Express server (port 5000) concurrently.

## 📡 API Endpoints

The Express server runs on port `5000`.

| Method | Endpoint              | Description                                                               |
| ------ | --------------------- | ------------------------------------------------------------------------- |
| `POST` | `/api/verify-citizen` | Checks if a Citizen ID exists in the Government Registry (Postgres).      |
| `POST` | `/api/register`       | Registers a new user in MongoDB if the Citizen ID is valid and not taken. |
| `POST` | `/api/login`          | Authenticates a user and retrieves linked citizen details from Postgres.  |
