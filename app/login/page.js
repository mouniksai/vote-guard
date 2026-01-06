'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Lock, User, CheckCircle2, CheckCircle, Eye, EyeOff,
    Fingerprint, Loader2, AlertCircle, ArrowRight, Server, Database,
    Smartphone, Mail, Shield
} from 'lucide-react';

const API_BASE_URL = "http://localhost:5000/api";

export default function VoteGuardAuth() {
    const [activeTab, setActiveTab] = useState('signin');
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans">
            {/* Background Gradient Mesh */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
            </div>

            {/* Main Card Container */}
            <div className="relative z-10 w-full max-w-[1100px] h-[700px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-row">

                {/* --- LEFT PANEL: BRANDING & FEATURES --- */}
                <div className="hidden lg:flex w-[45%] bg-blue-600 relative flex-col justify-between p-12 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                <ShieldCheck size={32} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">VoteGuard</h1>
                                <p className="text-blue-100 text-sm opacity-90">Secure Voting Portal</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <FeatureItem icon={CheckCircle2} title="Blockchain Security" desc="Your vote is encrypted and stored immutably on the Ethereum ledger." />
                        <FeatureItem icon={Fingerprint} title="Biometric Verification" desc="Multi-factor authentication ensures your identity cannot be forged." />
                        <FeatureItem icon={Eye} title="Complete Transparency" desc="Verify your vote independently using your unique transaction ID." />
                    </div>

                    <div className="relative z-10 pt-8 border-t border-white/20">
                        <p className="text-xs text-blue-100 leading-relaxed opacity-80">
                            Powered by advanced cryptography and distributed ledger technology.
                        </p>
                    </div>
                </div>

                {/* --- RIGHT PANEL: INTERACTIVE FORMS --- */}
                <div className="w-full lg:w-[55%] bg-white p-8 md:p-12 lg:p-16 flex flex-col relative">

                    {/* Tab Switcher */}
                    <div className="flex w-fit top-8 mx-auto md:top-12 md:right-12 flex items-center bg-slate-100 px-2 py-1.5 rounded-xl">
                        <button onClick={() => setActiveTab('signin')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'signin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Sign In</button>
                        <button onClick={() => setActiveTab('register')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Register</button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center mt-10 lg:mt-0">
                        <AnimatePresence mode="wait">
                            {activeTab === 'signin' ? (
                                <SignInFlow key="signin" router={router} />
                            ) : (
                                <RegisterWizard key="register" />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-xs">© 2025 VoteGuard. Secure, Transparent, Democratic.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

const FeatureItem = ({ icon: Icon, title, desc }) => (
    <div className="flex gap-4 items-start">
        <div className="mt-1 p-1 bg-blue-500 rounded-full shadow-lg shadow-blue-900/20">
            <CheckCircle size={16} className="text-white" strokeWidth={3} />
        </div>
        <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-blue-100 text-sm leading-relaxed opacity-80">{desc}</p>
        </div>
    </div>
);

// --- 1. SIGN IN FLOW (Backend Integrated) ---
const SignInFlow = ({ router }) => {
    const [step, setStep] = useState('credentials');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // Success: Store user and move to 2FA
                setCurrentUser(data.user);
                setStep('2fa');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'credentials') {
        return (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                    <p className="text-slate-500">Sign in to access your secure voting portal</p>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                    <InputField 
                        label="Username" 
                        icon={User} 
                        placeholder="Enter your username" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                    <InputField 
                        label="Password" 
                        icon={Lock} 
                        type="password" 
                        placeholder="Enter your password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        error={error}
                    />

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-slate-500">Remember me</span>
                        </label>
                        <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
                    </div>

                    <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
                    </button>
                </form>
            </motion.div>
        );
    }

    return <TwoFactorAuth user={currentUser} onBack={() => setStep('credentials')} router={router} />;
};

// --- 2. REGISTER WIZARD (Backend Integrated) ---
const RegisterWizard = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [citizenId, setCitizenId] = useState('');
    const [regData, setRegData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [govtData, setGovtData] = useState(null);

    // Step 1: Verify ID with PostgreSQL
    const handleVerify = async () => {
        if (!citizenId) { setError("Please enter a valid ID"); return; }
        setLoading(true); setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/verify-citizen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ citizenId })
            });

            const data = await res.json();

            if (res.ok) {
                setGovtData(data.data); // Data coming from Postgres table
                setStep(2);
            } else {
                setError(data.message || "Verification failed");
            }
        } catch (err) {
            setError("Server connection error");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Register User in MongoDB
    const handleRegister = async () => {
        if(!regData.username || !regData.password) { setError("All fields are required"); return; }
        setLoading(true); setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: regData.username,
                    password: regData.password,
                    citizenId: citizenId
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert("Registration Successful! Please Sign In.");
                window.location.reload(); 
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError("Server error during registration");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            </div>

            {step === 1 ? (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Identity</h2>
                        <p className="text-slate-500">Enter your National Citizen ID to check eligibility.</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                        <AlertCircle className="text-blue-600 shrink-0" size={20} />
                        <p className="text-xs text-blue-800 leading-relaxed">
                            We will fetch your details from the secure Government Node. This action is logged.
                        </p>
                    </div>
                    <InputField label="Citizen ID" icon={Fingerprint} placeholder="12-digit Unique ID" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} error={error} />
                    <button onClick={handleVerify} disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
                        <p className="text-slate-500">Identity verified. Set up your access credentials.</p>
                    </div>
                    {/* Display Fetched Data */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1"><CheckCircle2 size={12} /> VERIFIED</div>
                        <div className="flex gap-4 items-center">
                            {/* Note: Postgres keys are usually snake_case */}
                            <img src={govtData?.photo_url || "https://via.placeholder.com/150"} alt="User" className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover" />
                            <div>
                                <h3 className="text-slate-900 font-bold">{govtData?.full_name}</h3>
                                <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                                    <span>{govtData?.dob}</span> • <span>{govtData?.state}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <InputField label="Choose Username" icon={User} placeholder="e.g. voterguy123" value={regData.username} onChange={(e) => setRegData({...regData, username: e.target.value})} />
                        <InputField label="Set Password" icon={Lock} type="password" placeholder="Min. 8 characters" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} error={error} />
                    </div>
                    <button onClick={handleRegister} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
                         {loading ? <Loader2 className="animate-spin mx-auto" /> : "Complete Registration"}
                    </button>
                </div>
            )}
        </motion.div>
    );
};

// --- 3. 2FA COMPONENT ---
const TwoFactorAuth = ({ user, onBack, router }) => {
    const [step, setStep] = useState("mobile");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer === 0) return;
        const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    const maskMobile = (m) => m ? m.replace(/\d(?=\d{4})/g, "•") : "• • • • •";
    const maskEmail = (e) => e ? e.replace(/(.{2})(.*)(?=@)/, (g1, g2, g3) => g2 + "*".repeat(g3.length)) : "***@***.com";

    const handleSendOtp = () => {
        setLoading(true);
        // SIMULATION: In real app, call API here
        setTimeout(() => {
            setLoading(false);
            setSent(true);
            setResendTimer(30);
        }, 1500);
    };

    const handleVerify = () => {
        setLoading(true);
        // SIMULATION: Verify OTP
        setTimeout(() => {
            setLoading(false);
            setOtp("");
            setSent(false);
            if (step === "mobile") {
                setStep("email");
            } else {
                router.push('/dashboard');
            }
        }, 1500);
    };

    return (
        <motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div>
                <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">← Back to Login</button>
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2"><Shield className="text-blue-600" /> Security Verification</h2>
                <p className="text-slate-500">{step === "mobile" ? "Verify your mobile number first." : "Verify your email address to continue."}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <div className={`p-4 rounded-xl border-2 flex items-center gap-4 ${step === "mobile" ? "border-blue-600 bg-blue-50/50" : "border-green-600 bg-green-50/50"}`}>
                    <div className={`p-3 rounded-full ${step === "mobile" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}><Smartphone size={20} /></div>
                    <div><p className="font-bold">Mobile Verification</p><p className="text-xs text-slate-500">{maskMobile(user?.mobile)}</p></div>
                    {step !== "mobile" && <CheckCircle2 className="text-green-600 ml-auto" />}
                </div>
                <div className={`p-4 rounded-xl border-2 flex items-center gap-4 ${step === "email" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-slate-50"}`}>
                    <div className={`p-3 rounded-full ${step === "email" ? "bg-blue-600 text-white" : "bg-slate-300 text-white"}`}><Mail size={20} /></div>
                    <div><p className="font-bold">Email Verification</p><p className="text-xs text-slate-500">{maskEmail(user?.email)}</p></div>
                </div>
            </div>
            <AnimatePresence>
                {sent ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                        <InputField label={`Enter OTP sent to your ${step === "mobile" ? "mobile" : "email"}`} icon={Lock} placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        <button onClick={handleVerify} disabled={loading || otp.length < 6} className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
                        </button>
                        <p className="text-xs text-center text-slate-400">Didn't receive code? <span onClick={() => resendTimer === 0 && handleSendOtp()} className={`font-semibold cursor-pointer ${resendTimer > 0 ? "text-slate-400 cursor-not-allowed" : "text-blue-600"}`}>{resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}</span></p>
                    </motion.div>
                ) : (
                    <button onClick={handleSendOtp} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : `Send ${step === 'mobile' ? 'Mobile' : 'Email'} OTP`}
                    </button>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const InputField = ({ label, icon: Icon, type = "text", placeholder, value, onChange, error }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
            <div className={`relative flex items-center bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all overflow-hidden`}>
                <div className="pl-4 text-slate-400">
                    <Icon size={20} />
                </div>
                <input
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    className="w-full bg-transparent px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none font-medium"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
                {isPassword && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-4 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <p className="text-red-500 text-xs flex items-center gap-1 ml-1"><AlertCircle size={12} /> {error}</p>}
        </div>
    );
};