'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Vote,
    History,
    ShieldCheck,
    TrendingUp,
    Clock,
    ExternalLink,
    LogOut,
    Bell,
    FileCheck,
    ChevronRight,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Loader2,
    BarChart3,
    Scan
} from 'lucide-react';

// Global API Configuration - Change this URL to update backend endpoint everywhere
const API_BASE_URL = 'http://localhost:5001';

// Cookie utilities for authentication
const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const setCookie = (name, value, days = 7) => {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

const deleteCookie = (name) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Live updates mock data (can be replaced with WebSocket or API later)
const LIVE_UPDATES = [
    { time: "10:45 AM", msg: "Polling stations in Ward A reporting 15% higher turnout than 2024." },
    { time: "09:15 AM", msg: "Election Commission has verified all biometric nodes are online." },
    { time: "08:00 AM", msg: "Voting lines opened. Ethereum Gas fees stabilized." }
];

export default function VoteGuardDashboard() {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated before fetching dashboard data
        const token = getCookie('voteGuardToken');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchDashboardData();
    }, [router]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get token from cookie
            const token = getCookie('voteGuardToken');
            const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Include cookies
            });

            if (response.status === 401) {
                deleteCookie('voteGuardToken');
                deleteCookie('voteGuardUser');
                router.push('/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            setError(err.message);
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            // Call logout endpoint to clear backend cookies
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getCookie('voteGuardToken')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
        } catch (err) {
            console.log('Logout API call failed, clearing cookies locally');
        }

        // Clear cookies on frontend
        deleteCookie('voteGuardToken');
        deleteCookie('voteGuardUser');
        router.push('/login');
    };

    const handleVoteClick = () => {
        if (dashboardData?.activeElection) {
            router.push('/verify');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1121] flex items-center justify-center">
                <div className="flex items-center gap-3 text-white">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#0B1121] flex items-center justify-center">
                <div className="text-center text-white">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Extract data from backend response
    const userSession = dashboardData?.userSession || {};
    const activeElection = dashboardData?.activeElection;
    const votingHistory = dashboardData?.history || [];

    return (
        <div className="min-h-screen bg-[#0B1121] font-sans text-slate-200 selection:bg-blue-500 selection:text-white pb-12">

            {/* Ambient Background (Consistent with Login) */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
            </div>

            {/* --- TOP NAVIGATION --- */}
            <nav className="sticky top-0 z-50 bg-[#0B1121]/80 backdrop-blur-xl border-b border-slate-800/60">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">VoteGuard</span>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-semibold text-white">{userSession.name || 'User'}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs text-slate-400">
                                    {userSession.verified ? 'Verified Citizen' : 'Unverified'}
                                </span>
                            </div>
                        </div>

                        {/* Results Button */}
                        <button
                            onClick={() => router.push('/results')}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 text-sm font-medium transition-all border border-purple-500/20 hover:border-purple-500/40"
                        >
                            <BarChart3 size={16} />
                            <span>Results</span>
                        </button>

                        {/* Notification Bell */}
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="p-2.5 rounded-full hover:bg-slate-800 transition-colors relative text-slate-400 hover:text-white"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B1121]"></span>
                        </button>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sm font-medium transition-all border border-slate-700 hover:border-slate-600 text-slate-200"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- MAIN DASHBOARD CONTENT --- */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">

                {/* WELCOME HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                        <p className="text-slate-400 flex items-center gap-2">
                            <MapPin size={14} className="text-blue-500" />
                            {userSession.constituency || 'Unknown Constituency'} • {userSession.ward || 'Unknown Ward'}
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-500 font-mono">SESSION ID</p>
                        <p className="text-sm text-slate-300 font-mono">0x8a7...b29f</p>
                    </div>
                </motion.div>

                {/* BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

                    {/* 1. HERO WIDGET: ACTIVE ELECTION (Takes 2x2 space) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className={`md:col-span-2 lg:col-span-2 row-span-2 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl group ${activeElection
                            ? 'bg-gradient-to-br from-blue-700 to-blue-900 shadow-blue-900/30'
                            : 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-slate-900/30'
                            }`}
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/15 transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            {activeElection ? (
                                <>
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold mb-5 border border-white/10 shadow-inner">
                                            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                                            {activeElection.status.toUpperCase()}
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
                                            {activeElection.title}
                                        </h2>
                                        <p className="text-blue-100 opacity-80 mb-6 max-w-md leading-relaxed text-sm md:text-base">
                                            {activeElection.description}
                                        </p>
                                    </div>

                                    {/* Action Area */}
                                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row gap-6 items-center justify-between group-hover:border-white/20 transition-all">
                                        <div>
                                            <p className="text-xs text-blue-200 mb-1 uppercase tracking-wider font-semibold">Polls Close In</p>
                                            <div className="text-2xl font-mono font-bold tracking-widest flex items-center gap-2">
                                                <Clock size={20} className="text-blue-300" />
                                                {activeElection.endsIn || 'Calculating...'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleVoteClick}
                                            className="w-full sm:w-auto bg-white text-blue-900 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            Cast Vote <Vote size={20} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <Vote size={64} className="text-slate-400 mb-4" />
                                    <h2 className="text-2xl font-bold mb-2 text-slate-300">No Active Elections</h2>
                                    <p className="text-slate-400">There are currently no active elections in your constituency.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* 2. IDENTITY STATUS CARD (1x1) */}
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-[2rem] p-6 flex flex-col justify-between hover:bg-slate-800/60 transition-colors">
                        <div>
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                                <ShieldCheck className="text-emerald-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Identity Status</h3>
                            <p className="text-xs text-slate-400">Secure Government Node</p>
                        </div>
                        <div className="space-y-3 mt-4">
                            <StatusRow label="Verification" status={userSession.verified ? "Active" : "Pending"} />
                            <StatusRow label="Biometrics" status="Bound" />
                            <div className="pt-3 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500 mb-1">Citizen ID</p>
                                <p className="text-sm font-mono text-slate-300 tracking-wider">
                                    {userSession.citizenId || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. WARD ANALYTICS (1x1) */}
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-[2rem] p-6 flex flex-col justify-between hover:bg-slate-800/60 transition-colors">
                        <div>
                            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
                                <TrendingUp className="text-purple-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Ward Analytics</h3>
                            <p className="text-xs text-slate-400">{userSession.ward || 'Unknown Ward'}</p>
                        </div>
                        <div className="mt-4">
                            <div className="h-24 flex items-end gap-1.5 pb-2">
                                {/* Simulated Bar Chart */}
                                {[40, 65, 85, 55, 30].map((h, i) => (
                                    <div key={i} className="w-full bg-slate-700/50 rounded-t-sm relative group overflow-hidden" style={{ height: `${h}%` }}>
                                        {i === 2 && <div className="absolute inset-0 bg-purple-500/80"></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Turnout</span>
                                <span className="text-white font-bold">68.4%</span>
                            </div>
                        </div>
                    </div>

                    {/* 3.5 VERIFY RECEIPT CARD (1x1) - NEW */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-700/40 rounded-[2rem] p-6 flex flex-col justify-between hover:border-purple-600/60 transition-all group cursor-pointer"
                        onClick={() => router.push('/verify-receipt')}>
                        <div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/30 group-hover:bg-purple-500/30 transition-all">
                                <Scan className="text-purple-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Verify Receipt</h3>
                            <p className="text-xs text-slate-400">Check vote confirmation</p>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                                Verify your encoded receipt against blockchain records
                            </p>
                            <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border border-purple-500/30 group-hover:border-purple-500/50">
                                Verify Now
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* 4. IMMUTABLE HISTORY (Wide Bar) */}
                    <div className="md:col-span-3 lg:col-span-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-[2rem] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-700/50 rounded-lg">
                                    <History size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Immutable Record</h3>
                                    <p className="text-xs text-slate-400">Stored on Ethereum Ledger</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/vote-history')}
                                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                            >
                                Explorer <ExternalLink size={12} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {votingHistory.length > 0 ? (
                                votingHistory.map((vote) => (
                                    <div key={vote.id} className="group flex items-center justify-between p-4 bg-slate-900/40 rounded-xl hover:bg-slate-800/60 transition-all border border-slate-700/30 hover:border-slate-600">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:border-green-500/40">
                                                <CheckCircle2 size={14} className="text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-200">{vote.election}</p>
                                                <p className="text-xs text-slate-500">{vote.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-mono text-slate-400 flex items-center justify-end gap-1">
                                                <span className="opacity-50">Tx:</span> {vote.txHash}
                                            </p>
                                            <p className="text-[10px] text-green-400 uppercase tracking-wider font-bold mt-0.5">
                                                {vote.status || 'Confirmed'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <History size={32} className="mx-auto mb-2 text-slate-600" />
                                    <p className="text-slate-400">No voting history available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. LIVE NOTIFICATIONS (Square) */}
                    <div className="md:col-span-3 lg:col-span-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-[2rem] p-6 relative overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-700/50 rounded-lg">
                                    <AlertCircle size={20} className="text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Live Updates</h3>
                                    <p className="text-xs text-slate-400">System & Election News</p>
                                </div>
                            </div>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {LIVE_UPDATES.map((update, idx) => (
                                <div key={idx} className="flex gap-4 relative pl-2">
                                    {/* Timeline Line */}
                                    {idx !== LIVE_UPDATES.length - 1 && (
                                        <div className="absolute left-[5px] top-6 bottom-[-16px] w-[2px] bg-slate-800"></div>
                                    )}
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600 mt-1.5 shrink-0 z-10 ring-4 ring-[#1e293b]"></div>
                                    <div>
                                        <span className="text-xs font-bold text-blue-400 block mb-0.5">{update.time}</span>
                                        <p className="text-sm text-slate-300 leading-snug">{update.msg}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Decorative Bottom Fade */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1e293b] to-transparent pointer-events-none"></div>
                    </div>

                </div>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTS ---

const StatusRow = ({ label, status }) => (
    <div className="flex items-center justify-between text-sm group">
        <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{label}</span>
        <span className={`font-medium flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${status === "Active"
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
            }`}>
            <CheckCircle2 size={12} /> {status}
        </span>
    </div>
);

