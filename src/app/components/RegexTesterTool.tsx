"use client";

import React, { useState, useEffect } from 'react';
import { Code, Copy, Check, XCircle, Search, Info } from 'lucide-react';

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState<string>('\\d{3}-\\d{3}-\\d{4}');
  const [text, setText] = useState<string>('Call me at 123-456-7890 or 987-654-3210');
  const [flags, setFlags] = useState({
    g: true,  // global
    i: false, // case-insensitive
    m: false, // multiline
    s: false, // dotall
    u: false, // unicode
    y: false, // sticky
  });
  const [matches, setMatches] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Test regex automatically when inputs change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (pattern && text !== undefined) {
        handleTest();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [pattern, text, flags]);

  const handleTest = async () => {
    setError(null);
    setMatches([]);
    setAnalysis(null);

    if (!pattern.trim()) {
      setError("Pattern cannot be empty.");
      return;
    }

    setIsTesting(true);

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag, _]) => flag)
        .join('');

      const response = await fetch('/api/regex-tester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pattern,
          text,
          flags: flagString,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Testing failed');
      }
    } catch (err) {
      setError('Failed to test regex. Please try again.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyPattern = () => {
    navigator.clipboard.writeText(pattern);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFlagChange = (flag: string) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag as keyof typeof flags] }));
  };

  const loadExample = (examplePattern: string, exampleText: string, exampleFlags: any) => {
    setPattern(examplePattern);
    setText(exampleText);
    setFlags(exampleFlags);
  };

  // Highlight matches in the text
  const highlightMatches = () => {
    if (!text || matches.length === 0) {
      return text;
    }

    const parts: React.ReactElement[] = [];
    let lastIndex = 0;

    // Sort matches by index
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

    sortedMatches.forEach((match, idx) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${idx}`} className="text-gray-900 dark:text-white">
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add highlighted match
      parts.push(
        <span
          key={`match-${idx}`}
          className="bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white font-bold border-b-2 border-yellow-500 dark:border-yellow-300"
          title={`Match ${idx + 1}: "${match.match}" at index ${match.index}`}
        >
          {match.match}
        </span>
      );

      lastIndex = match.index + match.match.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end" className="text-gray-900 dark:text-white">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <Code className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Regular Expression Tester</h2>
      </header>

      {/* Quick Examples */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Quick Examples
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadExample('\\d{3}-\\d{3}-\\d{4}', 'Call me at 123-456-7890 or 987-654-3210', { g: true, i: false, m: false, s: false, u: false, y: false })}
            className="px-3 py-1 bg-white dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Phone Numbers
          </button>
          <button
            onClick={() => loadExample('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}', 'Email: john@example.com and support@company.net', { g: true, i: true, m: false, s: false, u: false, y: false })}
            className="px-3 py-1 bg-white dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Email Addresses
          </button>
          <button
            onClick={() => loadExample('https?://[^\\s]+', 'Visit https://example.com or http://test.org for more info', { g: true, i: false, m: false, s: false, u: false, y: false })}
            className="px-3 py-1 bg-white dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            URLs
          </button>
          <button
            onClick={() => loadExample('#[0-9a-f]{6}', 'Colors: #ff5733, #3498db, #2ecc71', { g: true, i: true, m: false, s: false, u: false, y: false })}
            className="px-3 py-1 bg-white dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Hex Colors
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
          <XCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Analysis Display */}
      {analysis && (
        <div className={`mb-6 p-4 border rounded-lg ${
          analysis.isMatch 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
              <div className={`text-lg font-bold ${
                analysis.isMatch 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {analysis.isMatch ? '✓ Match' : '✗ No Match'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{analysis.totalMatches}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Text Length</div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">{analysis.textLength}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Flags</div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">{analysis.flags || 'none'}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Pattern Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">Regular Expression Pattern</label>
            <button
              onClick={handleCopyPattern}
              className={`flex items-center px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                isCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern (e.g., \d{3}-\d{3}-\d{4})"
            className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Flags */}
        <div>
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">Flags</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: 'g', label: 'Global', desc: 'Find all matches' },
              { key: 'i', label: 'Case Insensitive', desc: 'Ignore case' },
              { key: 'm', label: 'Multiline', desc: '^ and $ match line boundaries' },
              { key: 's', label: 'Dotall', desc: '. matches newlines' },
              { key: 'u', label: 'Unicode', desc: 'Unicode matching' },
              { key: 'y', label: 'Sticky', desc: 'Match from lastIndex' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={flags[key as keyof typeof flags]}
                    onChange={() => handleFlagChange(key)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mr-2"
                  />
                  <span className="font-semibold text-gray-800 dark:text-white text-sm">{key}</span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-6">{desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Test Text */}
        <div>
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Test Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text to test against..."
            rows={6}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Highlighted Text */}
        {text && (
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
              Highlighted Matches
            </label>
            <div className="p-4 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm min-h-[150px] whitespace-pre-wrap break-words">
              {highlightMatches()}
            </div>
          </div>
        )}

        {/* Match Details */}
        {matches.length > 0 && (
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
              Match Details ({matches.length} {matches.length === 1 ? 'match' : 'matches'})
            </label>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {matches.map((match, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Match {index + 1}:</span>
                      <span className="ml-2 font-mono text-indigo-600 dark:text-indigo-400">{match.match}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Index:</span>
                      <span className="ml-2 text-gray-800 dark:text-white">{match.index}</span>
                    </div>
                  </div>
                  {match.groups && match.groups.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Captured Groups:</span>
                      <div className="ml-4 mt-1">
                        {match.groups.map((group: string, gIndex: number) => (
                          <div key={gIndex} className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Group {gIndex + 1}:</span>
                            <span className="ml-2 font-mono text-green-600 dark:text-green-400">{group}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Test and debug regular expressions with real-time matching and capture group visualization.
      </p>

      {/* API Documentation Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          API Access
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Use this tool programmatically via our REST API. Perfect for validating user input, parsing text data, and automated testing.
        </p>

        {/* API Endpoint */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Endpoint</h4>
          <code className="text-sm text-indigo-600 dark:text-indigo-400 break-all">
            POST https://toolteeno.com/api/regex-tester
          </code>
        </div>

        {/* Request Body */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Request Body</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "pattern": "string",  // Required: Regex pattern
  "text": "string",     // Required: Text to test
  "flags": "string"     // Optional: Flags (g, i, m, s, u, y)
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
  "matches": [
    {
      "match": "123-456-7890",
      "index": 12,
      "groups": [],
      "input": "Call me at 123-456-7890"
    }
  ],
  "analysis": {
    "totalMatches": 1,
    "isMatch": true,
    "pattern": "\\\\d{3}-\\\\d{3}-\\\\d{4}",
    "flags": "g",
    "textLength": 24
  }
}`}</code>
            </pre>
          </div>
        </div>

        {/* cURL Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">cURL Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`curl -X POST https://toolteeno.com/api/regex-tester \\
  -H "Content-Type: application/json" \\
  -d '{
    "pattern": "\\\\d{3}-\\\\d{3}-\\\\d{4}",
    "text": "Call me at 123-456-7890",
    "flags": "g"
  }'`}</code>
            </pre>
          </div>
        </div>

        {/* JavaScript Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">JavaScript/Fetch Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`const response = await fetch('https://toolteeno.com/api/regex-tester', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    pattern: '\\\\d{3}-\\\\d{3}-\\\\d{4}',
    text: 'Call me at 123-456-7890 or 987-654-3210',
    flags: 'g'
  })
});

const data = await response.json();
console.log(\`Found \${data.analysis.totalMatches} matches\`);
data.matches.forEach(match => {
  console.log(\`Match: "\${match.match}" at index \${match.index}\`);
});`}</code>
            </pre>
          </div>
        </div>

        {/* Python Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Python Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`import requests

response = requests.post(
    'https://toolteeno.com/api/regex-tester',
    json={
        'pattern': r'\\d{3}-\\d{3}-\\d{4}',
        'text': 'Call me at 123-456-7890 or 987-654-3210',
        'flags': 'g'
    }
)

result = response.json()
print(f"Found {result['analysis']['totalMatches']} matches")

for match in result['matches']:
    print(f"Match: '{match['match']}' at index {match['index']}")`}</code>
            </pre>
          </div>
        </div>

        {/* Use Cases */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
            Common Use Cases
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li><strong>Form Validation:</strong> Validate emails, phone numbers, URLs</li>
            <li><strong>Data Extraction:</strong> Parse log files, extract data patterns</li>
            <li><strong>Text Processing:</strong> Find and replace operations</li>
            <li><strong>Pattern Matching:</strong> Search for specific formats in text</li>
            <li><strong>Testing:</strong> Debug regex patterns before deployment</li>
            <li><strong>Learning:</strong> Understand how regex patterns work</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            This API is completely free to use with no rate limits or authentication required!
          </p>
        </div>
      </div>
    </div>
  );
}
