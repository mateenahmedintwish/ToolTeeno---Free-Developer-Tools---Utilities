// app/components/HashGeneratorTool.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Hash, Copy, Check, FileText, AlertCircle } from 'lucide-react';

interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
}

interface HashResponse {
  success: boolean;
  results?: HashResult[];
  input?: {
    text: string;
    textLength: number;
  };
  error?: string;
}

const SUPPORTED_ALGORITHMS = [
  { id: 'md5', name: 'MD5', description: '128-bit hash (32 hex characters)' },
  { id: 'sha1', name: 'SHA-1', description: '160-bit hash (40 hex characters)' },
  { id: 'sha256', name: 'SHA-256', description: '256-bit hash (64 hex characters)' },
  { id: 'sha384', name: 'SHA-384', description: '384-bit hash (96 hex characters)' },
  { id: 'sha512', name: 'SHA-512', description: '512-bit hash (128 hex characters)' },
  { id: 'ripemd160', name: 'RIPEMD-160', description: '160-bit hash (40 hex characters)' },
];

export default function HashGeneratorTool() {
  const [inputText, setInputText] = useState('');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['md5', 'sha256', 'sha512']);
  const [results, setResults] = useState<HashResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Auto-generate hashes when input changes
  useEffect(() => {
    if (inputText.trim()) {
      const debounceTimer = setTimeout(() => {
        generateHashes();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
    }
  }, [inputText, selectedAlgorithms]);

  const generateHashes = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to hash');
      return;
    }

    if (selectedAlgorithms.length === 0) {
      setError('Please select at least one algorithm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/hash-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          algorithms: selectedAlgorithms,
        }),
      });

      const data: HashResponse = await response.json();

      if (data.success && data.results) {
        setResults(data.results);
      } else {
        setError(data.error || 'Failed to generate hashes');
      }
    } catch (err) {
      setError('Failed to generate hashes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, algorithm: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(algorithm);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleAlgorithm = (algorithmId: string) => {
    setSelectedAlgorithms(prev => {
      if (prev.includes(algorithmId)) {
        return prev.filter(id => id !== algorithmId);
      } else {
        return [...prev, algorithmId];
      }
    });
  };

  const selectAllAlgorithms = () => {
    setSelectedAlgorithms(SUPPORTED_ALGORITHMS.map(alg => alg.id));
  };

  const clearAllAlgorithms = () => {
    setSelectedAlgorithms([]);
  };

  const loadExample = () => {
    setInputText('The quick brown fox jumps over the lazy dog');
    setSelectedAlgorithms(['md5', 'sha256', 'sha512']);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-4">
            <Hash className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Hash Generator</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Generate cryptographic hashes from any text</p>
          </div>
        </div>
        <button
          onClick={loadExample}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
        >
          Load Example
        </button>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Input Text
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to hash..."
          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200"
        />
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {inputText.length} characters
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Select Hash Algorithms
          </label>
          <div className="flex gap-2">
            <button
              onClick={selectAllAlgorithms}
              className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200"
            >
              Select All
            </button>
            <button
              onClick={clearAllAlgorithms}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUPPORTED_ALGORITHMS.map((algorithm) => (
            <label
              key={algorithm.id}
              className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedAlgorithms.includes(algorithm.id)
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAlgorithms.includes(algorithm.id)}
                onChange={() => toggleAlgorithm(algorithm.id)}
                className="mt-1 mr-3 h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500"
              />
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">{algorithm.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{algorithm.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Generating hashes...</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Generated Hashes</h3>
          {results.map((result) => (
            <div
              key={result.algorithm}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold">
                    {result.algorithm}
                  </span>
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {result.length} characters
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(result.hash, result.algorithm)}
                  className="flex items-center px-3 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors duration-200 text-sm"
                >
                  {copiedHash === result.algorithm ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 font-mono text-sm break-all text-gray-800 dark:text-gray-200">
                {result.hash}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Documentation */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          API Documentation
        </h3>
        
        <div className="space-y-4">
          {/* cURL Example */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">cURL Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST https://toolteeno.com/api/hash-generator \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello, World!",
    "algorithms": ["md5", "sha256", "sha512"]
  }'`}
            </pre>
          </div>

          {/* JavaScript Example */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">JavaScript Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`fetch('https://toolteeno.com/api/hash-generator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello, World!',
    algorithms: ['md5', 'sha256', 'sha512']
  })
})
.then(res => res.json())
.then(data => console.log(data));`}
            </pre>
          </div>

          {/* Python Example */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Python Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import requests

response = requests.post(
    'https://toolteeno.com/api/hash-generator',
    json={
        'text': 'Hello, World!',
        'algorithms': ['md5', 'sha256', 'sha512']
    }
)
print(response.json())`}
            </pre>
          </div>

          {/* Response Example */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Response Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "results": [
    {
      "algorithm": "MD5",
      "hash": "65a8e27d8879283831b664bd8b7f0ad4",
      "length": 32
    },
    {
      "algorithm": "SHA256",
      "hash": "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
      "length": 64
    }
  ],
  "input": {
    "text": "Hello, World!",
    "textLength": 13
  }
}`}
            </pre>
          </div>
        </div>
      </div>

    </div>
  );
}
