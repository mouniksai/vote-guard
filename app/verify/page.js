'use client'

import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam'; // NEW IMPORT
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ShieldCheck,
    ScanFace,
    Fingerprint,
    KeyRound,
    CheckCircle2,
    Loader2,
    Lock,
    ArrowRight
} from 'lucide-react';

export default function VerificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const webcamRef = useRef(null);
    const [stepsCompleted, setStepsCompleted] = useState(0);
    const [loadingStep, setLoadingStep] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);

    // Get election ID from query params
    const electionId = searchParams.get('electionId');

    // API Base URL from environment variable
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    // Debug logging
    useEffect(() => {
        console.log('VerificationPage state:', {
            stepsCompleted,
            loadingStep,
            cameraActive
        });
    }, [stepsCompleted, loadingStep, cameraActive]);

    // --- STEP 1: FACE VERIFICATION ---
    const handleFaceVerify = async () => {
        setLoadingStep(1);

        try {
            // 1. Capture Image
            const imageSrc = webcamRef.current?.getScreenshot();
            if (!imageSrc) {
                alert("Camera error - please try again");
                setLoadingStep(null);
                return;
            }

            // 2. Send to Backend
            const res = await fetch(`${API_BASE_URL}/api/verification/face`, {
                method: 'POST',

                // NEW: Send the Secure Cookie automatically
                credentials: 'include',

                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    liveImageBase64: imageSrc
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status} error` }));
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            if (data && data.success) {
                setStepsCompleted(1); // Pass Step 1
                setCameraActive(false); // Turn off camera
            } else {
                alert(data?.message || "Verification Failed. Try again.");
            }

        } catch (err) {
            console.error('Face verification error:', err);
            alert("Server Error - Please try again");
        } finally {
            setLoadingStep(null);
        }
    };

    // --- STEP 2: FINGERPRINT (SKIPPED/MOCKED) ---
    const handleFingerprint = () => {
        setLoadingStep(2);
        setTimeout(() => {
            setStepsCompleted(2);
            setLoadingStep(null);
        }, 1500);
    };

    // Generic handler for verification steps
    const handleVerify = (stepNumber) => {
        console.log('handleVerify called with step:', stepNumber);

        if (stepNumber === 1) {
            console.log('Starting step 1 - activating camera');
            setCameraActive(true);
        } else if (stepNumber === 2) {
            console.log('Starting step 2 - fingerprint verification');
            handleFingerprint();
        } else if (stepNumber === 3) {
            console.log('Starting step 3 - token validation');
            handleTokenVerify();
        }
    };

    // --- STEP 3: TOKEN VALIDATION ---
    // --- STEP 3: TOKEN VALIDATION ---
    const handleTokenVerify = async () => {
        setLoadingStep(3);

        try {
            // We use credentials: 'include' so the browser sends the cookie automatically
            const res = await fetch(`${API_BASE_URL}/api/verification/token`, {
                method: 'POST',
                credentials: 'include', // <--- IMPORTANT: Sends the HTTP-Only Cookie
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status} error` }));
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            if (data && data.success) {
                setStepsCompleted(3); // Success!
            } else {
                alert(data?.message || "Token Validation Failed. Please Login Again.");
            }

        } catch (e) {
            console.error("Token Error", e);
            alert("Server Connection Error - Please try again");
        } finally {
            setLoadingStep(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1121] font-sans text-slate-200 selection:bg-blue-500 selection:text-white pb-12">

            {/* --- Ambient Background (Same as Dashboard) --- */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
            </div>

            {/* --- TOP NAVIGATION (Simplified for consistency) --- */}
            <nav className="sticky top-0 z-50 bg-[#0B1121]/80 backdrop-blur-xl border-b border-slate-800/60">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">VoteGuard</span>
                    </div>
                    <div className="text-sm font-mono text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Session ID: <span className="text-blue-400">#8X92-VOTE</span>
                    </div>
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 py-16">

                {/* Header Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">Identity Gatekeeper</h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">Complete the multi-factor security checks below to unlock your encrypted ballot.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Lines (Desktop only) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-800/50 -z-10 transform -translate-y-1/2"></div>

                    {/* Step 1: Face Verification */}
                    <VerificationCard
                        stepNumber={1}
                        title="Face Recognition"
                        description="Position your face in the camera frame for biometric verification."
                        icon={<ScanFace size={32} />}
                        isActive={true}
                        isCompleted={stepsCompleted >= 1}
                        isLoading={loadingStep === 1}
                        onVerify={() => handleVerify(1)}
                    >
                        <div className="w-full h-48 bg-slate-950/50 rounded-xl mb-6 flex items-center justify-center relative border border-slate-800 overflow-hidden group">
                            {cameraActive && stepsCompleted < 1 ? (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onUserMediaError={(error) => {
                                            console.error('Camera error:', error);
                                            alert('Camera access denied. Please allow camera access and try again.');
                                            setCameraActive(false);
                                        }}
                                    />
                                    <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/50 rounded-xl"></div>
                                </>
                            ) : (
                                // Show Placeholder or Captured State
                                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-600">
                                    <div className="text-center">
                                        <ScanFace size={48} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            {stepsCompleted >= 1 ? "Face Verified ✓" : "Click Start to begin"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Button to actually Snap & Verify when Camera is Active */}
                            {cameraActive && stepsCompleted < 1 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleFaceVerify();
                                    }}
                                    disabled={loadingStep === 1}
                                    className="absolute bottom-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg z-20 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loadingStep === 1 ? (
                                        <>
                                            <Loader2 size={16} className="inline animate-spin mr-2" />
                                            Scanning...
                                        </>
                                    ) : (
                                        "Capture & Verify"
                                    )}
                                </button>
                            )}
                        </div>
                    </VerificationCard>

                    {/* Step 2: Biometric Scan */}
                    <VerificationCard
                        stepNumber={2}
                        title="Biometric Scan"
                        description="Place registered finger on the hardware sensor."
                        icon={<Fingerprint size={32} />}
                        isActive={stepsCompleted >= 1}
                        isCompleted={stepsCompleted >= 2}
                        isLoading={loadingStep === 2}
                        onVerify={() => handleVerify(2)}
                    >
                        <div className="mb-8 mt-6 flex justify-center">
                            <Fingerprint className={`text-6xl transition-colors duration-500 ${loadingStep === 2 ? 'text-blue-400 animate-pulse' : 'text-slate-700'}`} />
                        </div>
                    </VerificationCard>

                    {/* Step 3: Token Validation */}
                    <VerificationCard
                        stepNumber={3}
                        title="Token Validation"
                        description="Verifying blockchain eligibility credentials."
                        icon={<KeyRound size={32} />}

                        // Only active if Step 2 (Fingerprint/Mock) is done
                        isActive={stepsCompleted >= 2}
                        isCompleted={stepsCompleted >= 3}
                        isLoading={loadingStep === 3}

                        // Use the generic handler
                        onVerify={() => handleVerify(3)}
                    >
                        <div className="w-full bg-slate-950/50 rounded-xl p-4 mb-6 border border-slate-800/60 font-mono text-xs text-slate-500">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${stepsCompleted >= 3 ? 'bg-emerald-500' : loadingStep === 3 ? 'bg-blue-500 animate-ping' : 'bg-slate-600'}`}></div>
                                Status: {stepsCompleted >= 3 ? 'Verified' : loadingStep === 3 ? 'Validating...' : 'Waiting'}
                            </div>
                            <p className="opacity-50 truncate">Hash: {stepsCompleted >= 3 ? '0x8f2a...Verified' : 'Pending...'}</p>
                        </div>
                    </VerificationCard>

                </div>

                {/* Final Action Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 text-center"
                >
                    <button
                        disabled={stepsCompleted < 3}
                        onClick={() => stepsCompleted >= 3 && router.push('/vote')}
                        className={`
                            relative group overflow-hidden px-12 py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center mx-auto gap-3 transition-all duration-300
                            ${stepsCompleted < 3
                                ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:scale-105 hover:shadow-blue-900/50 border border-blue-500/50'}
                        `}
                    >
                        {stepsCompleted < 3 ? (
                            <>
                                <Lock size={20} /> Ballot Locked
                            </>
                        ) : (
                            <>
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
                                Enter Voting Booth <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                    {stepsCompleted < 3 && (
                        <p className="mt-4 text-sm text-slate-500 animate-pulse">Complete all 3 steps above to proceed.</p>
                    )}
                </motion.div>

            </main>
        </div>
    );
}

// --- Reusable Verification Card Component ---
function VerificationCard({ stepNumber, title, description, icon, isActive, isCompleted, isLoading, onVerify, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stepNumber * 0.1 }}
            className={`
                relative bg-slate-800/40 backdrop-blur-md rounded-[2rem] p-8 border transition-all duration-300 z-10 flex flex-col
                ${isCompleted ? 'border-emerald-500/50 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]' : isActive ? 'border-blue-500/50 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]' : 'border-slate-700/60 opacity-50 grayscale'}
            `}
        >
            {/* Success Checkmark */}
            {isCompleted && (
                <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/10 rounded-full p-1 animate-in zoom-in">
                    <CheckCircle2 size={24} />
                </div>
            )}

            {/* Step Indicator & Icon */}
            <div className="flex flex-col items-center text-center flex-grow">
                <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border relative
                    ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : isActive ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-slate-700/30 border-slate-700 text-slate-500'}
                `}>
                    {icon}
                    <span className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center font-bold text-sm text-slate-300 shadow-sm">
                        {stepNumber}
                    </span>
                </div>
                <h3 className="font-bold text-xl text-white mb-3">{title}</h3>
                <p className="text-sm text-slate-400 mb-8 leading-relaxed">{description}</p>

                {/* Custom Content (Camera, etc.) */}
                <div className="w-full">
                    {children}
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked for step:', stepNumber, 'isActive:', isActive, 'isCompleted:', isCompleted, 'isLoading:', isLoading);
                    if (onVerify && isActive && !isCompleted && !isLoading) {
                        onVerify();
                    }
                }}
                disabled={!isActive || isCompleted || isLoading}
                className={`
                    w-full py-4 rounded-xl font-bold text-sm transition-all mt-auto flex items-center justify-center gap-2 cursor-pointer
                    ${isCompleted
                        ? 'bg-emerald-600/20 text-emerald-400 cursor-default border border-emerald-500/20'
                        : isActive && !isLoading
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/30 border border-blue-500/50 hover:cursor-pointer'
                            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed opacity-50'}
                `}
            >
                {isLoading ? (
                    <><Loader2 className="animate-spin" size={18} /> Verifying...</>
                ) : isCompleted ? (
                    'Verified Successfully'
                ) : (
                    `Start ${title}`
                )}
            </button>
        </motion.div>
    );
}