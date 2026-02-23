/**
 * 🔥 FRONTEND MIGRATION EXAMPLE - "JSON KILLER"
 * 
 * This file shows you EXACTLY how to replace your fetch() calls
 * with direct blockchain calls using the utilities from app/utils/blockchain.js
 * 
 * BEFORE: Fetching from Express API (localhost:5001)
 * AFTER: Fetching from Ethereum Sepolia blockchain via MetaMask
 */

'use client'

import React, { useState, useEffect } from 'react';
import {
    connectWallet,
    fetchElections,
    fetchCandidates,
    castVote,
    isMetaMaskInstalled,
    getConnectedWallet,
    formatAddress,
    getEtherscanLink
} from '../utils/blockchain';

export default function VotingPageExample() {
    const [wallet, setWallet] = useState(null);
    const [elections, setElections] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState(null);

    // ==========================================================================
    // 🔴 OLD WAY - Using Express API
    // ==========================================================================

    // const fetchElectionsOLD = async () => {
    //     const response = await fetch('http://localhost:5001/api/vote/ballot', {
    //         method: 'GET',
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //             'Content-Type': 'application/json'
    //         }
    //     });
    //     const data = await response.json();
    //     setElections(data.elections);
    // };

    // ==========================================================================
    // ✅ NEW WAY - Direct Blockchain Connection
    // ==========================================================================

    const fetchElectionsNEW = async () => {
        try {
            setLoading(true);
            const electionsData = await fetchElections(); // From blockchain.js
            setElections(electionsData);
        } catch (error) {
            console.error('Failed to fetch elections:', error);
            alert('Failed to load elections. Is MetaMask connected?');
        } finally {
            setLoading(false);
        }
    };

    // ==========================================================================
    // 🔴 OLD WAY - Fetching candidates from API
    // ==========================================================================

    // const fetchCandidatesOLD = async (electionId) => {
    //     const response = await fetch(`http://localhost:5001/api/elections/${electionId}/candidates`, {
    //         method: 'GET',
    //         headers: { 'Authorization': `Bearer ${token}` }
    //     });
    //     const data = await response.json();
    //     setCandidates(data.candidates);
    // };

    // ==========================================================================
    // ✅ NEW WAY - Fetching candidates from blockchain
    // ==========================================================================

    const fetchCandidatesNEW = async (electionId) => {
        try {
            setLoading(true);
            const candidatesData = await fetchCandidates(electionId); // From blockchain.js
            setCandidates(candidatesData);
        } catch (error) {
            console.error('Failed to fetch candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================================================
    // 🔴 OLD WAY - Casting vote via API
    // ==========================================================================

    // const castVoteOLD = async () => {
    //     const response = await fetch('http://localhost:5001/api/vote/cast', {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             electionId: 'e-2025-gen',
    //             candidateId: selectedCandidate,
    //             voterId: userId,
    //             encryptedVote: '...',
    //             voteHash: '...',
    //             signature: '...'
    //         })
    //     });
    //     const data = await response.json();
    //     return data;
    // };

    // ==========================================================================
    // ✅ NEW WAY - Casting vote directly to blockchain (via MetaMask)
    // ==========================================================================

    const castVoteNEW = async () => {
        if (!selectedCandidate) {
            alert('Please select a candidate');
            return;
        }

        if (!wallet) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            setLoading(true);

            // Prepare vote data (you'll need encryption logic here)
            const voteData = {
                voteId: `vote-${Date.now()}`, // Generate unique ID
                electionId: 'e-2025-gen', // Current election
                candidateId: selectedCandidate,
                voterId: wallet, // Use wallet address as voter ID
                encryptedVote: 'encrypted_vote_data', // TODO: Implement encryption
                voteHash: 'hash_of_vote', // TODO: Generate hash
                signature: '0x00' // TODO: Generate signature
            };

            // Cast vote to blockchain (MetaMask will prompt)
            const result = await castVote(voteData); // From blockchain.js

            setTxHash(result.transactionHash);
            alert(`✅ Vote cast successfully!\nTransaction: ${result.transactionHash}`);

        } catch (error) {
            console.error('Failed to cast vote:', error);
            alert(`Failed to cast vote: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================================================
    // WALLET CONNECTION
    // ==========================================================================

    const handleConnectWallet = async () => {
        try {
            if (!isMetaMaskInstalled()) {
                alert('Please install MetaMask: https://metamask.io/download/');
                return;
            }

            const address = await connectWallet();
            setWallet(address);
            console.log('✅ Wallet connected:', address);
        } catch (error) {
            console.error('Wallet connection failed:', error);
            alert(`Failed to connect wallet: ${error.message}`);
        }
    };

    // Check if wallet is already connected on page load
    useEffect(() => {
        const checkWallet = async () => {
            const address = await getConnectedWallet();
            if (address) {
                setWallet(address);
            }
        };
        checkWallet();
    }, []);

    // Load elections on mount
    useEffect(() => {
        fetchElectionsNEW();
    }, []);

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto">

                {/* Header with Wallet Connection */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">VoteGuard - Blockchain Voting</h1>

                    {wallet ? (
                        <div className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg">
                            <span className="text-green-400 text-sm">
                                🟢 {formatAddress(wallet)}
                            </span>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnectWallet}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
                        >
                            Connect MetaMask
                        </button>
                    )}
                </div>

                {/* Elections List */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Active Elections</h2>
                    {loading ? (
                        <p>Loading elections from blockchain...</p>
                    ) : (
                        <div className="space-y-4">
                            {elections.map(election => (
                                <div
                                    key={election.id}
                                    className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                                >
                                    <h3 className="font-bold">{election.title}</h3>
                                    <p className="text-sm text-slate-400">{election.description}</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Status: {election.status}
                                    </p>
                                    <button
                                        onClick={() => fetchCandidatesNEW(election.id)}
                                        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                                    >
                                        View Candidates
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Candidates List */}
                {candidates.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4">Candidates</h2>
                        <div className="space-y-2">
                            {candidates.map(candidate => (
                                <div
                                    key={candidate.id}
                                    onClick={() => setSelectedCandidate(candidate.id)}
                                    className={`p-4 bg-slate-800 rounded-lg border cursor-pointer ${selectedCandidate === candidate.id
                                            ? 'border-blue-500'
                                            : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <h3 className="font-bold">{candidate.name}</h3>
                                    <p className="text-sm text-slate-400">{candidate.party} - {candidate.symbol}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cast Vote Button */}
                {selectedCandidate && (
                    <div className="text-center">
                        <button
                            onClick={castVoteNEW}
                            disabled={loading || !wallet}
                            className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 rounded-lg font-bold text-lg"
                        >
                            {loading ? 'Processing...' : 'Cast Vote on Blockchain'}
                        </button>
                        {!wallet && (
                            <p className="text-yellow-400 text-sm mt-2">
                                ⚠️ Connect wallet to cast vote
                            </p>
                        )}
                    </div>
                )}

                {/* Transaction Link */}
                {txHash && (
                    <div className="mt-8 p-4 bg-green-500/20 border border-green-500 rounded-lg">
                        <p className="font-bold text-green-400 mb-2">✅ Vote Recorded on Blockchain!</p>
                        <a
                            href={getEtherscanLink(txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm break-all"
                        >
                            View on Etherscan: {txHash}
                        </a>
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <h3 className="font-bold mb-2">ℹ️ How This Works</h3>
                    <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                        <li>No backend server needed for blockchain operations</li>
                        <li>Your wallet (MetaMask) connects directly to Sepolia</li>
                        <li>All votes are stored permanently on the blockchain</li>
                        <li>Transaction fees paid in Sepolia test ETH (free!)</li>
                        <li>Votes are publicly verifiable on Etherscan</li>
                    </ul>
                </div>

            </div>
        </div>
    );
}

// =============================================================================
// 📝 MIGRATION CHECKLIST FOR YOUR EXISTING CODE
// =============================================================================

/*

✅ STEP 1: Install Dependencies
   npm install ethers@^6.9.0

✅ STEP 2: Configure Environment Variables
   Create .env.local in your app/ directory:

   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key (optional, for reading)

✅ STEP 3: Replace Fetch Calls

   FIND:
   const response = await fetch('http://localhost:5001/api/vote/ballot')

   REPLACE WITH:
   import { fetchElections } from '../utils/blockchain'
   const elections = await fetchElections()

✅ STEP 4: Add Wallet Connection

   FIND:
   // Your auth/login logic

   ADD:
   import { connectWallet, isMetaMaskInstalled } from '../utils/blockchain'
   const wallet = await connectWallet()

✅ STEP 5: Update Vote Casting

   FIND:
   const response = await fetch('http://localhost:5001/api/vote/cast', {...})

   REPLACE WITH:
   import { castVote } from '../utils/blockchain'
   const result = await castVote(voteData)

✅ STEP 6: Remove Auth Headers

   You don't need JWT tokens for blockchain reads!
   Anyone can read blockchain data (it's public)
   Only writing (voting) requires wallet signature

✅ STEP 7: Handle MetaMask Prompts

   When users vote, MetaMask will pop up asking them to:
   - Approve the transaction
   - Pay gas fees (free on Sepolia with test ETH)
   - Sign the transaction

✅ STEP 8: Test Everything

   1. Connect wallet
   2. Load elections from blockchain
   3. Select candidate
   4. Cast vote (MetaMask prompts)
   5. View transaction on Etherscan

*/

// =============================================================================
// 🚨 COMMON GOTCHAS & SOLUTIONS
// =============================================================================

/*

❌ ERROR: "Contract address not configured"
   SOLUTION: Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local

❌ ERROR: "MetaMask not installed"
   SOLUTION: Install MetaMask extension: https://metamask.io/download/

❌ ERROR: "User rejected transaction"
   SOLUTION: User clicked "Reject" in MetaMask. Retry.

❌ ERROR: "Insufficient funds"
   SOLUTION: Get Sepolia test ETH from faucet: https://sepoliafaucet.com/

❌ ERROR: "Network mismatch"
   SOLUTION: The code auto-switches to Sepolia. Check MetaMask network.

❌ ERROR: "Function not found in ABI"
   SOLUTION: Update CONTRACT_ABI in blockchain.js with your contract's functions

⚠️  IMPORTANT: Server-side rendering issues
   Solution: Use 'use client' directive (already done in this example)
            Check window.ethereum only in useEffect/event handlers

*/
