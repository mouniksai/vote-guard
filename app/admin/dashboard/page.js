'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    Vote,
    ShieldAlert,
    Save,
    Loader2,
    Calendar,
    MapPin,
    CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    const router = useRouter();

    // Authentication Check on Load
    useEffect(() => {
        const validateAuthentication = async () => {
            try {
                setIsLoading(true);

                // First check if cookie exists
                const hasCookie = document.cookie.includes('voteGuardToken');
                if (!hasCookie) {
                    console.log('No authentication cookie found');
                    setAuthError('Authentication required');
                    router.push('/login');
                    return;
                }

                // Validate token with server
                const authRes = await fetch(`${API_BASE_URL}/api/admin/validate-token`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (authRes.ok) {
                    const authData = await authRes.json();
                    if (authData.user && authData.user.role === 'admin') {
                        setIsAuthenticated(true);
                        // Now fetch stats after authentication is confirmed
                        await fetchStats();
                    } else {
                        setAuthError('Admin access required');
                        router.push('/login');
                    }
                } else {
                    console.log('Token validation failed:', authRes.status);
                    setAuthError('Invalid or expired token');
                    // Clear the invalid cookie
                    document.cookie = 'voteGuardToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    router.push('/login');
                }
            } catch (error) {
                console.error('Authentication error:', error);
                setAuthError('Authentication failed');
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (res.ok) {
                    setStats(await res.json());
                } else {
                    console.error('Failed to fetch stats:', res.status);
                    // If stats fetch fails due to auth, re-validate
                    if (res.status === 401 || res.status === 403) {
                        setAuthError('Session expired');
                        setIsAuthenticated(false);
                        router.push('/login');
                    }
                }
            } catch (e) {
                console.error('Stats fetch error:', e);
            }
        };

        validateAuthentication();
    }, [router]);

    // Additional security: periodically check if user is still authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        const authCheckInterval = setInterval(async () => {
            try {
                const authRes = await fetch(`${API_BASE_URL}/api/admin/validate-token`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!authRes.ok) {
                    console.log('Periodic auth check failed');
                    setIsAuthenticated(false);
                    setAuthError('Session expired');
                    clearInterval(authCheckInterval);
                    router.push('/login');
                }
            } catch (error) {
                console.error('Periodic auth check error:', error);
            }
        }, 300000); // Check every 5 minutes

        return () => clearInterval(authCheckInterval);
    }, [isAuthenticated, router]);

    // Show loading state while authenticating
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B1121] text-slate-200 font-sans flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-500" />
                    <p className="text-lg">Verifying authentication...</p>
                    <p className="text-sm text-slate-400 mt-2">Please wait while we validate your credentials</p>
                </div>
            </div>
        );
    }

    // Show error state if authentication failed
    if (authError || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0B1121] text-slate-200 font-sans flex items-center justify-center">
                <div className="text-center">
                    <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p className="text-red-400 mb-4">{authError || 'Authentication required'}</p>
                    <p className="text-sm text-slate-400">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1121] text-slate-200 font-sans flex">

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 hidden md:block">
                <div className="flex items-center gap-2 mb-10">
                    <ShieldAlert className="text-red-500" size={28} />
                    <div>
                        <h1 className="font-bold text-white text-lg">AdminPortal</h1>
                        <p className="text-xs text-red-400 font-mono">SECURE MODE</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Overview"
                        isActive={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <SidebarItem
                        icon={Vote}
                        label="Launch Election"
                        isActive={activeTab === 'launch'}
                        onClick={() => setActiveTab('launch')}
                    />
                    <SidebarItem
                        icon={Users}
                        label="Manage Candidates"
                        isActive={activeTab === 'candidates'}
                        onClick={() => setActiveTab('candidates')}
                    />
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white">
                        {activeTab === 'overview' && "System Overview"}
                        {activeTab === 'launch' && "Create New Election"}
                        {activeTab === 'candidates' && "Add Candidates"}
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-green-400">NODE ONLINE</span>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && <OverviewPanel stats={stats} />}
                    {activeTab === 'launch' && <CreateElectionForm />}
                    {activeTab === 'candidates' && <AddCandidateForm />}
                </AnimatePresence>
            </main>
        </div>
    );
}

// --- SUB-COMPONENT: OVERVIEW PANEL ---
const OverviewPanel = ({ stats }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
        <StatCard label="Registered Voters" value={stats?.totalVoters || 0} icon={Users} color="blue" />
        <StatCard label="Votes Cast" value={stats?.totalVotes || 0} icon={Vote} color="green" />
        <StatCard label="Active Election" value={stats?.activeElection || "None"} icon={Calendar} color="purple" />

        {/* Audit Log Placeholder */}
        <div className="md:col-span-3 bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 mt-4">
            <h3 className="font-bold text-white mb-4">Recent Security Audits</h3>
            <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between text-slate-400 border-b border-slate-700 pb-2">
                    <span>ADMIN_LOGIN</span>
                    <span>10:42 AM</span>
                </div>
                <div className="flex justify-between text-slate-400 border-b border-slate-700 pb-2">
                    <span>SYSTEM_CHECK</span>
                    <span>09:00 AM</span>
                </div>
            </div>
        </div>
    </motion.div>
);

// --- SUB-COMPONENT: CREATE ELECTION FORM ---
const CreateElectionForm = () => {
    const [loading, setLoading] = useState(false);

    // Helper to get current datetime in local format for datetime-local input
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5); // Default to 5 minutes from now
        return now.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        title: '', description: '', constituency: 'Mumbai South', startTime: '', endTime: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // REMOVED: const token = localStorage.getItem('voteGuardToken');

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/create-election`, {
                method: 'POST',

                // NEW: This attaches the cookie automatically
                credentials: 'include',

                headers: {
                    'Content-Type': 'application/json',
                    // REMOVED: 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ Election Created Successfully!");
                // Reset form fields after successful submission using setTimeout to ensure it happens after alert
                setTimeout(() => {
                    setFormData({
                        title: '', description: '', constituency: 'Mumbai South', startTime: '', endTime: ''
                    });
                }, 100);
            } else {
                // Display detailed error message from backend
                const errorMsg = data.message || "Failed to create election";
                const errorDetails = data.details ? `\n\n${data.details}` : '';
                alert(`❌ ${errorMsg}${errorDetails}`);
            }
        } catch (err) { alert("Error connecting to server"); }
        setLoading(false);
    };

    return (
        <motion.form
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="max-w-2xl bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50 space-y-6"
        >
            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Election Title</label>
                    <input
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. 2026 General Election"
                        value={formData.title}
                        required
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Description</label>
                    <textarea
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
                        placeholder="Brief details about the election..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Constituency</label>
                    <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                        value={formData.constituency}
                        onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                    >
                        <option>Mumbai South</option>
                        <option>Bangalore Central</option>
                        <option>Delhi North</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Start Time</label>
                    <input
                        type="datetime-local"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                        value={formData.startTime}
                        min={getMinDateTime()}
                        required
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 mt-1">Must be in the future</p>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-2">End Time</label>
                    <input
                        type="datetime-local"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                        value={formData.endTime}
                        min={formData.startTime || getMinDateTime()}
                        required
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 mt-1">Must be after start time</p>
                </div>
            </div>

            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Launch Election</>}
            </button>
        </motion.form>
    );
};

// --- SUB-COMPONENT: ADD CANDIDATE FORM ---
const AddCandidateForm = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        electionId: '', name: '', party: '', symbol: '🌳', age: '', education: '', experience: '', keyPoints: ''
    });

    // Fetch available elections for dropdown
    useEffect(() => {
        const fetchElections = async () => {
            // REMOVED: const token = localStorage.getItem('voteGuardToken');

            const res = await fetch(`${API_BASE_URL}/api/admin/elections`, {
                // NEW: Automatically attach the admin cookie
                credentials: 'include'
                // REMOVED: headers: { 'Authorization': ... }
            });
            if (res.ok) {
                const allElections = await res.json();
                // Show UPCOMING and LIVE elections (exclude only ENDED elections)
                const activeElections = allElections.filter(election =>
                    election.status === 'LIVE' || election.status === 'UPCOMING'
                );
                setElections(activeElections);
            }
        };
        fetchElections();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // REMOVED: const token = localStorage.getItem('voteGuardToken');

        // Convert keyPoints string to array
        const payload = {
            ...formData,
            keyPoints: formData.keyPoints.split(',').map(item => item.trim())
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/add-candidate`, {
                method: 'POST',

                // NEW: Automatically attach the admin cookie
                credentials: 'include',

                headers: {
                    'Content-Type': 'application/json',
                    // REMOVED: 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ Candidate Added Successfully!");
                // Reset form fields after successful submission using setTimeout to ensure it happens after alert
                setTimeout(() => {
                    setFormData({
                        electionId: '', name: '', party: '', symbol: '🌳', age: '', education: '', experience: '', keyPoints: ''
                    });
                }, 100);
            } else {
                const errorMsg = data.message || "Failed to add candidate";
                const errorDetails = data.error ? `\n\nError: ${data.error}` : '';
                alert(`❌ ${errorMsg}${errorDetails}`);
            }
        } catch (err) {
            console.error('Add candidate error:', err);
            alert("❌ Error connecting to server");
        }
        setLoading(false);
    };
    return (
        <motion.form
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="max-w-2xl bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50 space-y-6"
        >
            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Select Election</label>
                    <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                        value={formData.electionId}
                        required
                        onChange={(e) => setFormData({ ...formData, electionId: e.target.value })}
                    >
                        <option value="">-- Choose Election --</option>
                        {elections.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.title} ({e.status}) - {e.constituency}
                            </option>
                        ))}
                    </select>
                    {elections.length === 0 && (
                        <p className="text-xs text-amber-400 mt-1">
                            ⚠️ No active elections found. Create an election first.
                        </p>
                    )}
                </div>
                <div className="col-span-1">
                    <label className="block text-sm text-slate-400 mb-2">Candidate Name</label>
                    <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                        value={formData.name}
                        required
                        placeholder="Full name"
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm text-slate-400 mb-2">Party Name</label>
                    <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                        value={formData.party}
                        required
                        placeholder="Political party"
                        onChange={(e) => setFormData({ ...formData, party: e.target.value })} />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm text-slate-400 mb-2">Age</label>
                    <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                        value={formData.age}
                        required
                        min="25"
                        placeholder="Minimum 25"
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm text-slate-400 mb-2">Symbol (Emoji)</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    >
                        <option>🌳</option><option>🌅</option><option>⭐</option><option>🦅</option><option>🚜</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Manifesto Points (Comma separated)</label>
                    <textarea
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none h-20"
                        placeholder="e.g. Free Education, Better Roads, Green Energy"
                        value={formData.keyPoints}
                        onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
                    />
                </div>
            </div>

            <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <><PlusCircle size={20} /> Add Candidate</>}
            </button>
        </motion.form>
    );
};

// --- HELPER UI ---
const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
    >
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const StatCard = ({ label, value, icon: Icon, color }) => {
    const colors = {
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        green: "bg-green-500/10 text-green-500 border-green-500/20",
        purple: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]} backdrop-blur-sm`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-slate-900/50`}>
                    <Icon size={24} />
                </div>
                <span className="text-xs font-bold bg-slate-900/50 px-2 py-1 rounded text-slate-400">+2.4%</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">{label}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
    );
};