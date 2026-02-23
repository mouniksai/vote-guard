# VoteGuard Frontend → Blockchain Integration

## 🎯 Quick Reference: How to Use `blockchain.js`

This file provides quick code snippets for migrating your Next.js frontend from Express API calls to direct blockchain interaction.

---

## 📦 Setup (One-Time)

### 1. Install Dependencies

```bash
cd app
npm install ethers@^6.9.0
```

### 2. Configure Environment

Create `app/.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key  # Optional
```

### 3. Import Utilities

```javascript
import {
  connectWallet,
  fetchElections,
  fetchCandidates,
  castVote,
  verifyVoteByReceipt,
  isMetaMaskInstalled,
  getConnectedWallet,
  formatAddress,
} from "../utils/blockchain";
```

---

## 🔥 Migration Patterns

### Pattern 1: Connect Wallet (Required First Step)

#### ❌ OLD (JWT Token):

```javascript
const response = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ username, password }),
});
const { token } = await response.json();
localStorage.setItem("token", token);
```

#### ✅ NEW (MetaMask Wallet):

```javascript
const [wallet, setWallet] = useState(null);

const handleConnect = async () => {
  try {
    if (!isMetaMaskInstalled()) {
      alert("Please install MetaMask: https://metamask.io/download/");
      return;
    }
    const address = await connectWallet();
    setWallet(address);
    console.log("Connected:", address);
  } catch (error) {
    alert(error.message);
  }
};

// UI
{
  wallet ? (
    <p>Connected: {formatAddress(wallet)}</p>
  ) : (
    <button onClick={handleConnect}>Connect MetaMask</button>
  );
}
```

---

### Pattern 2: Fetch Elections

#### ❌ OLD (API Call):

```javascript
const response = await fetch("http://localhost:5001/api/vote/ballot", {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await response.json();
setElections(data.elections);
```

#### ✅ NEW (Blockchain Read):

```javascript
const [elections, setElections] = useState([]);
const [loading, setLoading] = useState(false);

const loadElections = async () => {
  try {
    setLoading(true);
    const data = await fetchElections(); // No auth needed!
    setElections(data);
  } catch (error) {
    console.error("Failed to load elections:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadElections();
}, []);
```

---

### Pattern 3: Fetch Candidates

#### ❌ OLD (API Call):

```javascript
const response = await fetch(
  `http://localhost:5001/api/elections/${electionId}/candidates`,
);
const data = await response.json();
setCandidates(data.candidates);
```

#### ✅ NEW (Blockchain Read):

```javascript
const loadCandidates = async (electionId) => {
  try {
    const data = await fetchCandidates(electionId);
    setCandidates(data);
  } catch (error) {
    console.error("Failed to load candidates:", error);
  }
};
```

---

### Pattern 4: Cast Vote

#### ❌ OLD (API Post):

```javascript
const response = await fetch("http://localhost:5001/api/vote/cast", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    electionId,
    candidateId,
    voterId,
    encryptedVote,
    voteHash,
    signature,
  }),
});
const result = await response.json();
```

#### ✅ NEW (Blockchain Transaction):

```javascript
const [txHash, setTxHash] = useState(null);

const handleVote = async () => {
  if (!wallet) {
    alert("Connect wallet first!");
    return;
  }

  try {
    setLoading(true);

    // Prepare vote data
    const voteData = {
      voteId: `vote-${Date.now()}-${wallet.slice(-6)}`,
      electionId: selectedElection,
      candidateId: selectedCandidate,
      voterId: wallet,
      encryptedVote: encryptedData, // Your encryption logic
      voteHash: hashData, // Your hashing logic
      signature: signatureData, // Your signing logic
    };

    // Cast vote (MetaMask prompts user)
    const result = await castVote(voteData);

    setTxHash(result.transactionHash);
    alert("Vote cast successfully!");

    // Show Etherscan link
    console.log(
      "View on Etherscan:",
      `https://sepolia.etherscan.io/tx/${result.transactionHash}`,
    );
  } catch (error) {
    if (error.message.includes("rejected")) {
      alert("Transaction cancelled by user");
    } else {
      alert(`Failed to cast vote: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};
```

---

### Pattern 5: Verify Vote

#### ❌ OLD (API Call):

```javascript
const response = await fetch("/api/verification/verify-receipt", {
  method: "POST",
  body: JSON.stringify({ receiptId }),
});
const result = await response.json();
```

#### ✅ NEW (Blockchain Read):

```javascript
const verifyVote = async (receiptId) => {
  try {
    const result = await verifyVoteByReceipt(receiptId);

    if (result.verified) {
      alert(`✅ Vote verified!\nTimestamp: ${result.timestamp}`);
    } else {
      alert("Vote not found or not verified");
    }
  } catch (error) {
    alert("Verification failed");
  }
};
```

---

## 🎨 Complete Example Component

```javascript
"use client";

import { useState, useEffect } from "react";
import {
  connectWallet,
  fetchElections,
  fetchCandidates,
  castVote,
  isMetaMaskInstalled,
  formatAddress,
  getEtherscanLink,
} from "../utils/blockchain";

export default function VotingPage() {
  // State
  const [wallet, setWallet] = useState(null);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Connect wallet
  const handleConnect = async () => {
    try {
      if (!isMetaMaskInstalled()) {
        alert("Install MetaMask: https://metamask.io/download/");
        return;
      }
      const address = await connectWallet();
      setWallet(address);
    } catch (error) {
      alert(error.message);
    }
  };

  // Load elections on mount
  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    setLoading(true);
    try {
      const data = await fetchElections();
      setElections(data);
      if (data.length > 0) {
        loadCandidates(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load elections:", error);
    }
    setLoading(false);
  };

  const loadCandidates = async (electionId) => {
    try {
      const data = await fetchCandidates(electionId);
      setCandidates(data);
    } catch (error) {
      console.error("Failed to load candidates:", error);
    }
  };

  const handleVote = async () => {
    if (!wallet) {
      alert("Connect wallet first!");
      return;
    }
    if (!selected) {
      alert("Select a candidate!");
      return;
    }

    setLoading(true);
    try {
      const voteData = {
        voteId: `vote-${Date.now()}`,
        electionId: elections[0].id,
        candidateId: selected,
        voterId: wallet,
        encryptedVote: "encrypted_data", // TODO: Implement
        voteHash: "hash_value", // TODO: Implement
        signature: "0x00", // TODO: Implement
      };

      const result = await castVote(voteData);
      setTxHash(result.transactionHash);
      alert("Vote cast successfully!");
    } catch (error) {
      alert(`Failed: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      {/* Wallet Connection */}
      <div className="mb-8">
        {wallet ? (
          <div className="text-green-400">
            Connected: {formatAddress(wallet)}
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 rounded"
          >
            Connect MetaMask
          </button>
        )}
      </div>

      {/* Elections */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Elections</h2>
        {loading ? (
          <p>Loading from blockchain...</p>
        ) : (
          elections.map((e) => (
            <div key={e.id} className="p-4 bg-slate-800 rounded mb-2">
              <h3>{e.title}</h3>
              <p className="text-sm text-slate-400">{e.description}</p>
            </div>
          ))
        )}
      </div>

      {/* Candidates */}
      {candidates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Candidates</h2>
          {candidates.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`p-4 bg-slate-800 rounded mb-2 cursor-pointer ${
                selected === c.id ? "border-2 border-blue-500" : ""
              }`}
            >
              <h3>{c.name}</h3>
              <p className="text-sm">
                {c.party} - {c.symbol}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Vote Button */}
      {selected && (
        <button
          onClick={handleVote}
          disabled={loading || !wallet}
          className="px-6 py-3 bg-green-600 rounded font-bold"
        >
          {loading ? "Processing..." : "Cast Vote"}
        </button>
      )}

      {/* Transaction Link */}
      {txHash && (
        <div className="mt-8 p-4 bg-green-900/20 rounded">
          <p className="text-green-400 font-bold mb-2">✅ Vote Recorded!</p>
          <a
            href={getEtherscanLink(txHash)}
            target="_blank"
            className="text-blue-400 underline"
          >
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## 🚨 Common Issues & Solutions

### Issue: "MetaMask not installed"

```javascript
if (!isMetaMaskInstalled()) {
  alert("Please install MetaMask: https://metamask.io/download/");
  window.open("https://metamask.io/download/", "_blank");
  return;
}
```

### Issue: "User rejected transaction"

```javascript
try {
  await castVote(voteData);
} catch (error) {
  if (error.code === "ACTION_REJECTED") {
    alert("You cancelled the transaction");
  } else {
    alert(`Error: ${error.message}`);
  }
}
```

### Issue: "Insufficient funds"

```javascript
try {
  await castVote(voteData);
} catch (error) {
  if (error.message.includes("insufficient funds")) {
    alert(
      "You need Sepolia test ETH. Get it from: https://www.alchemy.com/faucets/ethereum-sepolia",
    );
  }
}
```

### Issue: "Contract not deployed"

```javascript
if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
  return (
    <div className="p-8 text-red-400">
      ⚠️ Contract not configured. Deploy first:
      <code>npx hardhat run scripts/deploy.js --network sepolia</code>
    </div>
  );
}
```

---

## 📱 User Guide (Share with Voters)

**For users to vote, they need:**

1. **MetaMask Extension**
   - Install from: https://metamask.io/download/

2. **Sepolia Network**
   - In MetaMask: Settings → Advanced → Show test networks
   - Switch to "Sepolia test network"

3. **Test ETH (Free)**
   - Get from: https://www.alchemy.com/faucets/ethereum-sepolia

4. **Connect & Vote**
   - Visit your voting app
   - Click "Connect MetaMask"
   - Select candidate
   - Approve transaction in MetaMask popup
   - Wait ~15 seconds for confirmation

---

## 🎯 Key Differences from API Approach

| Aspect             | API (Old)        | Blockchain (New)           |
| ------------------ | ---------------- | -------------------------- |
| **Authentication** | JWT tokens       | Wallet signatures          |
| **Data Storage**   | Database         | Blockchain                 |
| **Data Reads**     | GET requests     | Contract view functions    |
| **Data Writes**    | POST requests    | Transactions (gas fees)    |
| **Speed**          | Instant          | ~15 seconds                |
| **Cost**           | Free             | Gas fees (free on Sepolia) |
| **Verification**   | Server logs      | Etherscan                  |
| **Centralization** | Server-dependent | Decentralized              |

---

## ✅ Checklist for Each Page

When migrating a page:

- [ ] Import blockchain utilities
- [ ] Add wallet connection logic
- [ ] Replace `fetch()` with blockchain functions
- [ ] Remove JWT/auth headers
- [ ] Add MetaMask prompt handling
- [ ] Show transaction status/links
- [ ] Handle loading states (blockchain is slower)
- [ ] Add error handling for wallet issues
- [ ] Test with MetaMask on Sepolia

---

## 📚 Full API Reference

See [blockchain.js](./blockchain.js) for complete documentation of all available functions:

- `connectWallet()` - Connect MetaMask
- `getConnectedWallet()` - Check if connected
- `fetchElections()` - Get all elections
- `fetchElection(id)` - Get single election
- `fetchCandidates(electionId)` - Get candidates
- `castVote(voteData)` - Cast a vote
- `verifyVoteByReceipt(receiptId)` - Verify vote
- `getBlockchainStats()` - Get chain info
- `formatAddress(address)` - Format for display
- `getEtherscanLink(txHash)` - Get Etherscan URL

---

## 🎉 You're Ready!

Your frontend now:

- ✅ Connects directly to Ethereum Sepolia
- ✅ Reads data without backend server
- ✅ Writes votes via MetaMask
- ✅ Users can verify on Etherscan

**Next:** Test thoroughly and share with users!

---

_For deployment help, see: `DEPLOYMENT_CHECKLIST.md`_  
_For full setup guide, see: `SEPOLIA_SETUP_GUIDE.md`_
