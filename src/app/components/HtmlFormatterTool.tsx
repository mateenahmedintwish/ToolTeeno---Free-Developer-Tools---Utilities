"use client";
import React, { useState } from 'react';
import { Code, Minimize2, Maximize2, Copy, Check, Download, Upload, RefreshCw, XCircle, Settings } from 'lucide-react';

interface FormatterStats {
  originalSize: number;
  formattedSize: number;
  reduction: number;
  lines: number;
}

interface FormatterResult {
  success: boolean;
  mode: 'prettify' | 'minify';
  input: string;
  output: string;
  stats: FormatterStats;
  error?: string;
}

export default function HtmlFormatterTool() {
  const [html, setHtml] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'prettify' | 'minify'>('prettify');
  const [result, setResult] = useState<FormatterResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Options
  const [indentSize, setIndentSize] = useState(2);
  const [removeComments, setRemoveComments] = useState(false);
  const [sortAttributes, setSortAttributes] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const exampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Page</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; }
    </style>
</head>
<body>
    <!-- Main Content -->
    <div class="container">
        <header id="header">
            <h1>Welcome to My Website</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
        </header>
        <main>
            <article>
                <h2>Article Title</h2>
                <p>This is a paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
                <img src="image.jpg" alt="Description" width="600" height="400" />
            </article>
        </main>
        <footer>
            <p>&copy; 2024 My Website. All rights reserved.</p>
        </footer>
    </div>
    <script>
        console.log('Page loaded successfully!');
    </script>
</body>
</html>`;

  const handleFormat = async () => {
    if (!html.trim()) {
      setError('Please enter HTML code to format');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/html-formatter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          mode,
          options: {
            indentSize,
            removeComments,
            sortAttributes,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setOutput(data.output);
      } else {
        setError(data.error || 'Formatting failed');
      }
    } catch (err) {
      setError('An error occurred during formatting');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setHtml(exampleHTML);
    setOutput('');
    setResult(null);
    setError('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setHtml(content);
        setOutput('');
        setResult(null);
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setHtml('');
    setOutput('');
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <Code className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">HTML Formatter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Prettify or minify HTML code for readability or production deployment
        </p>
      </div>

      {/* Mode Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => {
                setMode('prettify');
                setOutput('');
                setResult(null);
              }}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                mode === 'prettify'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              Prettify
            </button>
            <button
              onClick={() => {
                setMode('minify');
                setOutput('');
                setResult(null);
              }}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                mode === 'minify'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Minimize2 className="w-4 h-4" />
              Minify
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
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Formatting Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mode === 'prettify' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Indent Size
                </label>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces (tab)</option>
                </select>
              </div>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="removeComments"
                checked={removeComments}
                onChange={(e) => setRemoveComments(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="removeComments" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Remove HTML comments
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sortAttributes"
                checked={sortAttributes}
                onChange={(e) => setSortAttributes(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="sortAttributes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Sort attributes alphabetically
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Input/Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Input Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Input HTML
            </label>
            <div className="flex gap-2">
              <label className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 inline mr-1" />
                Upload
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={loadExample}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Example
              </button>
            </div>
          </div>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Paste your HTML code here..."
            className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {html.length.toLocaleString()} characters
          </p>
        </div>

        {/* Output Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Output HTML
            </label>
            {output && (
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(output)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
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
                <button
                  onClick={downloadOutput}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Download
                </button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted HTML will appear here..."
            className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm rounded-lg resize-none"
          />
          {result && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {result.stats.formattedSize.toLocaleString()} characters · {result.stats.lines} lines
              {mode === 'minify' && result.stats.reduction > 0 && (
                <span className="text-green-600 dark:text-green-400 ml-2">
                  ({result.stats.reduction}% reduction)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleFormat}
          disabled={loading || !html.trim()}
          className="flex-1 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Formatting...
            </>
          ) : (
            <>
              {mode === 'prettify' ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
              {mode === 'prettify' ? 'Prettify HTML' : 'Minify HTML'}
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

      {/* Stats Display */}
      {result && (
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Formatting Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Original Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.stats.originalSize.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">bytes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Formatted Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.stats.formattedSize.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">bytes</p>
            </div>
            {mode === 'minify' && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Size Reduction</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.stats.reduction.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">saved</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lines</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.stats.lines}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">total</p>
            </div>
          </div>
        </div>
      )}

      {/* API Documentation */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">API Usage</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Integrate HTML formatting into your applications with our REST API.
        </p>

        <div className="space-y-6">
          {/* Endpoint */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Endpoint</h3>
            <code className="block p-4 bg-gray-900 dark:bg-gray-950 text-green-400 rounded-lg overflow-x-auto">
              POST /api/html-formatter
            </code>
          </div>

          {/* Request */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Request Body</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`{
  "html": "<div><h1>Hello</h1></div>",
  "mode": "prettify",           // or "minify"
  "options": {
    "indentSize": 2,            // spaces per indent (prettify)
    "removeComments": false,    // remove HTML comments
    "sortAttributes": false     // sort attributes alphabetically
  }
}`}
            </pre>
          </div>

          {/* cURL Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">cURL Example</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`curl -X POST https://toolteeno.com/api/html-formatter \\
  -H "Content-Type: application/json" \\
  -d '{
    "html": "<div><h1>Hello World</h1><p>Test</p></div>",
    "mode": "prettify",
    "options": {"indentSize": 2}
  }'`}
            </pre>
          </div>

          {/* JavaScript Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">JavaScript Example</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`const response = await fetch('/api/html-formatter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html: '<div><h1>Hello</h1></div>',
    mode: 'minify',
    options: { removeComments: true }
  })
});

const data = await response.json();
console.log(data.output); // Minified HTML`}
            </pre>
          </div>

          {/* Python Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Python Example</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`import requests

response = requests.post('https://toolteeno.com/api/html-formatter', json={
    'html': '<div><h1>Hello World</h1></div>',
    'mode': 'prettify',
    'options': {'indentSize': 4, 'removeComments': True}
})

data = response.json()
print(data['output'])  # Prettified HTML`}
            </pre>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Common Use Cases</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Format messy HTML from WYSIWYG editors for better readability</li>
            <li>Minify HTML for production to reduce file size and improve load times</li>
            <li>Clean up generated HTML from templates or build tools</li>
            <li>Standardize HTML formatting across development teams</li>
            <li>Remove comments and unnecessary whitespace before deployment</li>
            <li>Prepare HTML for version control with consistent formatting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
