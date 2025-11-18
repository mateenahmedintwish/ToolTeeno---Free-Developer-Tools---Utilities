"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Copy, Check, XCircle, AlertCircle, Eye, EyeOff, Info } from 'lucide-react';

export default function JwtDebuggerTool() {
  const [token, setToken] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [decoded, setDecoded] = useState<any>(null);
  const [timestamps, setTimestamps] = useState<any>(null);
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);
  const [algorithm, setAlgorithm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<{ [key: string]: boolean }>({});
  const [isDecoding, setIsDecoding] = useState<boolean>(false);

  // Decode automatically when token changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (token.trim()) {
        handleDecode();
      } else {
        resetState();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [token, secret]);

  const resetState = () => {
    setDecoded(null);
    setTimestamps(null);
    setSignatureValid(null);
    setAlgorithm('');
    setError(null);
  };

  const handleDecode = async () => {
    setError(null);
    resetState();

    if (!token.trim()) {
      setError("JWT token cannot be empty.");
      return;
    }

    setIsDecoding(true);

    try {
      const response = await fetch('/api/jwt-debugger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          secret: secret.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDecoded(data.decoded);
        setTimestamps(data.timestamps);
        setSignatureValid(data.signatureValid);
        setAlgorithm(data.algorithm);
      } else {
        setError(data.error || 'Decoding failed');
      }
    } catch (err) {
      setError('Failed to decode JWT. Please try again.');
    } finally {
      setIsDecoding(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setIsCopied((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const loadExample = () => {
    setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiJ9.YKb8fGL7sPnMQEH-EH3HbN-gFKJZqvH1N4Nw7fmZQsA');
    setSecret('your-256-bit-secret');
  };

  const handleClear = () => {
    setToken('');
    setSecret('');
    resetState();
  };

  const renderJSON = (obj: any, title: string, copyKey: string) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h4>
        <button
          onClick={() => handleCopy(JSON.stringify(obj, null, 2), copyKey)}
          className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            isCopied[copyKey]
              ? 'bg-green-500 text-white'
              : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
          }`}
        >
          {isCopied[copyKey] ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {isCopied[copyKey] ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono">
          {JSON.stringify(obj, null, 2)}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">JWT Debugger</h2>
      </header>

      {/* Security Warning */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Security Notice</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Never share your secret keys publicly. This tool runs entirely in your browser and does not store or transmit your tokens or secrets.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
          <XCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Status Display */}
      {decoded && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Algorithm</div>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{algorithm}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Signature</div>
              <div className={`text-lg font-bold ${
                signatureValid === null 
                  ? 'text-gray-600 dark:text-gray-400'
                  : signatureValid 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
              }`}>
                {signatureValid === null ? 'Not Verified' : signatureValid ? '✓ Valid' : '✗ Invalid'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expired</div>
              <div className={`text-lg font-bold ${
                timestamps?.isExpired 
                  ? 'text-red-600 dark:text-red-400' 
                  : timestamps?.expiresAt 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400'
              }`}>
                {timestamps?.isExpired ? 'Yes' : timestamps?.expiresAt ? 'No' : 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Parts</div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">3</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Token Input */}
        <div>
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
            JWT Token
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Paste your JWT token here)</span>
          </label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            rows={4}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Secret Input */}
        <div>
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
            Secret Key
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional - for signature verification)</span>
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="your-256-bit-secret"
              className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Only HMAC algorithms (HS256, HS384, HS512) are supported for signature verification
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={loadExample}
            className="px-6 py-3 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 dark:hover:bg-green-600 transition duration-150"
          >
            Load Example
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150"
          >
            Clear
          </button>
        </div>

        {/* Decoded Information */}
        {decoded && (
          <div className="mt-8 space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Decoded Token
            </h3>

            {/* Header */}
            {renderJSON(decoded.header, 'Header', 'header')}

            {/* Payload */}
            {renderJSON(decoded.payload, 'Payload', 'payload')}

            {/* Timestamps */}
            {timestamps && Object.keys(timestamps).length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Timestamps</h4>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  {timestamps.issuedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Issued At (iat):</span>
                      <span className="text-sm text-gray-800 dark:text-white">
                        {timestamps.issuedAt.date} <span className="text-gray-500">({timestamps.issuedAt.timestamp})</span>
                      </span>
                    </div>
                  )}
                  {timestamps.expiresAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Expires At (exp):</span>
                      <span className={`text-sm ${timestamps.isExpired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {timestamps.expiresAt.date} <span className="text-gray-500">({timestamps.expiresAt.timestamp})</span>
                      </span>
                    </div>
                  )}
                  {timestamps.notBefore && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Not Before (nbf):</span>
                      <span className="text-sm text-gray-800 dark:text-white">
                        {timestamps.notBefore.date} <span className="text-gray-500">({timestamps.notBefore.timestamp})</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Signature */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Signature</h4>
                <button
                  onClick={() => handleCopy(decoded.signature, 'signature')}
                  className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isCopied.signature
                      ? 'bg-green-500 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
                  }`}
                >
                  {isCopied.signature ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {isCopied.signature ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
                  {decoded.signature}
                </p>
              </div>
            </div>

            {/* Raw Parts */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Raw Base64URL Parts</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Header:</div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-mono break-all">{decoded.raw.header}</p>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Payload:</div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-2">
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-mono break-all">{decoded.raw.payload}</p>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Signature:</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2">
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-mono break-all">{decoded.raw.signature}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Decode and inspect JSON Web Tokens (JWT) including header, payload, and signature validation.
      </p>

      {/* API Documentation Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          API Access
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Use this tool programmatically via our REST API. Perfect for debugging, validation, and automated testing of JWT tokens.
        </p>

        {/* API Endpoint */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Endpoint</h4>
          <code className="text-sm text-indigo-600 dark:text-indigo-400 break-all">
            POST https://toolteeno.com/api/jwt-debugger
          </code>
        </div>

        {/* Request Body */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Request Body</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "token": "string",   // Required: JWT token to decode
  "secret": "string"   // Optional: Secret for signature verification
}`}</code>
            </pre>
          </div>
        </div>

        {/* Response Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Example Response</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "success": true,
  "decoded": {
    "header": { "alg": "HS256", "typ": "JWT" },
    "payload": {
      "sub": "1234567890",
      "name": "John Doe",
      "iat": 1516239022
    },
    "signature": "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  },
  "timestamps": {
    "issuedAt": {
      "timestamp": 1516239022,
      "date": "2018-01-18T01:30:22.000Z"
    }
  },
  "signatureValid": true,
  "algorithm": "HS256",
  "type": "JWT"
}`}</code>
            </pre>
          </div>
        </div>

        {/* cURL Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">cURL Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`curl -X POST https://toolteeno.com/api/jwt-debugger \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "secret": "your-256-bit-secret"
  }'`}</code>
            </pre>
          </div>
        </div>

        {/* JavaScript Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">JavaScript/Fetch Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('https://toolteeno.com/api/jwt-debugger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: token,
    secret: 'your-256-bit-secret' // Optional
  })
});

const data = await response.json();
console.log('Header:', data.decoded.header);
console.log('Payload:', data.decoded.payload);
console.log('Signature Valid:', data.signatureValid);
console.log('Expired:', data.timestamps?.isExpired);`}</code>
            </pre>
          </div>
        </div>

        {/* Python Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Python Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`import requests

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

response = requests.post(
    'https://toolteeno.com/api/jwt-debugger',
    json={
        'token': token,
        'secret': 'your-256-bit-secret'  # Optional
    }
)

result = response.json()
print(f"Algorithm: {result['algorithm']}")
print(f"Signature Valid: {result['signatureValid']}")
print(f"Payload: {result['decoded']['payload']}")

if result['timestamps'].get('isExpired'):
    print("Token is expired!")`}</code>
            </pre>
          </div>
        </div>

        {/* Use Cases */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
            Common Use Cases
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li><strong>Development:</strong> Debug authentication issues during development</li>
            <li><strong>Validation:</strong> Verify JWT structure and signature</li>
            <li><strong>Inspection:</strong> Examine claims and payload data</li>
            <li><strong>Expiration:</strong> Check if tokens are expired</li>
            <li><strong>Learning:</strong> Understand JWT structure and encoding</li>
            <li><strong>Testing:</strong> Automated testing of JWT generation</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            <strong>Security:</strong> This API does not store or log any tokens or secrets. Always keep your secret keys private!
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This API is completely free to use with no rate limits or authentication required!
          </p>
        </div>
      </div>
    </div>
  );
}
