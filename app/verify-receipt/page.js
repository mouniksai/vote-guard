'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Scan,
    FileText,
    Hash,
    Calendar,
    MapPin,
    XCircle,
    Loader2,
    ArrowLeft
} from 'lucide-react';

// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function VerifyReceiptPage() {
    const router = useRouter();
    const [inputType, setInputType] = useState('base64'); // 'base64' or 'barcode'
    const [encodedReceipt, setEncodedReceipt] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (!encodedReceipt.trim()) {
            setError(inputType === 'barcode' ? 'Please enter a 13-digit barcode' : 'Please enter an encoded receipt');
            return;
        }

        // Validate barcode format if barcode type selected
        if (inputType === 'barcode') {
            if (!/^\d{13}$/.test(encodedReceipt.trim())) {
                setError('Barcode must be exactly 13 digits');
                return;
            }
        }

        setIsVerifying(true);
        setError('');
        setVerificationResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/vote/verify-receipt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    encodedReceipt: encodedReceipt.trim(),
                    format: inputType === 'barcode' ? 'barcode' : 'base64'
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setVerificationResult(result);
                setError('');
            } else {
                setError(result.message || 'Receipt verification failed');
                setVerificationResult(null);
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('Server connection error. Please try again.');
            setVerificationResult(null);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleClear = () => {
        setEncodedReceipt('');
        setVerificationResult(null);
        setError('');
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
                            <span className="hidden sm:inline text-xs text-slate-400 ml-2">Receipt Verification</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 mx-auto mb-6 bg-purple-600/20 rounded-full flex items-center justify-center border-4 border-purple-500">
                        <Scan size={36} className="text-purple-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Verify Vote Receipt</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Enter your encoded vote receipt to verify it against the blockchain records.
                        This confirms your vote was recorded correctly.
                    </p>
                </motion.div>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-2xl p-8 mb-6"
                >
                    {/* Input Type Selector */}
                    <div className="mb-6">
                        <span className="text-sm font-bold text-white mb-3 block">Verification Method</span>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setInputType('base64');
                                    setEncodedReceipt('');
                                    setError('');
                                    setVerificationResult(null);
                                }}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${inputType === 'base64'
                                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                                    : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600 hover:bg-slate-700'
                                    }`}
                            >
                                <FileText size={18} />
                                Base64 Code
                            </button>
                            <button
                                onClick={() => {
                                    setInputType('barcode');
                                    setEncodedReceipt('');
                                    setError('');
                                    setVerificationResult(null);
                                }}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${inputType === 'barcode'
                                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                                    : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600 hover:bg-slate-700'
                                    }`}
                            >
                                <Hash size={18} />
                                13-Digit Barcode
                            </button>
                        </div>
                    </div>

                    {/* Input Field - Changes based on type */}
                    <label className="block mb-3">
                        <span className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            {inputType === 'base64' ? (
                                <>
                                    <FileText size={16} className="text-blue-400" />
                                    Encoded Receipt (Base64)
                                </>
                            ) : (
                                <>
                                    <Hash size={16} className="text-blue-400" />
                                    13-Digit Barcode Number
                                </>
                            )}
                        </span>
                        {inputType === 'base64' ? (
                            <textarea
                                value={encodedReceipt}
                                onChange={(e) => setEncodedReceipt(e.target.value)}
                                placeholder="Paste your encoded receipt here..."
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-sm transition-all"
                            />
                        ) : (
                            <input
                                type="text"
                                value={encodedReceipt}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                    if (value.length <= 13) {
                                        setEncodedReceipt(value);
                                    }
                                }}
                                placeholder="Enter 13-digit barcode (e.g., 1234567890123)"
                                maxLength="13"
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono text-2xl tracking-widest transition-all text-center"
                            />
                        )}
                        {inputType === 'barcode' && encodedReceipt && (
                            <p className="text-xs text-slate-400 mt-2 text-center">
                                {encodedReceipt.length}/13 digits
                            </p>
                        )}
                    </label>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleVerify}
                            disabled={isVerifying || !encodedReceipt.trim()}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    Verify Receipt
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleClear}
                            disabled={isVerifying}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
                        >
                            Clear
                        </button>
                    </div>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 mb-6 flex items-start gap-3"
                        >
                            <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-red-400 mb-1">Verification Failed</p>
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Verification Result */}
                <AnimatePresence>
                    {verificationResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-800/40 backdrop-blur-md border border-green-700/60 rounded-2xl overflow-hidden"
                        >
                            {/* Success Header */}
                            <div className="bg-green-900/20 border-b border-green-700/40 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
                                        <CheckCircle2 size={32} className="text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Receipt Verified!</h2>
                                        <p className="text-sm text-green-300">Your vote was successfully recorded</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decoded Data */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Hash size={20} className="text-blue-400" />
                                    Receipt Details
                                </h3>

                                <div className="space-y-4">
                                    {/* Receipt Hash */}
                                    {verificationResult.decodedData?.receiptHash && (
                                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                                            <p className="text-xs text-slate-500 mb-2">Receipt Hash</p>
                                            <p className="font-mono text-sm text-blue-400 break-all">
                                                {verificationResult.decodedData.receiptHash}
                                            </p>
                                        </div>
                                    )}

                                    {/* Election Info */}
                                    {verificationResult.verification && (
                                        <>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                                                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                                        <FileText size={14} />
                                                        Election
                                                    </p>
                                                    <p className="text-white font-medium">
                                                        {verificationResult.verification.electionTitle}
                                                    </p>
                                                </div>

                                                {verificationResult.verification.constituency && (
                                                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                                                        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                                            <MapPin size={14} />
                                                            Constituency
                                                        </p>
                                                        <p className="text-white font-medium">
                                                            {verificationResult.verification.constituency}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Timestamp */}
                                            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                                                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    Vote Timestamp
                                                </p>
                                                <p className="text-white font-medium">
                                                    {new Date(verificationResult.verification.votedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {/* Verification Status */}
                                    <div className="p-4 bg-green-900/20 rounded-xl border border-green-700/40">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={20} className="text-green-400" />
                                            <div>
                                                <p className="text-sm font-bold text-green-400">Verified</p>
                                                <p className="text-xs text-green-300">
                                                    This receipt matches our blockchain records
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 bg-blue-900/20 border border-blue-700/40 rounded-xl p-6"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-slate-300">
                            <p className="font-bold text-white mb-2">How to Get Your Receipt</p>
                            <ul className="space-y-1 text-slate-400">
                                <li>• After voting, you received an encoded receipt (Base64 format)</li>
                                <li>• You can also scan the QR code provided with your vote confirmation</li>
                                <li>• The receipt contains cryptographic proof of your vote submission</li>
                                <li>• Your vote remains anonymous - only submission is verified, not your choice</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
