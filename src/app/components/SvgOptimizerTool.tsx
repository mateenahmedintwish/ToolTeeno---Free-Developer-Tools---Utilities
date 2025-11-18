"use client";

import React, { useState } from 'react';
import { Sparkles, Copy, Check, XCircle, Download, Upload, ArrowRight } from 'lucide-react';

export default function SvgOptimizerTool() {
  const [inputSvg, setInputSvg] = useState<string>('');
  const [outputSvg, setOutputSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [stats, setStats] = useState<any>(null);
  
  const [options, setOptions] = useState({
    removeComments: true,
    removeMetadata: true,
    removeHiddenElements: true,
    minifyColors: true,
    removeEmptyAttrs: true,
    precision: 2,
  });

  const handleOptimize = async () => {
    setError(null);
    setStats(null);
    
    if (!inputSvg.trim()) {
      setOutputSvg('');
      setError("Input cannot be empty.");
      return;
    }

    if (!inputSvg.includes('<svg')) {
      setError("Invalid SVG: Input must contain valid SVG markup.");
      return;
    }

    setIsOptimizing(true);

    try {
      const response = await fetch('/api/svg-optimizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          svg: inputSvg,
          options,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOutputSvg(data.optimized);
        setStats(data.stats);
      } else {
        setError(data.error || 'Optimization failed');
        setOutputSvg('');
      }
    } catch (err) {
      setError('Failed to optimize SVG. Please try again.');
      setOutputSvg('');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = () => {
    if (outputSvg) {
      navigator.clipboard.writeText(outputSvg);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (outputSvg) {
      const blob = new Blob([outputSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'optimized.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputSvg(content);
        setOutputSvg('');
        setStats(null);
        setError(null);
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setInputSvg('');
    setOutputSvg('');
    setError(null);
    setIsCopied(false);
    setStats(null);
  };

  const loadExample = () => {
    const exampleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with some editor -->
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
     width="200" height="200" viewBox="0 0 200 200">
  <title>Example Icon</title>
  <desc>This is an example SVG icon</desc>
  <metadata>
    <rdf:RDF>
      <cc:Work rdf:about="">
        <dc:format>image/svg+xml</dc:format>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <circle cx="100.123456" cy="100.123456" r="80.123456" fill="rgb(255, 0, 0)" stroke="black" stroke-width="2.000000"/>
  <rect x="50.500000" y="150.500000" width="100.000000" height="20.000000" fill="#0000ff" stroke="none"/>
  <g display="none">
    <path d="M 0 0 L 10 10" fill="black"/>
  </g>
</svg>`;
    setInputSvg(exampleSvg);
    setOutputSvg('');
    setStats(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">SVG Optimizer</h2>
      </header>

      {/* Options Panel */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Optimization Options</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.removeComments}
              onChange={(e) => setOptions({ ...options, removeComments: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Remove Comments</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.removeMetadata}
              onChange={(e) => setOptions({ ...options, removeMetadata: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Remove Metadata</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.removeHiddenElements}
              onChange={(e) => setOptions({ ...options, removeHiddenElements: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Remove Hidden Elements</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.minifyColors}
              onChange={(e) => setOptions({ ...options, minifyColors: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Minify Colors</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.removeEmptyAttrs}
              onChange={(e) => setOptions({ ...options, removeEmptyAttrs: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Remove Empty Attrs</span>
          </label>
          <label className="flex items-col space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Precision:</span>
            <input
              type="number"
              min="0"
              max="5"
              value={options.precision}
              onChange={(e) => setOptions({ ...options, precision: parseInt(e.target.value) || 2 })}
              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm"
            />
          </label>
        </div>
      </div>

      {/* Stats Display */}
      {stats && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Original Size</div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">{stats.originalSizeKB} KB</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Optimized Size</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.optimizedSizeKB} KB</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Saved</div>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats.savings}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bytes Saved</div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">{stats.originalSize - stats.optimizedSize}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
          <XCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">Input SVG</label>
            <label className="flex items-center gap-2 px-4 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm">
              <Upload className="w-4 h-4" />
              Upload File
              <input
                type="file"
                accept=".svg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <textarea
            value={inputSvg}
            onChange={(e) => setInputSvg(e.target.value)}
            placeholder='Paste your SVG code here or upload a file...'
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Output Area */}
        <div className="flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">Optimized SVG</label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!outputSvg}
                className={`flex items-center px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isCopied
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50'
                }`}
              >
                {isCopied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputSvg}
                className="flex items-center px-4 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            </div>
          </div>
          <textarea
            value={outputSvg}
            readOnly
            placeholder='Optimized SVG will appear here...'
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="flex items-center px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-150 transform hover:scale-[1.02] disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Optimize SVG
            </>
          )}
        </button>
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

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Reduce SVG file size by removing unnecessary metadata, comments, and optimizing code.
      </p>

      {/* API Documentation Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          API Access
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Use this tool programmatically via our REST API. Perfect for build pipelines, batch processing, and automated SVG optimization.
        </p>

        {/* API Endpoint */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Endpoint</h4>
          <code className="text-sm text-indigo-600 dark:text-indigo-400 break-all">
            POST https://toolteeno.com/api/svg-optimizer
          </code>
        </div>

        {/* Request Body */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Request Body</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "svg": "string",              // Required: SVG content to optimize
  "options": {
    "removeComments": true,     // Remove XML comments
    "removeMetadata": true,     // Remove metadata, title, desc
    "removeHiddenElements": true, // Remove hidden elements
    "minifyColors": true,       // Minify color values
    "removeEmptyAttrs": true,   // Remove empty attributes
    "precision": 2              // Number precision (0-5)
  }
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
  "optimized": "<svg>...</svg>",
  "stats": {
    "originalSize": 1024,
    "optimizedSize": 512,
    "savings": 50,
    "originalSizeKB": "1.00",
    "optimizedSizeKB": "0.50"
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
              <code className="text-gray-800 dark:text-gray-200">{`curl -X POST https://toolteeno.com/api/svg-optimizer \\
  -H "Content-Type: application/json" \\
  -d '{
    "svg": "<svg><circle cx=\\"50\\" cy=\\"50\\" r=\\"40\\"/></svg>",
    "options": {
      "removeComments": true,
      "minifyColors": true
    }
  }'`}</code>
            </pre>
          </div>
        </div>

        {/* JavaScript Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">JavaScript/Fetch Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`const svgContent = '<svg>...</svg>';

const response = await fetch('https://toolteeno.com/api/svg-optimizer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    svg: svgContent,
    options: {
      removeComments: true,
      removeMetadata: true,
      minifyColors: true,
      precision: 2
    }
  })
});

const data = await response.json();
console.log(\`Saved \${data.stats.savings}%\`);
console.log(data.optimized);`}</code>
            </pre>
          </div>
        </div>

        {/* Python Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Python Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`import requests

with open('input.svg', 'r') as f:
    svg_content = f.read()

response = requests.post(
    'https://toolteeno.com/api/svg-optimizer',
    json={
        'svg': svg_content,
        'options': {
            'removeComments': True,
            'removeMetadata': True,
            'minifyColors': True,
            'precision': 2
        }
    }
)

result = response.json()
print(f"Saved {result['stats']['savings']}%")

with open('output.svg', 'w') as f:
    f.write(result['optimized'])`}</code>
            </pre>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
            Optimization Benefits
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li><strong>Faster Load Times:</strong> Smaller files load faster</li>
            <li><strong>Reduced Bandwidth:</strong> Save on data transfer costs</li>
            <li><strong>Better Performance:</strong> Improved Lighthouse scores</li>
            <li><strong>Cleaner Code:</strong> Remove editor-specific metadata</li>
            <li><strong>SEO Benefits:</strong> Faster pages rank better</li>
            <li><strong>Typical Savings:</strong> 30-70% file size reduction</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            This API is completely free to use with no rate limits or authentication required!
          </p>
        </div>
      </div>
    </div>
  );
}
