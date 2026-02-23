/**
 * VoteGuard Blockchain Utilities - Frontend Integration
 * 
 * THIS IS THE "JSON KILLER" - Direct blockchain connection from your Next.js frontend
 * 
 * REPLACES: fetch() calls to Express API
 * CONNECTS TO: Ethereum Sepolia testnet directly via MetaMask
 * 
 * @requires ethers v6
 * @requires MetaMask browser extension
 */

import { ethers } from 'ethers';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Your deployed contract address on Sepolia
 * Get this from: npx hardhat run scripts/deploy.js --network sepolia
 * Or from deployments/sepolia.json
 */
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

/**
 * Sepolia Network Configuration
 * Chain ID: 11155111 (0xaa36a7 in hex)
 */
const SEPOLIA_CONFIG = {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Test Network',
    rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: {
        name: 'Sepolia ETH',
        symbol: 'SepoliaETH',
        decimals: 18
    }
};

/**
 * Contract ABI - Functions we'll call from frontend
 * Get full ABI from: artifacts/contracts/VoteGuardBlockchain.sol/VoteGuardBlockchain.json
 * For production, only include functions you need
 */
const CONTRACT_ABI = [
    // Read functions (no gas cost)
    "function getElections() external view returns (tuple(bytes32 id, string title, string description, string constituency, uint32 startTime, uint32 endTime, uint8 status, uint32 createdAt, bool exists)[])",
    "function getElection(bytes32 electionId) external view returns (tuple(bytes32 id, string title, string description, string constituency, uint32 startTime, uint32 endTime, uint8 status, uint32 createdAt, bool exists))",
    "function getCandidatesByElection(bytes32 electionId) external view returns (tuple(bytes32 id, string name, string party, string symbol, uint16 age, string constituency, bytes32 electionId, uint32 registeredAt, bool exists)[])",
    "function getVotesByElection(bytes32 electionId) external view returns (tuple(bytes32 id, bytes32 electionId, bytes32 candidateId, string voterId, string encryptedVote, bytes32 voteHash, bytes signature, uint32 timestamp, bool verified, bool exists)[])",
    "function verifyVoteByReceipt(string memory receiptId) external view returns (tuple(bytes32 id, bytes32 electionId, bytes32 candidateId, string voterId, string encryptedVote, bytes32 voteHash, bytes signature, uint32 timestamp, bool verified, bool exists))",
    "function chainLength() external view returns (uint256)",
    "function getBlockByIndex(uint256 index) external view returns (tuple(uint256 index, uint32 timestamp, bytes32 previousHash, bytes32 merkleRoot, uint64 nonce, bytes32 blockHash, uint16 transactionCount))",

    // Write functions (cost gas)
    "function addElection(bytes32 id, string memory title, string memory description, string memory constituency, uint32 startTime, uint32 endTime) external",
    "function addCandidate(bytes32 id, string memory name, string memory party, string memory symbol, uint16 age, string memory constituency, bytes32 electionId) external",
    "function castVote(bytes32 voteId, bytes32 electionId, bytes32 candidateId, string memory voterId, string memory encryptedVote, bytes32 voteHash, bytes memory signature) external",
    "function updateElectionStatus(bytes32 electionId, uint8 newStatus) external"
];

// =============================================================================
// WALLET CONNECTION
// =============================================================================

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * CRITICAL: Check if user is on Sepolia network
 * Returns { correct: boolean, currentChainId: string, message: string }
 */
export async function checkNetwork() {
    if (!isMetaMaskInstalled()) {
        return {
            correct: false,
            currentChainId: null,
            message: 'MetaMask not installed'
        };
    }

    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const isCorrect = chainId === SEPOLIA_CONFIG.chainId;

        return {
            correct: isCorrect,
            currentChainId: chainId,
            message: isCorrect
                ? 'Connected to Sepolia'
                : `Wrong network. Please switch to Sepolia (Chain ID: ${SEPOLIA_CONFIG.chainId})`
        };
    } catch (error) {
        return {
            correct: false,
            currentChainId: null,
            message: error.message
        };
    }
}

/**
 * CRITICAL: Enforce Sepolia network before any operation
 * Throws error if not on Sepolia
 */
export async function enforceSepoliaNetwork() {
    const networkCheck = await checkNetwork();

    if (!networkCheck.correct) {
        if (!isMetaMaskInstalled()) {
            throw new Error('MetaMask not installed. Install from: https://metamask.io/download/');
        }

        // Try to switch to Sepolia
        try {
            await switchToSepolia();
            return true;
        } catch (switchError) {
            throw new Error(`You must be on Sepolia network. Current: ${networkCheck.currentChainId}`);
        }
    }

    return true;
}

/**
 * Connect to MetaMask wallet
 * @returns {Promise<string>} Connected wallet address
 */
export async function connectWallet() {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask not installed. Install from: https://metamask.io/download/');
    }

    try {
        // First, ensure we're on Sepolia
        await enforceSepoliaNetwork();

        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (accounts.length === 0) {
            throw new Error('No accounts found in MetaMask');
        }

        console.log('✅ Connected to MetaMask:', accounts[0]);
        return accounts[0];
    } catch (error) {
        if (error.code === 4001) {
            throw new Error('User rejected connection request');
        }
        throw error;
    }
}

/**
 * Get currently connected wallet address
 */
export async function getConnectedWallet() {
    if (!isMetaMaskInstalled()) {
        return null;
    }

    const accounts = await window.ethereum.request({
        method: 'eth_accounts'
    });

    return accounts[0] || null;
}

/**
 * Switch to Sepolia network
 */
export async function switchToSepolia() {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask not installed');
    }

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CONFIG.chainId }],
        });
    } catch (error) {
        // Network not added to MetaMask
        if (error.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [SEPOLIA_CONFIG],
            });
        } else {
            throw error;
        }
    }
}

// =============================================================================
// CONTRACT CONNECTION
// =============================================================================

/**
 * Get contract instance for READ operations (uses provider)
 * NO WALLET REQUIRED - Anyone can read blockchain data
 */
export function getContractForReading() {
    if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local');
    }

    // Use Alchemy public RPC (no wallet needed for reading)
    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    const rpcUrl = alchemyKey
        ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`
        : process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org'; // Fallback to public RPC

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Get contract instance for WRITE operations (uses signer)
 * WALLET REQUIRED - User pays gas fees
 * STRICTLY enforces Sepolia network
 */
export async function getContractForWriting() {
    if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured');
    }

    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask not installed');
    }

    // CRITICAL: Enforce Sepolia network before ANY write operation
    await enforceSepoliaNetwork();

    // Get provider from MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// =============================================================================
// HIGH-LEVEL API - REPLACE YOUR fetch() CALLS WITH THESE
// =============================================================================

/**
 * 🔥 REPLACES: fetch('http://localhost:5001/api/elections')
 * Get all elections from blockchain
 */
export async function fetchElections() {
    try {
        const contract = getContractForReading();
        const elections = await contract.getElections();

        // Convert blockchain data to your app's format
        return elections.map(election => ({
            id: ethers.decodeBytes32String(election.id),
            title: election.title,
            description: election.description,
            constituency: election.constituency,
            startTime: new Date(Number(election.startTime) * 1000).toISOString(),
            endTime: new Date(Number(election.endTime) * 1000).toISOString(),
            status: ['UPCOMING', 'LIVE', 'ENDED', 'CANCELLED'][election.status],
            createdAt: new Date(Number(election.createdAt) * 1000).toISOString(),
        }));
    } catch (error) {
        console.error('Error fetching elections:', error);
        throw new Error(`Failed to fetch elections: ${error.message}`);
    }
}

/**
 * 🔥 REPLACES: fetch('http://localhost:5001/api/elections/:id')
 * Get single election details
 */
export async function fetchElection(electionId) {
    try {
        const contract = getContractForReading();
        const electionBytes32 = ethers.encodeBytes32String(electionId);
        const election = await contract.getElection(electionBytes32);

        if (!election.exists) {
            throw new Error('Election not found');
        }

        return {
            id: ethers.decodeBytes32String(election.id),
            title: election.title,
            description: election.description,
            constituency: election.constituency,
            startTime: new Date(Number(election.startTime) * 1000).toISOString(),
            endTime: new Date(Number(election.endTime) * 1000).toISOString(),
            status: ['UPCOMING', 'LIVE', 'ENDED', 'CANCELLED'][election.status],
            createdAt: new Date(Number(election.createdAt) * 1000).toISOString(),
        };
    } catch (error) {
        console.error('Error fetching election:', error);
        throw error;
    }
}

/**
 * 🔥 REPLACES: fetch('http://localhost:5001/api/elections/:id/candidates')
 * Get candidates for an election
 */
export async function fetchCandidates(electionId) {
    try {
        const contract = getContractForReading();
        const electionBytes32 = ethers.encodeBytes32String(electionId);
        const candidates = await contract.getCandidatesByElection(electionBytes32);

        return candidates.map(candidate => ({
            id: ethers.decodeBytes32String(candidate.id),
            name: candidate.name,
            party: candidate.party,
            symbol: candidate.symbol,
            age: Number(candidate.age),
            constituency: candidate.constituency,
            electionId: ethers.decodeBytes32String(candidate.electionId),
            registeredAt: new Date(Number(candidate.registeredAt) * 1000).toISOString(),
        }));
    } catch (error) {
        console.error('Error fetching candidates:', error);
        throw error;
    }
}

/**
 * 🔥 REPLACES: fetch('http://localhost:5001/api/vote/cast', { method: 'POST', ... })
 * Cast a vote on the blockchain (requires MetaMask)
 */
export async function castVote(voteData) {
    try {
        // Get contract with signer (requires MetaMask approval)
        const contract = await getContractForWriting();

        // Convert IDs to bytes32
        const voteIdBytes32 = ethers.encodeBytes32String(voteData.voteId);
        const electionIdBytes32 = ethers.encodeBytes32String(voteData.electionId);
        const candidateIdBytes32 = ethers.encodeBytes32String(voteData.candidateId);

        // Convert vote hash to bytes32 if it's a string
        const voteHashBytes32 = typeof voteData.voteHash === 'string'
            ? ethers.encodeBytes32String(voteData.voteHash)
            : voteData.voteHash;

        // Send transaction (MetaMask will prompt)
        const tx = await contract.castVote(
            voteIdBytes32,
            electionIdBytes32,
            candidateIdBytes32,
            voteData.voterId,
            voteData.encryptedVote,
            voteHashBytes32,
            voteData.signature
        );

        console.log('📡 Transaction sent:', tx.hash);
        console.log('⏳ Waiting for confirmation...');

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        console.log('✅ Vote cast successfully!');
        console.log('Block:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());

        return {
            success: true,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            receiptId: voteData.voteId,
        };
    } catch (error) {
        console.error('Error casting vote:', error);

        // User rejected transaction
        if (error.code === 'ACTION_REJECTED') {
            throw new Error('Transaction rejected by user');
        }

        throw error;
    }
}

/**
 * 🔥 REPLACES: fetch('http://localhost:5001/api/verification/verify-receipt')
 * Verify a vote using receipt ID
 */
export async function verifyVoteByReceipt(receiptId) {
    try {
        const contract = getContractForReading();
        const vote = await contract.verifyVoteByReceipt(receiptId);

        if (!vote.exists) {
            return { verified: false, message: 'Vote not found' };
        }

        return {
            verified: vote.verified,
            voteId: ethers.decodeBytes32String(vote.id),
            electionId: ethers.decodeBytes32String(vote.electionId),
            candidateId: ethers.decodeBytes32String(vote.candidateId),
            timestamp: new Date(Number(vote.timestamp) * 1000).toISOString(),
            voteHash: vote.voteHash,
        };
    } catch (error) {
        console.error('Error verifying vote:', error);
        throw error;
    }
}

/**
 * Get blockchain statistics
 */
export async function getBlockchainStats() {
    try {
        const contract = getContractForReading();
        const chainLength = await contract.chainLength();

        return {
            totalBlocks: Number(chainLength),
            network: 'Sepolia',
            contractAddress: CONTRACT_ADDRESS,
        };
    } catch (error) {
        console.error('Error fetching blockchain stats:', error);
        throw error;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format wallet address for display
 */
export function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Listen for wallet changes
 */
export function onWalletChange(callback) {
    if (!isMetaMaskInstalled()) return;

    window.ethereum.on('accountsChanged', (accounts) => {
        callback(accounts[0] || null);
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

/**
 * Get Etherscan link for transaction
 */
export function getEtherscanLink(txHash) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
}

/**
 * Get Etherscan link for address
 */
export function getAddressLink(address) {
    return `https://sepolia.etherscan.io/address/${address}`;
}
