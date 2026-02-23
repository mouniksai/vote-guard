# 🛡️ VoteGuard Team Sync Setup Guide

## 🎯 The Problem We Solved

**Before:** Everyone running local blockchain → Different data on each machine → No sync → Demos fail

**Now:** Everyone connects to ONE Sepolia contract → Same data everywhere → Perfect sync → Team demos work!

---

## 📋 Quick Start Checklist

### ✅ Phase 1: Get Your Free API Key (5 minutes)

1. **Sign up at Alchemy** (Free forever!)
   - Go to: https://dashboard.alchemy.com/
   - Click "Sign Up" → Use your college email
   - Verify email
2. **Create a Sepolia App**
   - Click "+ Create new app"
   - Name: `VoteGuard-[YourName]`
   - Network: **Ethereum Sepolia**
   - Click "Create app"
3. **Copy API Key**
   - Click "View Key"
   - Copy the **API KEY** (NOT the URL)
   - Save it somewhere safe

---

### ✅ Phase 2: Get Test Wallet (5 minutes)

1. **Install MetaMask**
   - Download: https://metamask.io/download/
   - Create a NEW wallet (NOT your personal one!)
   - Save the recovery phrase securely
2. **Switch to Sepolia Network**
   - Click MetaMask network dropdown (says "Ethereum Mainnet")
   - Enable "Show test networks" in settings
   - Select "Sepolia test network"
3. **Get Free Test ETH**
   - Visit: https://sepoliafaucet.com/
   - Enter your wallet address
   - Click "Send Me ETH"
   - Wait 1-2 minutes for confirmation
4. **Export Private Key** (CRITICAL: Only for development wallet!)
   - Open MetaMask
   - Click three dots → Account details
   - Click "Export Private Key"
   - Enter password → Copy key (without 0x prefix)
   - ⚠️ **NEVER share this or push to GitHub!**

---

### ✅ Phase 3: Backend Setup (10 minutes)

1. **Navigate to Backend Folder**

   ```bash
   cd vote-guard-server
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Create Environment File**

   ```bash
   cp .env.example .env
   ```

4. **Edit .env File** (Use VS Code or any text editor)

   ```env
   # Server Config
   PORT=5001
   NODE_ENV=development

   # CRITICAL: Blockchain (Sepolia Only!)
   BLOCKCHAIN_NETWORK=sepolia
   CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
   ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY_FROM_PHASE_1
   SEPOLIA_PRIVATE_KEY=YOUR_PRIVATE_KEY_FROM_PHASE_2

   # Database (if using)
   DATABASE_URL=your_database_url_here

   # Security
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters
   ENCRYPTION_KEY=your_32_character_encryption_key_here

   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start Backend Server**

   ```bash
   npm run dev
   ```

   **✅ Success Indicators:**
   - You should see: `✅ Connected to Sepolia blockchain`
   - Contract address displayed
   - Chain Length shown
   - No errors!

   **❌ If You See Errors:**
   - `ALCHEMY_API_KEY not set` → Double-check Phase 1
   - `SEPOLIA_PRIVATE_KEY not set` → Double-check Phase 2
   - `CONTRACT_ADDRESS not set` → Check .env file

---

### ✅ Phase 4: Frontend Setup (5 minutes)

1. **Navigate to Frontend Folder**

   ```bash
   cd ..  # Back to root directory
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Create Environment File**

   ```bash
   cp .env.example .env.local
   ```

4. **Edit .env.local File**

   ```env
   # Contract Address (Same for everyone!)
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2

   # Your Alchemy API Key (from Phase 1)
   NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   NEXT_PUBLIC_ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY

   # Sepolia Chain ID (DO NOT CHANGE!)
   NEXT_PUBLIC_CHAIN_ID=11155111

   # Backend URL
   NEXT_PUBLIC_API_URL=http://localhost:5001

   # Explorer
   NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io
   ```

5. **Start Frontend**

   ```bash
   npm run dev
   ```

6. **Open Browser**
   - Go to: http://localhost:3000
   - Connect MetaMask when prompted
   - Make sure you're on Sepolia network!

---

## 🧪 Test Team Sync

### Test A: Create Election (Team Member 1)

1. **Login as Admin**
   - Go to: http://localhost:3000/admin/dashboard
2. **Create Test Election**
   - Fill in election details
   - Set constituency: "Mumbai South"
   - Click "Create Election"
3. **Copy Election ID**
   - Note the election ID from the response

### Test B: See Same Election (Team Member 2)

1. **Open Your Browser**
   - Go to: http://localhost:3000/dashboard
2. **Check Elections**
   - You should see THE SAME election that Member 1 created!
   - Same ID, same details, same timestamp
3. **✅ SUCCESS!** If you see it, sync is working!

### Test C: Vote from Different Locations

1. **Team Member 1: Cast Vote**
   - Go to: http://localhost:3000/vote
   - Select a candidate
   - Confirm with MetaMask
   - Wait for transaction confirmation (~15 seconds)
2. **Team Member 2: View Results**
   - Refresh your dashboard
   - You should see the vote count updated!
   - Check on Etherscan: https://sepolia.etherscan.io/address/0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2

---

## 🚀 College Demo Day Checklist

### 1 Week Before Demo

- [ ] All team members test full flow
- [ ] Create 2-3 test elections
- [ ] Add 3-4 candidates per election
- [ ] Cast 10+ test votes
- [ ] Verify all data shows on Etherscan

### 1 Day Before Demo

- [ ] Get fresh test ETH for all wallets
- [ ] Clear old test data if needed
- [ ] Create your FINAL demo election
- [ ] Practice the full demo flow
- [ ] Prepare backup internet (mobile hotspot)

### Demo Day Setup (1 hour before)

```bash
# Terminal 1: Backend
cd vote-guard-server
npm run dev

# Terminal 2: Frontend
cd ..
npm run dev

# ✅ Both should start without errors!
```

### Demo Script

1. **Show Team Sync** (2 min)
   - "Notice we're all connected to the SAME Sepolia contract"
   - Show contract on Etherscan
   - "Everyone sees the same data in real-time"

2. **Create Election** (1 min)
   - Admin creates new election
   - Show it appears instantly for everyone

3. **Cast Vote** (2 min)
   - User logs in
   - Shows ballot with candidates
   - Casts vote via MetaMask
   - Show transaction on Etherscan

4. **Verify Vote** (1 min)
   - Show receipt verification
   - Check vote on blockchain explorer
   - Show encryption/security features

5. **Show Results** (1 min)
   - Display live results
   - Show vote counts updating
   - Explain immutability

---

## 🔧 Troubleshooting

### Problem: "Wrong Network" Error

**Solution:**

1. Open MetaMask
2. Click network dropdown
3. Select "Sepolia test network"
4. Refresh page

### Problem: "Insufficient Funds" Error

**Solution:**

1. Get more test ETH: https://sepoliafaucet.com/
2. Wait 2-3 minutes
3. Check balance in MetaMask
4. Try transaction again

### Problem: "Contract Not Responding"

**Solution:**

1. Check backend is running (Terminal 1)
2. Verify .env has correct CONTRACT_ADDRESS
3. Check internet connection
4. Try again in 30 seconds (Sepolia might be slow)

### Problem: "Backend Won't Start"

**Solution:**

```bash
# Check if port is in use
lsof -i :5001

# Kill process if needed
kill -9 [PID]

# Restart server
npm run dev
```

### Problem: "Different Data on Each Machine"

**This should NEVER happen if:**

- Everyone uses CONTRACT_ADDRESS: `0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2`
- Everyone has BLOCKCHAIN_NETWORK=sepolia in .env
- No one is running local blockchain

**Check:**

```bash
# In vote-guard-server/.env
cat .env | grep CONTRACT_ADDRESS
# Should show: CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2

cat .env | grep BLOCKCHAIN_NETWORK
# Should show: BLOCKCHAIN_NETWORK=sepolia
```

---

## 📊 Monitoring Your Contract

### View on Etherscan

1. **Contract Page**
   - https://sepolia.etherscan.io/address/0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
   - Shows all transactions
   - Real-time updates

2. **What to Check:**
   - Transaction count (should increase with each vote)
   - Latest transactions (should show your recent activity)
   - Contract balance (not important for voting)

### Check Backend Status

```bash
# From vote-guard-server directory
curl http://localhost:5001/api/blockchain/status
```

Expected response:

```json
{
  "network": "sepolia",
  "contract": "0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2",
  "chainLength": 42,
  "status": "connected"
}
```

---

## 💡 Pro Tips

### For Faster Development

1. **Use Same Wallet Across Devices**
   - Import same private key in multiple MetaMask instances
   - Share test ETH between team members

2. **Bookmark Important Links**
   - Contract on Etherscan
   - Sepolia Faucet
   - Alchemy Dashboard

3. **Keep Test Data Clean**
   - Use clear naming: "Test Election 1", "Test Election 2"
   - Add dates to election titles: "Demo Election - Dec 20"

### For Better Demos

1. **Pre-create Demo Data**
   - Create elections before demo
   - Add all candidates ahead of time
   - Have test votes already cast

2. **Prepare Talking Points**
   - "Blockchain ensures vote immutability"
   - "Smart contracts eliminate central trust"
   - "Sepolia enables team collaboration"

3. **Have Backup Plans**
   - Screenshot important screens
   - Record demo video as backup
   - Prepare slides explaining technical flow

---

## 🎓 Understanding the Architecture

### Before (Local Mode)

```
You → blockchain_data.json (YOUR computer)
Teammate → blockchain_data.json (THEIR computer)
= Different data! ❌
```

### Now (Sepolia Mode)

```
You → Sepolia Blockchain (Ethereum testnet)
         ↑
Teammate ┘
= Same data! ✅
```

### Data Flow

1. **Creating Election**

   ```
   Admin → Frontend → Backend → Sepolia Smart Contract
                                      ↓
                              Ethereum Blockchain
   ```

2. **Casting Vote**

   ```
   Voter → MetaMask → Sepolia Smart Contract → Block Mined
                                                    ↓
                                            Visible to Everyone!
   ```

3. **Viewing Results**
   ```
   Anyone → Frontend → Read from Sepolia → Display Live Results
   ```

---

## 🔐 Security Reminders

### DO:

- ✅ Use dedicated test wallets
- ✅ Get free test ETH (never buy it!)
- ✅ Add .env to .gitignore
- ✅ Share contract address with team

### DON'T:

- ❌ Commit .env files to GitHub
- ❌ Use your personal wallet for testing
- ❌ Share private keys in group chat
- ❌ Deploy new contracts (use existing one!)

---

## 📞 Getting Help

### Team Member Not Syncing?

1. **Check their .env file**

   ```bash
   # Should have:
   BLOCKCHAIN_NETWORK=sepolia
   CONTRACT_ADDRESS=0xE08b2c325F4e64DDb7837b6a4b1443935473ECB2
   ALCHEMY_API_KEY=their_key_here
   ```

2. **Verify backend startup**
   - Should show "Connected to Sepolia"
   - Should show correct contract address

3. **Test with curl**
   ```bash
   curl http://localhost:5001/api/blockchain/status
   ```

### Still Having Issues?

1. **Delete and recreate .env files**
2. **Reinstall node_modules**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. **Try different Alchemy API key**
4. **Check Sepolia network status**: https://sepolia.etherscan.io/

---

## 🎉 Success Criteria

Your setup is PERFECT if:

- [ ] Backend starts with "✅ Connected to Sepolia blockchain"
- [ ] Frontend loads without errors
- [ ] MetaMask connects to Sepolia
- [ ] Team members see same elections
- [ ] Votes sync across all machines
- [ ] Etherscan shows your transactions
- [ ] No "blockchain_data.json" files anywhere!

---

## 📝 Environment Variables Reference

### Backend (.env)

| Variable              | Required | Example                 | Description           |
| --------------------- | -------- | ----------------------- | --------------------- |
| `BLOCKCHAIN_NETWORK`  | ✅       | `sepolia`               | MUST be 'sepolia'     |
| `CONTRACT_ADDRESS`    | ✅       | `0xE08b2c...`           | Team contract address |
| `ALCHEMY_API_KEY`     | ✅       | `abc123...`             | Your Alchemy key      |
| `SEPOLIA_PRIVATE_KEY` | ✅       | `def456...`             | Your wallet key       |
| `PORT`                | ✅       | `5001`                  | Server port           |
| `FRONTEND_URL`        | ✅       | `http://localhost:3000` | CORS origin           |

### Frontend (.env.local)

| Variable                       | Required | Example                  | Description   |
| ------------------------------ | -------- | ------------------------ | ------------- |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | ✅       | `0xE08b2c...`            | Team contract |
| `NEXT_PUBLIC_RPC_URL`          | ✅       | `https://eth-sepolia...` | Alchemy RPC   |
| `NEXT_PUBLIC_CHAIN_ID`         | ✅       | `11155111`               | Sepolia ID    |
| `NEXT_PUBLIC_API_URL`          | ✅       | `http://localhost:5001`  | Backend URL   |

---

## 🚀 You're Ready!

**Next Steps:**

1. Complete all 4 phases above
2. Run team sync test
3. Create demo election
4. Practice full flow
5. Ace your demo! 🎓

**Remember:** Everyone uses the SAME contract = Perfect sync = Happy demos!

Good luck with your project! 🛡️✨
