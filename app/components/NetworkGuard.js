'use client'

/**
 * ============================================================
 * NETWORK GUARD COMPONENT - SEPOLIA ONLY
 * ============================================================
 * 
 * This component ensures users are ALWAYS on Sepolia network
 * Shows a beautiful overlay if they're on the wrong network
 * 
 * USAGE:
 * Wrap any page that needs blockchain access:
 * 
 * import NetworkGuard from './components/NetworkGuard';
 * 
 * export default function VotePage() {
 *   return (
 *     <NetworkGuard>
 *       <YourVotingComponent />
 *     </NetworkGuard>
 *   );
 * }
 * 
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { checkNetwork, switchToSepolia, isMetaMaskInstalled } from '../utils/blockchain';

export default function NetworkGuard({ children }) {
    const [networkStatus, setNetworkStatus] = useState({
        checking: true,
        correct: false,
        currentChainId: null,
        message: ''
    });
    const [switching, setSwitching] = useState(false);

    // Check network on mount and when network changes
    useEffect(() => {
        checkCurrentNetwork();

        // Listen for network changes
        if (isMetaMaskInstalled()) {
            window.ethereum.on('chainChanged', () => {
                checkCurrentNetwork();
            });
        }

        return () => {
            if (isMetaMaskInstalled()) {
                window.ethereum.removeListener('chainChanged', checkCurrentNetwork);
            }
        };
    }, []);

    const checkCurrentNetwork = async () => {
        setNetworkStatus(prev => ({ ...prev, checking: true }));
        const status = await checkNetwork();
        setNetworkStatus({
            checking: false,
            correct: status.correct,
            currentChainId: status.currentChainId,
            message: status.message
        });
    };

    const handleSwitchNetwork = async () => {
        setSwitching(true);
        try {
            await switchToSepolia();
            await checkCurrentNetwork();
        } catch (error) {
            console.error('Failed to switch network:', error);
        } finally {
            setSwitching(false);
        }
    };

    // Still checking
    if (networkStatus.checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Checking network...</p>
                </div>
            </div>
        );
    }

    // Wrong network - show overlay
    if (!networkStatus.correct) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-500">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Wrong Network Detected
                        </h1>

                        <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                            <p className="text-red-800 font-medium mb-2">
                                🚫 You're on the wrong blockchain network
                            </p>
                            <p className="text-gray-600 text-sm">
                                VoteGuard requires <span className="font-bold text-red-600">Sepolia Testnet</span> for all operations.
                            </p>
                        </div>

                        {isMetaMaskInstalled() ? (
                            <>
                                <button
                                    onClick={handleSwitchNetwork}
                                    disabled={switching}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                                >
                                    {switching ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Switching Network...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-5 h-5" />
                                            Switch to Sepolia Network
                                        </>
                                    )}
                                </button>

                                <div className="bg-gray-50 rounded-lg p-4 text-left">
                                    <p className="text-xs text-gray-500 mb-2 font-semibold">Network Details:</p>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Required:</span>
                                            <span className="font-mono text-green-600">Sepolia (11155111)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Current:</span>
                                            <span className="font-mono text-red-600">
                                                {networkStatus.currentChainId || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href="https://chainlist.org/chain/11155111"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Need help adding Sepolia?
                                </a>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <p className="text-yellow-800 text-sm">
                                        ⚠️ MetaMask not detected
                                    </p>
                                </div>

                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Install MetaMask
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Correct network - render children
    return <>{children}</>;
}
