"use client";
import React, { useState } from 'react';
import { GitCompare, ArrowRight, RefreshCw, Copy, Check, XCircle, Settings } from 'lucide-react';

interface DiffItem {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  count: number;
}

interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
  totalChanges: number;
  similarity: number;
}

interface DiffResult {
  success: boolean;
  text1: string;
  text2: string;
  mode: 'chars' | 'words' | 'lines';
  differences: DiffItem[];
  stats: DiffStats;
  error?: string;
}

export default function TextDiffTool() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [mode, setMode] = useState<'chars' | 'words' | 'lines'>('lines');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const exampleText1 = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const user = "World";
greet(user);`;

  const exampleText2 = `function greet(name) {
  console.log("Hello, " + name + "!");
  return name;
}

const user = "Developer";
const result = greet(user);
console.log(result);`;

  const handleCompare = async () => {
    if (!text1 && !text2) {
      setError('Please enter text in both fields to compare');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/text-diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text1,
          text2,
          mode,
          ignoreCase,
          ignoreWhitespace,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Comparison failed');
      }
    } catch (err) {
      setError('An error occurred during comparison');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setText1(exampleText1);
    setText2(exampleText2);
    setResult(null);
    setError('');
  };

  const swapTexts = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
    setResult(null);
  };

  const copyDiff = () => {
    if (!result) return;
    
    const diffText = result.differences
      .map(d => {
        const prefix = d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  ';
        return prefix + d.value;
      })
      .join('\n');
    
    navigator.clipboard.writeText(diffText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setText1('');
    setText2('');
    setResult(null);
    setError('');
  };

  const renderDiffView = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        {/* Unified Diff View */}
        <div className="bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
            <span className="text-sm font-medium text-gray-300">Unified Diff</span>
            <button
              onClick={copyDiff}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4 overflow-x-auto font-mono text-sm max-h-96 overflow-y-auto">
            {result.differences.map((diff, index) => {
              let bgColor = '';
              let textColor = 'text-gray-300';
              let prefix = '  ';

              if (diff.type === 'added') {
                bgColor = 'bg-green-900/30';
                textColor = 'text-green-400';
                prefix = '+ ';
              } else if (diff.type === 'removed') {
                bgColor = 'bg-red-900/30';
                textColor = 'text-red-400';
                prefix = '- ';
              }

              const lines = diff.value.split('\n');
              return (
                <React.Fragment key={index}>
                  {lines.map((line, lineIndex) => (
                    <div
                      key={`${index}-${lineIndex}`}
                      className={`${bgColor} ${textColor} px-2 py-0.5 whitespace-pre-wrap break-all`}
                    >
                      {prefix}
                      {line}
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original Text (with deletions) */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Original</span>
            </div>
            <div className="p-4 overflow-x-auto font-mono text-sm max-h-96 overflow-y-auto">
              {result.differences.map((diff, index) => {
                if (diff.type === 'added') return null;
                
                const bgColor = diff.type === 'removed' ? 'bg-red-100 dark:bg-red-900/30' : '';
                const textColor = diff.type === 'removed' 
                  ? 'text-red-800 dark:text-red-400' 
                  : 'text-gray-700 dark:text-gray-300';

                const lines = diff.value.split('\n');
                return (
                  <React.Fragment key={index}>
                    {lines.map((line, lineIndex) => (
                      <div
                        key={`${index}-${lineIndex}`}
                        className={`${bgColor} ${textColor} px-2 py-0.5 whitespace-pre-wrap break-all`}
                      >
                        {line}
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Modified Text (with additions) */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modified</span>
            </div>
            <div className="p-4 overflow-x-auto font-mono text-sm max-h-96 overflow-y-auto">
              {result.differences.map((diff, index) => {
                if (diff.type === 'removed') return null;
                
                const bgColor = diff.type === 'added' ? 'bg-green-100 dark:bg-green-900/30' : '';
                const textColor = diff.type === 'added' 
                  ? 'text-green-800 dark:text-green-400' 
                  : 'text-gray-700 dark:text-gray-300';

                const lines = diff.value.split('\n');
                return (
                  <React.Fragment key={index}>
                    {lines.map((line, lineIndex) => (
                      <div
                        key={`${index}-${lineIndex}`}
                        className={`${bgColor} ${textColor} px-2 py-0.5 whitespace-pre-wrap break-all`}
                      >
                        {line}
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <GitCompare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Text Diff Checker</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare two pieces of text and highlight the differences
        </p>
      </div>

      {/* Mode Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => setMode('lines')}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                mode === 'lines'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Lines
            </button>
            <button
              onClick={() => setMode('words')}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                mode === 'words'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Words
            </button>
            <button
              onClick={() => setMode('chars')}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                mode === 'chars'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Characters
            </button>
          </div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="Toggle options"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Options Panel */}
      {showOptions && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Comparison Options</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ignoreCase"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="ignoreCase" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Ignore case differences
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ignoreWhitespace"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="ignoreWhitespace" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Ignore whitespace differences
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Input Text Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Text 1 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Original Text
            </label>
            <button
              onClick={loadExample}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Load Example
            </button>
          </div>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Enter original text..."
            className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {text1.length.toLocaleString()} characters · {text1.split('\n').length} lines
          </p>
        </div>

        {/* Text 2 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Modified Text
            </label>
            <button
              onClick={swapTexts}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Swap
            </button>
          </div>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Enter modified text..."
            className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {text2.length.toLocaleString()} characters · {text2.split('\n').length} lines
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleCompare}
          disabled={loading || (!text1 && !text2)}
          className="flex-1 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <ArrowRight className="w-5 h-5" />
              Compare Texts
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Statistics */}
      {result && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Comparison Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Additions</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{result.stats.additions}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Deletions</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                -{result.stats.deletions}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unchanged</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {result.stats.unchanged}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Changes</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {result.stats.totalChanges}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Similarity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.stats.similarity.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Diff Display */}
      {result && renderDiffView()}

      {/* API Documentation */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">API Usage</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Integrate text comparison into your applications with our REST API.
        </p>

        <div className="space-y-6">
          {/* Endpoint */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Endpoint</h3>
            <code className="block p-4 bg-gray-900 dark:bg-gray-950 text-green-400 rounded-lg overflow-x-auto">
              POST /api/text-diff
            </code>
          </div>

          {/* Request */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Request Body</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`{
  "text1": "Hello World",
  "text2": "Hello Developer",
  "mode": "words",              // "chars", "words", or "lines"
  "ignoreCase": false,          // optional
  "ignoreWhitespace": false     // optional
}`}
            </pre>
          </div>

          {/* cURL Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">cURL Example</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`curl -X POST https://toolteeno.com/api/text-diff \\
  -H "Content-Type: application/json" \\
  -d '{
    "text1": "The quick brown fox",
    "text2": "The fast brown dog",
    "mode": "words"
  }'`}
            </pre>
          </div>

          {/* JavaScript Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">JavaScript Example</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`const response = await fetch('/api/text-diff', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text1: 'Hello World',
    text2: 'Hello Developer',
    mode: 'words',
    ignoreCase: false
  })
});

const data = await response.json();
console.log(data.stats.similarity); // 50.00`}
            </pre>
          </div>

          {/* Python Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Python Example</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`import requests

response = requests.post('https://toolteeno.com/api/text-diff', json={
    'text1': 'Line 1\\nLine 2',
    'text2': 'Line 1\\nLine 3',
    'mode': 'lines'
})

data = response.json()
print(f"Changes: {data['stats']['totalChanges']}")`}
            </pre>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Common Use Cases</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Compare document versions to track content changes over time</li>
            <li>Review code changes before committing to version control</li>
            <li>Detect plagiarism or measure text similarity between documents</li>
            <li>Validate data transformations and migration results</li>
            <li>Track configuration file changes across deployments</li>
            <li>Compare API responses or JSON outputs for regression testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
