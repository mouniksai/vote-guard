'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    TrendingUp, Crown, Users, BarChart3, Calendar, Clock,
    ArrowLeft, Trophy, Medal, Award, Target, ExternalLink,
    ShieldCheck, History, ChevronDown, ChevronRight, Eye,
    Download, Share2, Filter, RefreshCw, Loader2, AlertCircle
} from 'lucide-react';

// Global API Configuration - Uses environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Cookie utilities for authentication
const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export default function ResultsPage() {
    const [electionHistory, setElectionHistory] = useState([]);
    const [selectedElection, setSelectedElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedElection, setExpandedElection] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // all, ended, live
    const router = useRouter();

    useEffect(() => {
        // Check authentication
        const token = getCookie('voteGuardToken');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchElectionResults();
    }, [router]);

    const fetchElectionResults = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getCookie('voteGuardToken');
            const response = await fetch(`${API_BASE_URL}/api/elections/results`, {
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
                throw new Error('Failed to fetch election results');
            }

            const data = await response.json();
            setElectionHistory(data.elections || []);

            // Auto-select the most recent completed election
            const latestCompleted = data.elections?.find(e => e.status === 'ENDED');
            if (latestCompleted) {
                setSelectedElection(latestCompleted);
            }

        } catch (err) {
            setError(err.message);
            console.error('Results fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleElectionSelect = (election) => {
        setSelectedElection(election);
        setExpandedElection(expandedElection === election.id ? null : election.id);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ENDED': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'LIVE': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'UPCOMING': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getTotalVotes = (candidates) => {
        return candidates?.reduce((sum, candidate) => sum + candidate.voteCount, 0) || 0;
    };

    const getWinner = (candidates) => {
        if (!candidates || candidates.length === 0) return null;
        return candidates.reduce((winner, candidate) =>
            candidate.voteCount > (winner?.voteCount || 0) ? candidate : winner
        );
    };

    const filteredElections = electionHistory.filter(election => {
        if (filterStatus === 'all') return true;
        return election.status.toLowerCase() === filterStatus.toLowerCase();
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1121] flex items-center justify-center">
                <div className="flex items-center gap-3 text-white">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Loading election results...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1121] font-sans text-slate-200 selection:bg-blue-500 selection:text-white">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
            </div>

            {/* Header */}
            <nav className="sticky top-0 z-50 bg-[#0B1121]/80 backdrop-blur-xl border-b border-slate-800/60">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-400" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600 p-2 rounded-lg shadow-lg shadow-purple-900/20">
                                <BarChart3 size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-xl text-white tracking-tight">Election Results</h1>
                                <p className="text-sm text-slate-400">Complete election history and analytics</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchElectionResults}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <RefreshCw size={18} className="text-slate-400" />
                        </button>
                        <div className="flex bg-slate-800 rounded-lg p-1">
                            {['all', 'ended', 'live'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setFilterStatus(filter)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterStatus === filter
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {error ? (
                    <div className="text-center py-12">
                        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-bold mb-2 text-white">Error Loading Results</h2>
                        <p className="text-slate-400 mb-4">{error}</p>
                        <button
                            onClick={fetchElectionResults}
                            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Elections List */}
                        <div className="lg:col-span-1">
                            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-[2rem] p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Election History</h2>
                                    <span className="text-sm text-slate-400">{filteredElections.length} elections</span>
                                </div>

                                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {filteredElections.length === 0 ? (
                                        <div className="text-center py-8">
                                            <History size={32} className="mx-auto mb-2 text-slate-600" />
                                            <p className="text-slate-400">No elections found</p>
                                        </div>
                                    ) : (
                                        filteredElections.map((election) => (
                                            <motion.div
                                                key={election.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedElection?.id === election.id
                                                    ? 'border-blue-500 bg-blue-500/10'
                                                    : 'border-slate-700/30 bg-slate-900/40 hover:border-slate-600'
                                                    }`}
                                                onClick={() => handleElectionSelect(election)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-white mb-1">{election.title}</h3>
                                                        <p className="text-sm text-slate-400 mb-2">{election.constituency}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(election.status)}`}>
                                                                {election.status}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {formatDate(election.endTime)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight
                                                        size={16}
                                                        className={`text-slate-400 transition-transform ${selectedElection?.id === election.id ? 'rotate-90' : ''
                                                            }`}
                                                    />
                                                </div>

                                                {election.status === 'ENDED' && (
                                                    <div className="mt-3 pt-3 border-t border-slate-700/30">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-slate-400">Total Votes:</span>
                                                            <span className="font-semibold text-white">
                                                                {getTotalVotes(election.candidates)}
                                                            </span>
                                                        </div>
                                                        {getWinner(election.candidates) && (
                                                            <div className="flex items-center justify-between text-sm mt-1">
                                                                <span className="text-slate-400">Winner:</span>
                                                                <span className="font-semibold text-green-400">
                                                                    {getWinner(election.candidates).name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results */}
                        <div className="lg:col-span-2">
                            {selectedElection ? (
                                <ElectionResultDetails election={selectedElection} />
                            ) : (
                                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-[2rem] p-12 text-center">
                                    <BarChart3 size={64} className="mx-auto mb-4 text-slate-600" />
                                    <h2 className="text-xl font-bold text-white mb-2">Select an Election</h2>
                                    <p className="text-slate-400">Choose an election from the list to view detailed results and analytics</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Detailed Election Results Component
const ElectionResultDetails = ({ election }) => {
    const getTotalVotes = (candidates) => {
        return candidates?.reduce((sum, candidate) => sum + candidate.voteCount, 0) || 0;
    };

    const getWinner = (candidates) => {
        if (!candidates || candidates.length === 0) return null;
        return candidates.reduce((winner, candidate) =>
            candidate.voteCount > (winner?.voteCount || 0) ? candidate : winner
        );
    };

    const totalVotes = getTotalVotes(election.candidates);
    const winner = getWinner(election.candidates);


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Election Header */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-[2rem] p-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">{election.title}</h1>
                        <p className="text-slate-400 mb-4">{election.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(election.startTime)} - {formatDate(election.endTime)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users size={14} />
                                {election.constituency}
                            </span>
                        </div>
                    </div>
                    {winner && election.status === 'ENDED' && (
                        <div className="text-center">
                            <Crown size={32} className="mx-auto mb-2 text-yellow-400" />
                            <p className="text-sm text-slate-400 mb-1">Winner</p>
                            <p className="font-bold text-yellow-400">{winner.name}</p>
                            <p className="text-xs text-slate-500">{winner.party}</p>
                        </div>
                    )}
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/40 rounded-xl p-4 text-center">
                        <Users size={24} className="mx-auto mb-2 text-blue-400" />
                        <p className="text-2xl font-bold text-white">{totalVotes}</p>
                        <p className="text-sm text-slate-400">Total Votes</p>
                    </div>
                    <div className="bg-slate-900/40 rounded-xl p-4 text-center">
                        <Target size={24} className="mx-auto mb-2 text-purple-400" />
                        <p className="text-2xl font-bold text-white">{election.candidates?.length || 0}</p>
                        <p className="text-sm text-slate-400">Candidates</p>
                    </div>
                    <div className="bg-slate-900/40 rounded-xl p-4 text-center">
                        <BarChart3 size={24} className="mx-auto mb-2 text-green-400" />
                        <p className="text-2xl font-bold text-white">
                            {winner ? Math.round((winner.voteCount / totalVotes) * 100) : 0}%
                        </p>
                        <p className="text-sm text-slate-400">Winning Margin</p>
                    </div>
                </div>
            </div>

            {/* Candidates Results */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-[2rem] p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-400" />
                    Results Breakdown
                </h2>

                <div className="space-y-4">
                    {election.candidates
                        ?.sort((a, b) => b.voteCount - a.voteCount)
                        .map((candidate, index) => {
                            const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                            const isWinner = candidate.id === winner?.id;

                            return (
                                <motion.div
                                    key={candidate.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-6 rounded-xl border-2 ${isWinner
                                        ? 'border-yellow-500/50 bg-yellow-500/5'
                                        : 'border-slate-700/30 bg-slate-900/40'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            {index === 0 && isWinner && (
                                                <Medal size={24} className="text-yellow-400" />
                                            )}
                                            {index === 1 && (
                                                <Medal size={24} className="text-slate-400" />
                                            )}
                                            {index === 2 && (
                                                <Medal size={24} className="text-orange-400" />
                                            )}
                                            <div>
                                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                    {candidate.name}
                                                    <span className="text-2xl">{candidate.symbol}</span>
                                                </h3>
                                                <p className="text-slate-400">{candidate.party}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-white">{candidate.voteCount}</p>
                                            <p className="text-sm text-slate-400">{percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>

                                    {/* Vote Progress Bar */}
                                    <div className="w-full bg-slate-700/30 rounded-full h-2 mb-3">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className={`h-2 rounded-full ${isWinner
                                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                                                : 'bg-gradient-to-r from-blue-600 to-blue-500'
                                                }`}
                                        />
                                    </div>

                                    {/* Candidate Details */}
                                    {candidate.keyPoints && candidate.keyPoints.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-700/30">
                                            <p className="text-sm text-slate-400 mb-2">Key Points:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {candidate.keyPoints.slice(0, 3).map((point, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-slate-800/50 rounded-md text-xs text-slate-300"
                                                    >
                                                        {point}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};