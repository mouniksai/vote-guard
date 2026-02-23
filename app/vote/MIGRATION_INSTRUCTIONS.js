/**
 * BLOCKCHAIN MIGRATION GUIDE FOR app/vote/page.js
 * 
 * This file shows the EXACT changes needed to replace API calls with blockchain
 */

// ============================================================================
// STEP 1: ADD IMPORTS AT THE TOP
// ============================================================================

// ADD THIS after your existing imports:
import {
    connectWallet,
    isMetaMaskInstalled,
    getConnectedWallet,
    fetchElections,
    fetchCandidates,
    castVote,
    formatAddress,
    getEtherscanLink,
    onWalletChange
} from '../utils/blockchain';

// ============================================================================
// STEP 2: ADD WALLET STATE
// ============================================================================

// ADD THIS to your existing state declarations (around line 113):
const [wallet, setWallet] = useState(null);
const [blockchainLoading, setBlockchainLoading] = useState(false);
const [txHash, setTxHash] = useState(null);

// ============================================================================
// STEP 3: REPLACE tryBackendData() FUNCTION
// ============================================================================

// 🔴 OLD CODE (lines 133-169):
/*
useEffect(() => {
    const tryBackendData = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/vote/ballot', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const result = await response.json();

            if (response.ok) {
                setBackendData({
                    election: result.election,
                    candidates: result.candidates,
                    hasVoted: result.hasVoted,
                    user: result.user || USER_SESSION
                });
                setUsingBackend(true);

                if (result.hasVoted) {
                    setCurrentStep('already-voted');
                    if (result.receiptHash) {
                        setReceiptHash(result.receiptHash);
                    }
                }
            }
        } catch (error) {
            console.log('Backend connection failed, using mock data');
            setBackendError(error.message);
        }
    };

    tryBackendData();
}, []);
*/

// ✅ NEW CODE - Replace with this:
useEffect(() => {
    const loadBlockchainData = async () => {
        try {
            setBlockchainLoading(true);

            // Check if wallet is already connected
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet) {
                setWallet(connectedWallet);
            }

            // Fetch elections from blockchain (no wallet needed for reading)
            const elections = await fetchElections();

            if (elections.length > 0) {
                const activeElection = elections.find(e => e.status === 'LIVE') || elections[0];

                // Fetch candidates for the active election
                const candidates = await fetchCandidates(activeElection.id);

                setBackendData({
                    election: activeElection,
                    candidates: candidates,
                    hasVoted: false, // TODO: Check if user already voted
                    user: USER_SESSION
                });
                setUsingBackend(true);
            } else {
                setBackendError('No elections found on blockchain');
            }
        } catch (error) {
            console.error('Blockchain connection failed:', error);
            setBackendError(error.message);
        } finally {
            setBlockchainLoading(false);
        }
    };

    loadBlockchainData();

    // Listen for wallet changes
    if (isMetaMaskInstalled()) {
        onWalletChange((newWallet) => {
            setWallet(newWallet);
        });
    }
}, []);

// ============================================================================
// STEP 4: ADD WALLET CONNECTION HANDLER
// ============================================================================

// ADD THIS new function (around line 195):
const handleConnectWallet = async () => {
    try {
        if (!isMetaMaskInstalled()) {
            alert('Please install MetaMask: https://metamask.io/download/');
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        setBlockchainLoading(true);
        const address = await connectWallet();
        setWallet(address);
        console.log('✅ Wallet connected:', address);
    } catch (error) {
        console.error('Wallet connection failed:', error);
        alert(`Failed to connect wallet: ${error.message}`);
    } finally {
        setBlockchainLoading(false);
    }
};

// ============================================================================
// STEP 5: REPLACE handleCastVote() FUNCTION
// ============================================================================

// 🔴 OLD CODE (lines 196-238):
/*
const handleCastVote = async () => {
    setCurrentStep('casting');

    if (usingBackend && backendData.election) {
        try {
            const voteData = {
                electionId: backendData.election.id,
                candidateId: selectedCandidate
            };

            const response = await fetch('http://localhost:5001/api/vote/cast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(voteData)
            });

            const result = await response.json();

            if (response.ok) {
                setReceiptHash(result.receiptHash);
                if (result.encodedFormats) {
                    setEncodedFormats(result.encodedFormats);
                }
                if (result.timestamp) {
                    setVoteTimestamp(result.timestamp);
                }
                setCurrentStep('confirmed');
                return;
            }
        } catch (error) {
            console.error('Vote casting error:', error);
        }
    }

    // Fallback to mock transaction
    setTimeout(() => {
        setReceiptHash(`0x${Math.random().toString(16).substr(2, 8)}...`);
        setCurrentStep('confirmed');
    }, 4000);
};
*/

// ✅ NEW CODE - Replace with this:
const handleCastVote = async () => {
    // Check wallet connection first
    if (!wallet) {
        alert('Please connect your MetaMask wallet first!');
        return;
    }

    if (!selectedCandidate) {
        alert('Please select a candidate');
        return;
    }

    setCurrentStep('casting');
    setBlockchainLoading(true);

    try {
        // Prepare vote data
        const voteData = {
            voteId: `vote-${Date.now()}-${wallet.slice(-6)}`,
            electionId: backendData.election.id,
            candidateId: selectedCandidate.toString(),
            voterId: wallet,
            encryptedVote: `encrypted_${selectedCandidate}_${Date.now()}`, // TODO: Implement real encryption
            voteHash: `0x${Math.random().toString(16).substr(2, 64)}`, // TODO: Generate real hash
            signature: '0x00' // TODO: Generate real signature
        };

        console.log('🗳️  Casting vote to blockchain...', voteData);

        // Cast vote via blockchain (MetaMask will prompt user)
        const result = await castVote(voteData);

        console.log('✅ Vote cast successfully!', result);

        // Store transaction details
        setReceiptHash(result.transactionHash);
        setTxHash(result.transactionHash);
        setVoteTimestamp(new Date().toISOString());

        // Store receipt for download
        setEncodedFormats({
            text: result.transactionHash,
            hex: result.transactionHash,
            base64: btoa(result.transactionHash)
        });

        setCurrentStep('confirmed');

    } catch (error) {
        console.error('❌ Vote casting failed:', error);

        if (error.message.includes('rejected') || error.code === 'ACTION_REJECTED') {
            alert('Transaction cancelled by user');
        } else if (error.message.includes('insufficient funds')) {
            alert('Insufficient Sepolia ETH. Get free test ETH from: https://www.alchemy.com/faucets/ethereum-sepolia');
        } else {
            alert(`Failed to cast vote: ${error.message}`);
        }

        setCurrentStep('ballot'); // Return to ballot page
    } finally {
        setBlockchainLoading(false);
    }
};

// ============================================================================
// STEP 6: UPDATE THE UI TO SHOW WALLET CONNECTION
// ============================================================================

// ADD THIS section at the top of your ballot screen (around line 275):
/*

{currentStep === 'ballot' && (
    <>
        {/* Wallet Connection Banner */}
<div className="mb-6 p-4 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg">
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Shield className="text-blue-400" size={24} />
            <div>
                <h3 className="font-bold text-white">Blockchain Voting</h3>
                <p className="text-sm text-slate-400">
                    {wallet
                        ? `Connected: ${formatAddress(wallet)}`
                        : 'Connect wallet to cast your vote'
                    }
                </p>
            </div>
        </div>
        {!wallet && (
            <button
                onClick={handleConnectWallet}
                disabled={blockchainLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-all"
            >
                {blockchainLoading ? 'Connecting...' : 'Connect MetaMask'}
            </button>
        )}
        {wallet && (
            <div className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg">
                <span className="text-green-400 text-sm font-bold">
                    🟢 Connected
                </span>
            </div>
        )}
    </div>
</div>

{/* Rest of your ballot UI... */ }
    </>
)}

*/

// ============================================================================
// STEP 7: UPDATE THE CONFIRMATION SCREEN TO SHOW ETHERSCAN LINK
// ============================================================================

// In your confirmation screen (around line 750), ADD this after the receipt hash display:
/*

{txHash && (
    <a
        href={getEtherscanLink(txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
    >
        <ExternalLink size={18} />
        View on Etherscan
    </a>
)}

*/

// ============================================================================
// STEP 8: UPDATE THE PROCEED BUTTON TO CHECK WALLET
// ============================================================================

// In your sticky bottom bar (around line 420), UPDATE the button:
/*

<button
    disabled={!selectedCandidate || timeLeft <= 0 || !wallet}
    onClick={onProceed}
    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg flex items-center gap-2 text-sm whitespace-nowrap"
>
    {!wallet ? 'Connect Wallet' : 'Review & Cast'}
    <ArrowRight size={16} />
</button>

*/

// ============================================================================
// SUMMARY OF CHANGES
// ============================================================================

/*

1. Added blockchain utility imports
2. Added wallet state (wallet, blockchainLoading, txHash)
3. Replaced fetch ballot with fetchElections() and fetchCandidates()
4. Added handleConnectWallet() function
5. Replaced fetch vote/cast with castVote() blockchain transaction
6. Added wallet connection UI banner
7. Added Etherscan link to confirmation screen
8. Updated buttons to require wallet connection

TESTING CHECKLIST:
- [ ] Install ethers: npm install ethers@^6.14.0
- [ ] Check .env.local has CONTRACT_ADDRESS
- [ ] MetaMask installed and on Sepolia
- [ ] Wallet has test ETH
- [ ] Can connect wallet
- [ ] Can see elections from blockchain
- [ ] Can cast vote (MetaMask prompts)
- [ ] Can see transaction on Etherscan

*/

export { }; // Make this a module
