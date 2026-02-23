'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    X,
    Vote,
    Info,
    Lock,
    FileCheck,
    ExternalLink,
    Download,
    Clock,
    User,
    MapPin,
    Calendar,
    Hash,
    Zap,
    Shield,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

// Mock data (fallback if backend fails)
const USER_SESSION = {
    name: "Aarav Sharma",
    citizenId: "9876-5432-1012",
    constituency: "Mumbai South",
    ward: "Ward A - Colaba"
};

const ACTIVE_ELECTION = {
    id: "e-2025-gen",
    title: "2025 National General Election",
    description: "Member of Parliament Election",
    constituency: "Mumbai South",
    startDate: "January 5, 2025",
    endDate: "January 5, 2025, 6:00 PM IST",
    totalVoters: "1.2M",
    votedCount: "847K"
};

const CANDIDATES = [
    {
        id: 1,
        name: "Dr. Rajesh Kumar",
        party: "Progressive Alliance Party",
        symbol: "🌳",
        age: 52,
        education: "PhD in Economics, IIT Delhi",
        experience: "15 years in public service",
        keyPoints: [
            "Infrastructure & Urban Development",
            "Education Reform & Skill Training",
            "Healthcare Accessibility",
            "Digital Economy Growth"
        ]
    },
    {
        id: 2,
        name: "Anita Deshmukh",
        party: "Unity Front Coalition",
        symbol: "🌅",
        age: 48,
        education: "MBA, Harvard Business School",
        experience: "Former State Minister, 10 years",
        keyPoints: [
            "Job Creation & MSME Support",
            "Women's Safety & Empowerment",
            "Environmental Sustainability",
            "Affordable Housing Schemes"
        ]
    },
    {
        id: 3,
        name: "Mohammed Akhtar",
        party: "People's Democratic Coalition",
        symbol: "⭐",
        age: 45,
        education: "LLB, National Law School",
        experience: "Civil Rights Lawyer, 20 years",
        keyPoints: [
            "Agricultural Support & Fair Pricing",
            "Social Justice & Equality",
            "Public Transport Infrastructure",
            "Anti-Corruption Measures"
        ]
    },
    {
        id: 4,
        name: "Priya Menon",
        party: "Progressive Democratic Movement",
        symbol: "🦅",
        age: 41,
        education: "B.Tech IIT Bombay, MS Stanford",
        experience: "Tech Entrepreneur, 12 years",
        keyPoints: [
            "Youth Employment & Startups",
            "Technology & Innovation Hubs",
            "Quality Education for All",
            "Climate Action & Renewable Energy"
        ]
    }
];


export default function VoteGuardBallot() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState('ballot');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [expandedCandidate, setExpandedCandidate] = useState(null);
    const [receiptHash, setReceiptHash] = useState('');
    const [encodedFormats, setEncodedFormats] = useState(null); // Store encoded receipt formats
    const [voteTimestamp, setVoteTimestamp] = useState(null); // Store actual vote timestamp
    const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds

    // Get election ID from query params
    const electionId = searchParams.get('electionId');

    // Backend integration state
    const [backendData, setBackendData] = useState({
        election: null,
        candidates: [],
        hasVoted: false,
        user: null
    });
    const [usingBackend, setUsingBackend] = useState(false);
    const [backendError, setBackendError] = useState('');

    // API Base URL from environment variable
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    // Try to fetch data from backend on mount
    useEffect(() => {
        const tryBackendData = async () => {
            try {
                // Build URL with electionId if available
                const url = electionId
                    ? `${API_BASE_URL}/api/vote/ballot?electionId=${encodeURIComponent(electionId)}`
                    : `${API_BASE_URL}/api/vote/ballot`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // This will include cookies
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

                    // If user already voted, show receipt
                    if (result.hasVoted) {
                        setCurrentStep('already-voted');
                        if (result.receiptHash) {
                            setReceiptHash(result.receiptHash);
                        }
                    }
                } else {
                    console.log('Backend not available, using mock data:', result.message);
                    setBackendError(result.message);
                }
            } catch (error) {
                console.log('Backend connection failed, using mock data');
                setBackendError(error.message);
            }
        };

        tryBackendData();
    }, [electionId]); // Re-fetch if electionId changes

    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCastVote = async () => {
        setCurrentStep('casting');

        // Try backend first if available
        if (usingBackend && backendData.election) {
            try {
                const voteData = {
                    electionId: backendData.election.id,
                    candidateId: selectedCandidate
                };

                const response = await fetch(`${API_BASE_URL}/api/vote/cast`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // This will include cookies
                    body: JSON.stringify(voteData)
                });

                const result = await response.json();

                if (response.ok) {
                    setReceiptHash(result.receiptHash);
                    // Store encoded formats if available
                    if (result.encodedFormats) {
                        setEncodedFormats(result.encodedFormats);
                    }
                    // Store the actual timestamp from backend
                    if (result.timestamp) {
                        setVoteTimestamp(result.timestamp);
                    }
                    setCurrentStep('confirmed');
                    return;
                } else {
                    // Backend error - show to user and reset
                    alert(`❌ Vote Failed: ${result.message || 'Unknown error'}\n\nDetails: ${result.details || ''}`);
                    setCurrentStep('voting');
                    return;
                }
            } catch (error) {
                console.error('Vote casting error:', error);
                alert(`❌ Network Error: Unable to reach voting server\n\n${error.message}`);
                setCurrentStep('voting');
                return;
            }
        }

        // Fallback to mock transaction (only if not using backend)
        setTimeout(() => {
            setReceiptHash(`0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`);
            setCurrentStep('confirmed');
        }, 4000);
    };

    // Get data to use (backend or mock)
    const currentData = {
        election: usingBackend ? backendData.election : ACTIVE_ELECTION,
        candidates: usingBackend ? backendData.candidates : CANDIDATES,
        user: usingBackend ? backendData.user : USER_SESSION
    };

    return (
        <div className="min-h-screen bg-[#0B1121] font-sans text-slate-200">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
            </div>

            {/* Top Bar */}
            <nav className="sticky top-0 z-50 bg-[#0B1121]/95 backdrop-blur-xl border-b border-slate-800/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-white">VoteGuard</span>
                            <span className="hidden sm:inline text-xs text-slate-400 ml-2">Secure Voting Portal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Timer */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${timeLeft < 60
                            ? 'bg-red-900/20 border-red-700/40 text-red-400'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                            }`}>
                            <Clock size={14} />
                            <span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                        {/* Auth Badge */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                            <CheckCircle2 size={14} className="text-green-400" />
                            <span className="text-xs text-green-400 font-medium">
                                {usingBackend ? 'Backend Connected' : 'Mock Mode'}
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Backend Status */}
            {backendError && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
                    <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-300">
                            <p>Using mock data - Backend: {backendError}</p>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {currentStep === 'ballot' && (
                    <BallotPage
                        election={currentData.election}
                        candidates={currentData.candidates}
                        user={currentData.user}
                        selectedCandidate={selectedCandidate}
                        setSelectedCandidate={setSelectedCandidate}
                        expandedCandidate={expandedCandidate}
                        setExpandedCandidate={setExpandedCandidate}
                        onProceed={() => setCurrentStep('review')}
                        timeLeft={timeLeft}
                    />
                )}

                {currentStep === 'review' && (
                    <ReviewPage
                        election={currentData.election}
                        candidate={currentData.candidates.find(c => c.id === selectedCandidate)}
                        user={currentData.user}
                        onBack={() => setCurrentStep('ballot')}
                        onConfirm={handleCastVote}
                    />
                )}

                {currentStep === 'casting' && (
                    <CastingPage />
                )}

                {currentStep === 'confirmed' && (
                    <ConfirmationPage
                        receiptHash={receiptHash}
                        encodedFormats={encodedFormats}
                        voteTimestamp={voteTimestamp}
                        election={currentData.election}
                        candidate={currentData.candidates.find(c => c.id === selectedCandidate)}
                    />
                )}

                {currentStep === 'already-voted' && (
                    <AlreadyVotedPage
                        receiptHash={receiptHash}
                        election={currentData.election}
                        user={currentData.user}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Ballot Page
const BallotPage = ({ election, candidates, user, selectedCandidate, setSelectedCandidate, expandedCandidate, setExpandedCandidate, onProceed, timeLeft }) => (
    <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6"
    >
        {/* Compact Header */}
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{election?.title || 'Election'}</h1>
                    <p className="text-sm text-slate-400 flex items-center gap-1.5">
                        <MapPin size={14} className="text-blue-400" />
                        {election?.constituency || user?.citizen?.constituency}
                    </p>
                </div>
                {/* Stats */}
                <div className="hidden md:flex gap-3">
                    <StatBadge label="Ward" value={user?.citizen?.ward || 'N/A'} />
                    <StatBadge label="Status" value="LIVE" />
                </div>
            </div>

            {/* Security Notice - Compact */}
            <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 flex items-start gap-3">
                <Shield size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                    <p className="font-semibold text-white mb-1">Cryptographically Secured Voting</p>
                    <p className="text-xs text-slate-400">Your vote is encrypted with Paillier cryptography and permanently recorded with a unique receipt hash.</p>
                </div>
            </div>
        </div>

        {/* Candidates Grid */}
        <div className="space-y-3 mb-20">
            {candidates.map((candidate) => (
                <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedCandidate === candidate.id}
                    isExpanded={expandedCandidate === candidate.id}
                    onSelect={() => setSelectedCandidate(candidate.id)}
                    onToggleExpand={() => setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)}
                />
            ))}
        </div>

        {/* Sticky Bottom Bar - Compact */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        {selectedCandidate ? (
                            <>
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30 shrink-0">
                                    <CheckCircle2 size={18} className="text-green-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500">Selected</p>
                                    <p className="font-bold text-white text-sm truncate">
                                        {candidates.find(c => c.id === selectedCandidate)?.name}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                    <Vote size={18} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">No selection</p>
                                    <p className="text-sm text-slate-400">Choose a candidate</p>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        disabled={!selectedCandidate || timeLeft <= 0}
                        onClick={onProceed}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                        Review & Cast
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    </motion.main>
);

// Compact Candidate Card
const CandidateCard = ({ candidate, isSelected, isExpanded, onSelect, onToggleExpand }) => (
    <motion.div
        layout
        className={`bg-slate-800/40 backdrop-blur-md border rounded-xl overflow-hidden transition-all ${isSelected
            ? 'border-blue-500 shadow-lg shadow-blue-900/20'
            : 'border-slate-700/60 hover:border-slate-600'
            }`}
    >
        <div
            className="p-4 cursor-pointer"
            onClick={onSelect}
        >
            <div className="flex items-start gap-4">
                {/* Compact Symbol */}
                <div className="w-16 h-16 bg-slate-900/60 rounded-xl flex items-center justify-center text-3xl border border-slate-700/50 shrink-0">
                    {candidate.symbol}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold text-white truncate">{candidate.name}</h3>
                            <p className="text-sm text-slate-400 truncate">{candidate.party}</p>
                        </div>
                        {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={14} className="text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                        {candidate.age && (
                            <span className="text-xs px-2 py-1 bg-slate-900/60 rounded border border-slate-700/50 text-slate-300">
                                {candidate.age} years
                            </span>
                        )}
                        {candidate.experience && (
                            <span className="text-xs px-2 py-1 bg-slate-900/60 rounded border border-slate-700/50 text-slate-300 truncate">
                                {candidate.experience}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand();
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                    >
                        {isExpanded ? 'Hide' : 'View'} Manifesto
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                </div>
            </div>
        </div>

        {/* Compact Manifesto */}
        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-700/50 bg-slate-900/30 px-4 py-3"
                >
                    <div className="grid sm:grid-cols-2 gap-2">
                        {candidate.keyPoints.map((point, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-blue-400 shrink-0 mt-0.5" />
                                <span>{point}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

// Review Page - Compact
const ReviewPage = ({ election, candidate, user, onBack, onConfirm }) => (
    <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8"
    >
        <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-600/10 rounded-full flex items-center justify-center border border-orange-500/20">
                <AlertCircle size={32} className="text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Confirm Your Vote</h1>
            <p className="text-sm text-slate-400">
                Your vote will be permanently recorded with cryptographic security
            </p>
        </div>

        {/* Review Card - Compact */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-700/50">
                <div className="w-20 h-20 bg-slate-900/60 rounded-xl flex items-center justify-center text-5xl border border-slate-700/50">
                    {candidate?.symbol || '?'}
                </div>
                <div>
                    <p className="text-xs text-slate-500 mb-1">VOTING FOR</p>
                    <h2 className="text-2xl font-bold text-white">{candidate?.name || 'Unknown'}</h2>
                    <p className="text-sm text-slate-400">{candidate?.party || 'Independent'}</p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-xs text-slate-500 mb-1">Election</p>
                    <p className="text-white font-medium">{election?.title || 'General Election'}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 mb-1">Constituency</p>
                    <p className="text-white font-medium">{election?.constituency || user?.citizen?.constituency}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 mb-1">Voter</p>
                    <p className="text-white font-medium">{user?.citizen?.fullName || 'Anonymous'}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 mb-1">Citizen ID</p>
                    <p className="text-white font-medium font-mono">{user?.citizenId || 'N/A'}</p>
                </div>
            </div>
        </div>

        {/* Security Notice - Compact */}
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2 text-xs text-slate-300">
                <Lock size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold text-white mb-1">Cryptographic Security</p>
                    <p className="text-slate-400">Encrypted with Paillier cryptography • Signed with your credentials • Immutable receipt hash</p>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
            <button
                onClick={onBack}
                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700"
            >
                Back
            </button>
            <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
                Cast Vote
                <Vote size={20} />
            </button>
        </div>
    </motion.main>
);

// Casting Page - Compact
const CastingPage = () => (
    <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-2xl mx-auto px-4 py-12 text-center min-h-[70vh] flex items-center justify-center"
    >
        <div>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto mb-6 bg-blue-600/20 rounded-full flex items-center justify-center border-4 border-blue-500"
            >
                <Zap size={36} className="text-blue-400" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-3">Casting Your Vote...</h1>
            <p className="text-sm text-slate-400 mb-8">Recording on blockchain</p>

            <div className="space-y-3 max-w-sm mx-auto text-left">
                <ProcessStep status="complete" text="Encrypting vote" />
                <ProcessStep status="active" text="Signing transaction" />
                <ProcessStep status="pending" text="Broadcasting to network" />
                <ProcessStep status="pending" text="Confirming block" />
            </div>
        </div>
    </motion.main>
);

// Confirmation Page - Enhanced with Encoded Receipts
const ConfirmationPage = ({ receiptHash, encodedFormats, voteTimestamp, election, candidate }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyReceipt = () => {
        if (encodedFormats?.base64) {
            navigator.clipboard.writeText(encodedFormats.base64);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleDownloadQR = () => {
        if (encodedFormats?.qrCode) {
            const link = document.createElement('a');
            link.href = encodedFormats.qrCode;
            link.download = `vote-receipt-${receiptHash.substring(0, 8)}.png`;
            link.click();
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-3xl mx-auto px-4 py-8 text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500"
            >
                <CheckCircle2 size={48} className="text-green-400" />
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-3">Vote Cast Successfully!</h1>
            <p className="text-slate-400 mb-8">Your vote has been securely recorded with cryptographic proof</p>

            {/* Transaction Receipt - Compact */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 mb-6 text-left">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                    <h3 className="text-lg font-bold text-white">Vote Receipt</h3>
                    <span className="text-xs px-3 py-1 bg-green-500/10 rounded-lg border border-green-500/20 text-green-400 font-bold">CONFIRMED</span>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Receipt Hash</span>
                        <span className="font-mono text-white break-all">{receiptHash}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Candidate</span>
                        <span className="text-white">{candidate?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Election</span>
                        <span className="text-white">{election?.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Timestamp</span>
                        <span className="text-white">{voteTimestamp ? new Date(voteTimestamp).toLocaleString() : new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Encoded Receipt Section - NEW */}
            {encodedFormats && (
                <div className="bg-slate-800/40 backdrop-blur-md border border-blue-700/60 rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Hash size={20} className="text-blue-400" />
                        Encoded Receipt
                    </h3>

                    {/* QR Code Display */}
                    {encodedFormats.qrCode && (
                        <div className="mb-6">
                            <p className="text-sm text-slate-400 mb-3">Scan this QR code to verify your vote:</p>
                            <div className="bg-white p-4 rounded-xl inline-block">
                                <img
                                    src={encodedFormats.qrCode}
                                    alt="Vote Receipt QR Code"
                                    className="w-48 h-48 mx-auto"
                                />
                            </div>
                        </div>
                    )}

                    {/* Barcode Number */}
                    {encodedFormats.barcode && (
                        <div className="mb-4 p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                            <p className="text-xs text-slate-500 mb-2">Barcode Number:</p>
                            <p className="font-mono text-xl text-blue-400 font-bold tracking-wider">
                                {encodedFormats.barcode}
                            </p>
                        </div>
                    )}

                    {/* Base64 Receipt Code */}
                    {encodedFormats.base64 && (
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                            <p className="text-xs text-slate-500 mb-2">Encoded Receipt (Base64):</p>
                            <p className="font-mono text-xs text-slate-300 break-all">
                                {encodedFormats.base64.substring(0, 60)}...
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons - Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {encodedFormats?.qrCode && (
                    <button
                        onClick={handleDownloadQR}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Download QR Code
                    </button>
                )}
                {encodedFormats?.base64 && (
                    <button
                        onClick={handleCopyReceipt}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <FileCheck size={18} />
                        {copySuccess ? 'Copied!' : 'Copy Receipt Code'}
                    </button>
                )}
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
                >
                    <ExternalLink size={18} />
                    Go to Dashboard
                </button>
                <button
                    onClick={() => window.location.href = '/verify-receipt'}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    <ShieldCheck size={18} />
                    Verify Receipt
                </button>
            </div>
        </motion.main>
    );
};

// Already Voted Page
const AlreadyVotedPage = ({ receiptHash, election, user }) => (
    <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-3xl mx-auto px-4 py-8 text-center"
    >
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center border-4 border-blue-500">
            <CheckCircle2 size={48} className="text-blue-400" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-3">Already Voted</h1>
        <p className="text-slate-400 mb-8">You have already cast your vote in this election</p>

        {/* Receipt Display */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 mb-6 text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                <h3 className="text-lg font-bold text-white">Your Vote Receipt</h3>
                <span className="text-xs px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400 font-bold">RECORDED</span>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-400">Receipt Hash</span>
                    <span className="font-mono text-white break-all">{receiptHash || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Election</span>
                    <span className="text-white">{election?.title}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Voter</span>
                    <span className="text-white">{user?.citizen?.fullName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Constituency</span>
                    <span className="text-white">{election?.constituency}</span>
                </div>
            </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2 text-xs text-slate-300">
                <Shield size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold text-white mb-1">Vote Security</p>
                    <p className="text-slate-400">Your vote is securely recorded and cannot be changed. The system prevents double voting.</p>
                </div>
            </div>
        </div>

        <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mx-auto"
        >
            <ExternalLink size={18} />
            Go to Dashboard
        </button>
    </motion.main>
);
const StatBadge = ({ label, value }) => (
    <div className="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/60">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
    </div>
);

const ProcessStep = ({ status, text }) => (
    <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${status === 'complete' ? 'bg-green-500' :
            status === 'active' ? 'bg-blue-500 animate-pulse' :
                'bg-slate-700'
            }`}>
            {status === 'complete' && <CheckCircle2 size={12} className="text-white" />}
        </div>
        <span className={`text-sm ${status === 'pending' ? 'text-slate-500' : 'text-slate-300'}`}>{text}</span>
    </div>
);