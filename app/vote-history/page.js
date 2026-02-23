'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    History,
    ArrowLeft,
    ExternalLink,
    Calendar,
    Hash,
    FileCheck,
    Loader2,
    MapPin
} from 'lucide-react';

// API Configuration - Uses environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Cookie utilities
const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export default function VoteHistoryPage() {
    const router = useRouter();
    const [votingHistory, setVotingHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchVotingHistory();
    }, []);

    const fetchVotingHistory = async () => {
        try {
            setLoading(true);
            setError('');

            const token = getCookie('voteGuardToken');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.status === 401) {
                router.push('/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch voting history');
            }

            const data = await response.json();
            setVotingHistory(data.history || []);
        } catch (err) {
            console.error('Error fetching history:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1121] font-sans text-slate-200">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
            </div>

            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-[#0B1121]/95 backdrop-blur-xl border-b border-slate-800/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-white">VoteGuard</span>
                            <span className="hidden sm:inline text-xs text-slate-400 ml-2">Vote History</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 mx-auto mb-6 bg-blue-600/20 rounded-full flex items-center justify-center border-4 border-blue-500">
                        <History size={36} className="text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Immutable Vote History</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Your complete voting record stored on the blockchain with cryptographic proof.
                        Each vote is permanently recorded and cannot be altered.
                    </p>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-blue-400" />
                        <span className="ml-3 text-slate-400">Loading history...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-900/20 border border-red-700/40 rounded-xl p-6 mb-6 flex items-start gap-3"
                    >
                        <AlertCircle size={24} className="text-red-400 shrink-0" />
                        <div>
                            <p className="font-bold text-red-400 mb-1">Error Loading History</p>
                            <p className="text-sm text-red-300">{error}</p>
                            <button
                                onClick={fetchVotingHistory}
                                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Vote History List */}
                {!loading && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {votingHistory.length > 0 ? (
                            <div className="space-y-4">
                                {votingHistory.map((vote, index) => (
                                    <motion.div
                                        key={vote.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 hover:bg-slate-800/60 transition-all group"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            {/* Left Side - Vote Info */}
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:border-green-500/40 shrink-0">
                                                    <CheckCircle2 size={20} className="text-green-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-white mb-1">
                                                        {vote.election}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {vote.date}
                                                        </span>
                                                        {vote.constituency && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={14} />
                                                                {vote.constituency}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side - Transaction Info */}
                                            <div className="md:text-right">
                                                <div className="mb-2">
                                                    <p className="text-xs text-slate-500 mb-1">Transaction Hash</p>
                                                    <p className="font-mono text-sm text-slate-300 flex items-center gap-2 md:justify-end">
                                                        <Hash size={14} className="text-blue-400" />
                                                        {vote.txHash}
                                                    </p>
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
                                                    <CheckCircle2 size={12} className="text-green-400" />
                                                    <span className="text-xs text-green-400 uppercase tracking-wider font-bold">
                                                        {vote.status || 'Confirmed'}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Additional Details (Expandable) */}
                                        {vote.receiptHash && (
                                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500 flex items-center gap-1">
                                                        <FileCheck size={14} />
                                                        Receipt Hash
                                                    </span>
                                                    <span className="font-mono text-slate-400">{vote.receiptHash}</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 mx-auto mb-6 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/60">
                                    <History size={48} className="text-slate-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">No Voting History</h2>
                                <p className="text-slate-400 mb-6">You haven't cast any votes yet</p>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Info Box */}
                {!loading && votingHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 bg-blue-900/20 border border-blue-700/40 rounded-xl p-6"
                    >
                        <div className="flex items-start gap-3">
                            <ShieldCheck size={20} className="text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-slate-300">
                                <p className="font-bold text-white mb-2">Blockchain Security</p>
                                <ul className="space-y-1 text-slate-400">
                                    <li>• All votes are cryptographically signed and stored on Ethereum</li>
                                    <li>• Transaction hashes provide immutable proof of your vote</li>
                                    <li>• Your vote choices remain anonymous and encrypted</li>
                                    <li>• Each receipt can be independently verified</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
