# 🚀 SEPOLIA DEPLOYMENT - QUICK START CHECKLIST

## ⚡ TL;DR - Deploy in 15 Minutes

This is your express guide to deploying VoteGuard on Sepolia testnet and connecting your Next.js frontend directly to the blockchain.

---

## PART 1: INFRASTRUCTURE (Backend)

### ☑️ Step 1: Install Dependencies (2 min)

```bash
cd vote-guard-server
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers@^6.9.0 dotenv
```

✅ Verify: `npx hardhat --version` shows v2.x

---

### ☑️ Step 2: Get Alchemy API Key (3 min)

1. https://dashboard.alchemy.com/signup
2. Create app → Name: "VoteGuard" → Chain: Ethereum → Network: **Sepolia**
3. Copy API key

✅ You have: `abc123def456...`

---

### ☑️ Step 3: Setup MetaMask Wallet (3 min)

1. Install: https://metamask.io/download/
2. Create new wallet (save seed phrase!)
3. Switch to **Sepolia Test Network**
4. Export private key: Account Details → Show Private Key

✅ You have: `0xabc123...`

---

### ☑️ Step 4: Get FREE Test ETH (2 min)

1. Go to: https://www.alchemy.com/faucets/ethereum-sepolia
2. Login with Alchemy account
3. Paste MetaMask address
4. Wait ~1 minute

✅ MetaMask shows: 0.5 SepoliaETH

---

### ☑️ Step 5: Configure .env File (1 min)

```bash
cd vote-guard-server
cp .env.example .env
nano .env
```

Fill in:

```bash
BLOCKCHAIN_NETWORK=sepolia
ALCHEMY_API_KEY=your_actual_key_from_step_2
SEPOLIA_PRIVATE_KEY=0xyour_key_from_step_3
ETHERSCAN_API_KEY=  # Optional
CONTRACT_ADDRESS=   # Leave empty (auto-filled)
```

✅ Verify: `cat .env | grep ALCHEMY_API_KEY`

---

### ☑️ Step 6: Compile Contract (30 sec)

```bash
npx hardhat compile
```

✅ Expected: "Compiled 1 Solidity file successfully"

---

### ☑️ Step 7: DEPLOY TO SEPOLIA! (3 min)

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

✅ Expected output:

```
✅ Contract Deployed Successfully!
├─ Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
🔗 View on Etherscan:
   https://sepolia.etherscan.io/address/0x742d35Cc...
```

**📝 COPY THIS ADDRESS!** You'll need it for frontend.

---

## PART 2: FRONTEND (Next.js)

### ☑️ Step 8: Install Frontend Dependencies (1 min)

```bash
cd app
npm install ethers@^6.9.0
```

✅ Verify: `npm list ethers` shows 6.x

---

### ☑️ Step 9: Configure Frontend .env (1 min)

```bash
cd app
nano .env.local
```

Add:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourAddressFromStep7
NEXT_PUBLIC_ALCHEMY_API_KEY=same_key_from_backend
```

✅ File exists: `cat .env.local`

---

### ☑️ Step 10: Replace fetch() with Blockchain Calls

**BEFORE (Old Code):**

```javascript
const response = await fetch("http://localhost:5001/api/vote/ballot");
const data = await response.json();
setElections(data.elections);
```

**AFTER (Blockchain Code):**

```javascript
import { fetchElections, connectWallet } from "../utils/blockchain";

// Connect wallet first
const wallet = await connectWallet();

// Fetch directly from blockchain
const elections = await fetchElections();
setElections(elections);
```

✅ Updated: `app/vote/page.js` (or your voting component)

---

### ☑️ Step 11: Add Wallet Connection UI

```javascript
import { connectWallet, isMetaMaskInstalled } from "../utils/blockchain";

function VotingPage() {
  const [wallet, setWallet] = useState(null);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      alert("Install MetaMask: https://metamask.io/download/");
      return;
    }
    const address = await connectWallet();
    setWallet(address);
  };

  return (
    <div>
      {wallet ? (
        <p>
          Connected: {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </p>
      ) : (
        <button onClick={handleConnect}>Connect MetaMask</button>
      )}
    </div>
  );
}
```

✅ Added wallet connection button

---

### ☑️ Step 12: Update Vote Casting

**BEFORE:**

```javascript
const response = await fetch("http://localhost:5001/api/vote/cast", {
  method: "POST",
  body: JSON.stringify({ electionId, candidateId }),
});
```

**AFTER:**

```javascript
import { castVote } from "../utils/blockchain";

const result = await castVote({
  voteId: `vote-${Date.now()}`,
  electionId: "e-2025-gen",
  candidateId: selectedCandidate,
  voterId: wallet,
  encryptedVote: "...", // Your encryption logic
  voteHash: "...", // Generate hash
  signature: "0x00", // Your signature logic
});

console.log("Transaction:", result.transactionHash);
// Show Etherscan link: https://sepolia.etherscan.io/tx/${result.transactionHash}
```

✅ Vote casting uses blockchain

---

## PART 3: TEST & VERIFY

### ☑️ Step 13: Test Blockchain Connection

```bash
cd app
npm run dev
```

1. Open: http://localhost:3000
2. Click "Connect MetaMask"
3. MetaMask popup → Connect
4. Page shows connected wallet address

✅ Wallet connected successfully

---

### ☑️ Step 14: Test Reading Data

1. Navigate to elections page
2. Should load elections from blockchain (no backend needed!)
3. Open DevTools Console → Should see blockchain data

✅ Elections load from blockchain

---

### ☑️ Step 15: Test Casting Vote

1. Select a candidate
2. Click "Cast Vote"
3. MetaMask popup → Confirm transaction
4. Wait ~15 seconds for confirmation
5. See transaction hash and Etherscan link

✅ Vote cast on blockchain

---

### ☑️ Step 16: Verify on Etherscan

1. Click Etherscan link (or visit manually):
   ```
   https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
   ```
2. Click "Events" tab
3. See your vote transaction!

✅ Vote visible on Etherscan

---

## 📊 ARCHITECTURE COMPARISON

### 🔴 BEFORE (JSON-based):

```
Frontend → Express API → fs.readFile('blockchain_data.json')
```

### ✅ AFTER (Blockchain):

```
Frontend → MetaMask → Sepolia Blockchain
```

**Benefits:**

- ❌ No backend server needed for blockchain operations
- ✅ Truly decentralized and transparent
- ✅ Immutable vote records
- ✅ Publicly verifiable on Etherscan

---

## 🔧 TROUBLESHOOTING GUIDE

| Issue                                 | Fix                                                            |
| ------------------------------------- | -------------------------------------------------------------- |
| **"MetaMask not installed"**          | Install: https://metamask.io/download/                         |
| **"Insufficient funds"**              | Get test ETH: https://www.alchemy.com/faucets/ethereum-sepolia |
| **"User rejected transaction"**       | User clicked "Reject" in MetaMask. Retry.                      |
| **"Contract address not configured"** | Set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`             |
| **"Network mismatch"**                | Switch MetaMask to Sepolia network                             |
| **"ALCHEMY_API_KEY not set"**         | Check `.env` file (no spaces around `=`)                       |
| **Vote not showing up**               | Wait 15-30 seconds, refresh Etherscan                          |
| **"Cannot find module 'ethers'"**     | Run `npm install ethers@^6.9.0`                                |

---

## 🎯 QUICK COMMANDS REFERENCE

```bash
# Compile contract
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Check wallet balance
npx hardhat run scripts/check-balance.js --network sepolia

# Run tests
npx hardhat test

# Start frontend
cd app && npm run dev

# View contract on Etherscan
open https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

---

## 📝 FILE LOCATIONS REFERENCE

| File                                  | Purpose            | Created By             |
| ------------------------------------- | ------------------ | ---------------------- |
| `vote-guard-server/hardhat.config.js` | Network config     | ✅ Already exists      |
| `vote-guard-server/.env`              | Backend secrets    | You (Step 5)           |
| `vote-guard-server/scripts/deploy.js` | Deploy script      | ✅ Already exists      |
| `app/utils/blockchain.js`             | Blockchain helpers | ✅ Just created        |
| `app/.env.local`                      | Frontend config    | You (Step 9)           |
| `deployments/sepolia.json`            | Deployment info    | Auto-created on deploy |

---

## ✅ SUCCESS INDICATORS

You know it's working when:

- [ ] ✅ Contract deployed at: `0x742d35Cc...` (Etherscan shows contract)
- [ ] ✅ MetaMask connects to your app
- [ ] ✅ Elections load from blockchain (DevTools shows contract calls)
- [ ] ✅ Vote transaction appears in MetaMask
- [ ] ✅ Transaction confirmed on Etherscan
- [ ] ✅ Events tab shows your vote on Etherscan
- [ ] ✅ No 'localhost:5001' fetch calls in Network tab

---

## 🚀 NEXT STEPS AFTER DEPLOYMENT

1. **Share with Test Users**
   - Send them: `SEPOLIA_SETUP_GUIDE.md` (user section)
   - Help them get test ETH
   - Guide first vote

2. **Monitor Gas Costs**
   - Check transaction costs on Etherscan
   - Optimize if needed
   - Consider Layer 2 if expensive

3. **Implement Encryption**
   - Add vote encryption before storing on-chain
   - Use your existing `cryptoUtils.js`
   - Ensure privacy

4. **Add Error Handling**
   - Handle MetaMask rejections gracefully
   - Show user-friendly error messages
   - Add retry logic

5. **Plan Production**
   - Test thoroughly on Sepolia (at least 1 week)
   - Consider Polygon/Arbitrum for cheaper gas
   - Plan mainnet deployment if needed

---

## 📚 DOCUMENTATION FILES

- **`SEPOLIA_SETUP_GUIDE.md`** → Detailed setup (this file)
- **`BLOCKCHAIN_MIGRATION_GUIDE.md`** → Full migration guide
- **`app/utils/blockchain.js`** → Frontend integration code
- **`app/utils/blockchain-migration-example.js`** → Code examples

---

## 🎉 YOU'RE DONE!

Your voting app is now:

- ✅ Running on Ethereum Sepolia testnet
- ✅ Free to use (test ETH)
- ✅ Publicly verifiable on Etherscan
- ✅ Directly connected from frontend (no backend for blockchain ops)
- ✅ Production-ready architecture

**Deploy Time (if following this checklist): ~15 minutes**

**Time to first vote: ~20 minutes (including user MetaMask setup)**

---

## 💬 NEED HELP?

1. **Check Logs**:
   - Backend: `npx hardhat run scripts/deploy.js --network sepolia`
   - Frontend: Browser DevTools Console

2. **Verify Config**:
   - Backend: `cat vote-guard-server/.env`
   - Frontend: `cat app/.env.local`

3. **Test Contract**:

   ```bash
   npx hardhat console --network sepolia
   > const contract = await ethers.getContractAt("VoteGuardBlockchain", "YOUR_ADDRESS")
   > await contract.chainLength()
   ```

4. **Documents**:
   - Read `SEPOLIA_SETUP_GUIDE.md` for details
   - Check `blockchain-migration-example.js` for code examples

---

**🔥 JSON IS DEAD. LONG LIVE THE BLOCKCHAIN! 🔥**

_Last Updated: February 2026_
