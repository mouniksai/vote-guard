'use client';

import { useState } from 'react';
import { Shield, CheckCircle, XCircle, Hash, Lock } from 'lucide-react';

export default function VerifySignaturePage() {
  const [formData, setFormData] = useState({
    receiptHash: '',
    userId: '',
    electionId: '',
    candidateId: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('http://localhost:5001/api/vote/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        verified: false,
        message: '❌ Verification failed - Could not connect to server',
        details: { error: error.message }
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Digital Signature Verification</h1>
          </div>
          <p className="text-gray-600">
            Verify the integrity and authenticity of your vote receipt using the cryptographic hash stored in the database
          </p>
          <div className="mt-3 flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>How it works:</strong> Enter your receipt hash to look it up in the database.
              Optionally provide vote details (userId, electionId, candidateId) to verify data integrity.
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Enter Receipt Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Hash *
              </label>
              <input
                type="text"
                placeholder="Enter your vote receipt hash"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.receiptHash}
                onChange={(e) => setFormData({ ...formData, receiptHash: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., user123"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to skip data validation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., election123"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.electionId}
                  onChange={(e) => setFormData({ ...formData, electionId: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to skip data validation</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Candidate ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., candidate123"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.candidateId}
                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to skip data validation</p>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || !formData.receiptHash}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? 'Verifying...' : '🔐 Verify Receipt'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Optional: Provide vote details to validate data integrity
            </p>
          </div>
        </div>

        {/* Verification Result */}
        {result && (
          <div className={`rounded-lg shadow-lg p-6 ${result.verified
              ? 'bg-green-50 border-2 border-green-500'
              : 'bg-red-50 border-2 border-red-500'
            }`}>
            <div className="flex items-center gap-3 mb-4">
              {result.verified ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
              <h2 className={`text-2xl font-bold ${result.verified ? 'text-green-800' : 'text-red-800'
                }`}>
                {result.message}
              </h2>
            </div>

            {/* Verification Details */}
            {result.details && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Verification Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Receipt Hash:</span>
                    <code className="block bg-gray-100 p-2 rounded mt-1 break-all font-mono text-xs">
                      {result.details.providedHash}
                    </code>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Exists in Database:</span>
                      <span className={`font-bold ${result.details.existsInDatabase ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {result.details.existsInDatabase ? '✅ YES - Authentic Vote' : '❌ NO - Not Found'}
                      </span>
                    </div>

                    {result.details.storedData && (
                      <div className="bg-blue-50 p-3 rounded mt-2">
                        <p className="font-semibold text-blue-800 mb-2">Stored Vote Data:</p>
                        <div className="text-xs space-y-1 text-blue-900">
                          <p><strong>User ID:</strong> {result.details.storedData.userId}</p>
                          <p><strong>Election ID:</strong> {result.details.storedData.electionId}</p>
                          <p><strong>Candidate ID:</strong> {result.details.storedData.candidateId}</p>
                        </div>
                      </div>
                    )}

                    {result.details.mismatchDetails && result.details.mismatchDetails.length > 0 && (
                      <div className="bg-red-50 p-3 rounded mt-2">
                        <p className="font-semibold text-red-800 mb-2">❌ Data Mismatches Detected:</p>
                        <ul className="text-xs space-y-1 text-red-900 list-disc list-inside">
                          {result.details.mismatchDetails.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.details.dataMatch && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold">Data Integrity:</span>
                        <span className="font-bold text-green-600">
                          ✅ All provided data matches stored vote
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vote Information */}
            {result.details?.voteInfo && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-green-800">✅ Verified Vote Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Election:</span>
                    <p className="text-gray-800">{result.details.voteInfo.election}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Constituency:</span>
                    <p className="text-gray-800">{result.details.voteInfo.constituency}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Candidate:</span>
                    <p className="text-gray-800">{result.details.voteInfo.candidate}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Party:</span>
                    <p className="text-gray-800">{result.details.voteInfo.party}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Voted At:</span>
                    <p className="text-gray-800">{new Date(result.details.voteInfo.votedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">🔬 What This Proves:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                {result.verified ? (
                  <>
                    <li><strong>Authenticity:</strong> Receipt hash found in database - this is a legitimate vote</li>
                    <li><strong>Data Integrity:</strong> Provided details match the stored vote data</li>
                    <li><strong>Non-Repudiation:</strong> Cryptographic proof that this vote was cast and recorded</li>
                  </>
                ) : result.details?.existsInDatabase ? (
                  <>
                    <li><strong>Receipt Found:</strong> Vote exists in database but provided details don't match</li>
                    <li><strong>Data Mismatch:</strong> The userId, electionId, or candidateId you entered is incorrect</li>
                    <li><strong>Check Input:</strong> Verify you're using the correct IDs from your vote receipt</li>
                  </>
                ) : (
                  <>
                    <li><strong>Receipt Not Found:</strong> This hash does not exist in the database</li>
                    <li><strong>Invalid Receipt:</strong> Either the hash is incorrect or the vote was never recorded</li>
                    <li><strong>Security:</strong> The system prevents verification of non-existent votes</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Information Box */}
        {!result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold mb-3">📚 About Digital Signature Verification</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Digital signature verification</strong> uses cryptographic hashes stored in the database to ensure:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Authenticity:</strong> Verify the vote receipt is genuine and was recorded</li>
                <li><strong>Data Integrity:</strong> Confirm the vote details match what was stored</li>
                <li><strong>Non-Repudiation:</strong> Provide cryptographic proof of voting</li>
              </ul>
              <p className="mt-3 bg-yellow-50 p-2 rounded border border-yellow-200">
                <strong>How to use:</strong> Just enter your receipt hash. Optionally, provide userId, electionId, and candidateId to validate the data integrity.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                If you provide incorrect IDs, the system will show you the correct stored values!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
