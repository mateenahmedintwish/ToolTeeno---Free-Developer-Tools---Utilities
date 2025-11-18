"use client";

import React, { useState } from 'react';
import { Zap, ArrowLeftRight, Copy, Check, XCircle, Info } from 'lucide-react';

// Convert JSON to TOON format
function toTOON(data: any): string {
  if (!Array.isArray(data)) {
    throw new Error('TOON format requires an array of objects');
  }

  if (data.length === 0) {
    return '';
  }

  if (!data.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
    throw new Error('TOON format requires an array of objects (not primitives or nested arrays)');
  }

  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  const keys = Array.from(allKeys);
  
  if (keys.length === 0) {
    return '';
  }

  const arrayName = 'data';
  let toon = `${arrayName}[${data.length}]{${keys.join(',')}}:\n`;
  
  data.forEach(item => {
    const values = keys.map(key => {
      const value = item[key];
      
      if (value === null || value === undefined) {
        return 'null';
      }
      
      if (typeof value === 'string') {
        const escaped = value
          .replace(/\\/g, '\\\\')
          .replace(/,/g, '\\,')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        return escaped;
      }
      
      if (typeof value === 'boolean') {
        return value.toString();
      }
      
      if (typeof value === 'number') {
        return value.toString();
      }
      
      if (typeof value === 'object') {
        return JSON.stringify(value).replace(/,/g, '\\,');
      }
      
      return String(value);
    });
    
    toon += `  ${values.join(',')}\n`;
  });
  
  return toon.trim();
}

// Convert TOON to JSON format
function fromTOON(toonStr: string): any[] {
  const lines = toonStr.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('Invalid TOON format: needs header and at least one data row');
  }
  
  const headerLine = lines[0];
  const headerMatch = headerLine.match(/^(\w+)\[(\d+)\]\{([^}]+)\}:$/);
  
  if (!headerMatch) {
    throw new Error('Invalid TOON header format. Expected: arrayName[count]{key1,key2,key3}:');
  }
  
  const [, arrayName, countStr, keysStr] = headerMatch;
  const count = parseInt(countStr, 10);
  const keys = keysStr.split(',').map(k => k.trim());
  
  const result: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (!line.trim()) continue;
    
    const trimmedLine = line.trim();
    
    const values: string[] = [];
    let currentValue = '';
    let escaped = false;
    
    for (let j = 0; j < trimmedLine.length; j++) {
      const char = trimmedLine[j];
      
      if (escaped) {
        if (char === '\\') {
          currentValue += '\\';
        } else if (char === ',') {
          currentValue += ',';
        } else if (char === 'n') {
          currentValue += '\n';
        } else if (char === 'r') {
          currentValue += '\r';
        } else {
          currentValue += char;
        }
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === ',') {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue);
    
    const obj: any = {};
    keys.forEach((key, index) => {
      const value = values[index]?.trim() || '';
      
      if (value === 'null') {
        obj[key] = null;
      } else if (value === 'true') {
        obj[key] = true;
      } else if (value === 'false') {
        obj[key] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        obj[key] = Number(value);
      } else if (value.startsWith('{') || value.startsWith('[')) {
        try {
          obj[key] = JSON.parse(value);
        } catch {
          obj[key] = value;
        }
      } else {
        obj[key] = value;
      }
    });
    
    result.push(obj);
  }
  
  return result;
}

export default function JsonToToonTool() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [mode, setMode] = useState<'json-to-toon' | 'toon-to-json'>('json-to-toon');
  const [tokenStats, setTokenStats] = useState<{ json: number; toon: number; savings: number } | null>(null);

  const estimateTokens = (text: string): number => {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  };

  const handleConvert = () => {
    setError(null);
    setTokenStats(null);
    
    if (!inputText.trim()) {
      setOutputText('');
      setError("Input cannot be empty.");
      return;
    }

    try {
      if (mode === 'json-to-toon') {
        const jsonObj = JSON.parse(inputText);
        const toonOutput = toTOON(jsonObj);
        setOutputText(toonOutput);
        
        // Calculate token savings
        const jsonTokens = estimateTokens(inputText);
        const toonTokens = estimateTokens(toonOutput);
        const savings = Math.round(((jsonTokens - toonTokens) / jsonTokens) * 100);
        setTokenStats({ json: jsonTokens, toon: toonTokens, savings });
      } else {
        const toonObj = fromTOON(inputText);
        const jsonOutput = JSON.stringify(toonObj, null, 2);
        setOutputText(jsonOutput);
        
        // Calculate token comparison
        const toonTokens = estimateTokens(inputText);
        const jsonTokens = estimateTokens(jsonOutput);
        const savings = Math.round(((jsonTokens - toonTokens) / jsonTokens) * 100);
        setTokenStats({ json: jsonTokens, toon: toonTokens, savings });
      }
    } catch (e) {
      setError(
        mode === 'json-to-toon'
          ? "Invalid JSON or must be an array of objects."
          : "Invalid TOON format. Check header and data rows."
      );
      setOutputText('');
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    setIsCopied(false);
    setTokenStats(null);
  };

  const handleSwapMode = () => {
    setMode((prevMode) =>
      prevMode === 'json-to-toon' ? 'toon-to-json' : 'json-to-toon'
    );
    setInputText(outputText);
    setOutputText(inputText);
    setError(null);
    setTokenStats(null);
  };

  const loadExample = () => {
    const exampleJson = [
      { id: 1, name: "Alice", role: "admin", active: true },
      { id: 2, name: "Bob", role: "user", active: true },
      { id: 3, name: "Charlie", role: "user", active: false }
    ];

    if (mode === 'json-to-toon') {
      setInputText(JSON.stringify(exampleJson, null, 2));
    } else {
      const toonExample = toTOON(exampleJson);
      setInputText(toonExample);
    }
    setOutputText('');
    setError(null);
    setTokenStats(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">JSON ⇄ TOON Converter</h2>
      </header>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
              Why TOON? Reduce LLM Token Usage by ~50%
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              TOON (Tabular Object Oriented Notation) eliminates JSON redundancy. Instead of repeating keys for every object, 
              TOON declares the structure once. Perfect for feeding large datasets to LLMs while minimizing token costs.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <span className={`font-semibold ${mode === 'json-to-toon' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
          JSON
        </span>
        <button
          onClick={handleSwapMode}
          className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          title="Swap conversion direction"
        >
          <ArrowLeftRight className="w-5 h-5" />
        </button>
        <span className={`font-semibold ${mode === 'toon-to-json' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
          TOON
        </span>
      </div>

      {/* Token Savings Display */}
      {tokenStats && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">JSON Tokens</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{tokenStats.json}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">TOON Tokens</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{tokenStats.toon}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Savings</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{tokenStats.savings}%</div>
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
        <div className="flex flex-col h-96">
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
            Input ({mode === 'json-to-toon' ? 'JSON Array' : 'TOON Format'})
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === 'json-to-toon'
                ? 'Paste your JSON array here...\n[\n  {"id": 1, "name": "Alice"},\n  {"id": 2, "name": "Bob"}\n]'
                : 'Paste your TOON format here...\ndata[2]{id,name}:\n  1,Alice\n  2,Bob'
            }
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Output Area */}
        <div className="flex flex-col h-96">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">
              Output ({mode === 'json-to-toon' ? 'TOON Format' : 'JSON Array'})
            </label>
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className={`flex items-center px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                isCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            value={outputText}
            readOnly
            placeholder={
              mode === 'json-to-toon'
                ? 'TOON output will appear here...\ndata[2]{id,name}:\n  1,Alice\n  2,Bob'
                : 'JSON output will appear here...\n[\n  {"id": 1, "name": "Alice"},\n  {"id": 2, "name": "Bob"}\n]'
            }
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={handleConvert}
          className="flex items-center px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-150 transform hover:scale-[1.02]"
        >
          <ArrowLeftRight className="w-5 h-5 mr-2" />
          Convert
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

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">TOON Format Rules:</h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
          <li>Header: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">arrayName[count]&#123;key1,key2,key3&#125;:</code></li>
          <li>Data rows must be indented with 2 spaces</li>
          <li>Values separated by commas (escape commas in values with <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">\,</code>)</li>
          <li>Requires an array of objects (not primitives or nested arrays)</li>
          <li>Preserves data types: strings, numbers, booleans, null</li>
        </ul>
      </div>

      {/* API Documentation Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          API Access
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Use this tool programmatically via our REST API. Perfect for optimizing LLM token usage, reducing API costs, and efficient data serialization.
        </p>

        {/* API Endpoint */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Endpoint</h4>
          <code className="text-sm text-indigo-600 dark:text-indigo-400 break-all">
            POST https://toolteeno.com/api/json-to-toon
          </code>
        </div>

        {/* Request Body */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Request Body</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "input": "string",           // Required: JSON array or TOON string
  "mode": "json-to-toon|toon-to-json" // Required: Conversion direction
}`}</code>
            </pre>
          </div>
        </div>

        {/* Response Examples */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Example Response (JSON to TOON)</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "success": true,
  "mode": "json-to-toon",
  "input": "[{\\"id\\":1,\\"name\\":\\"Alice\\"},{\\"id\\":2,\\"name\\":\\"Bob\\"}]",
  "output": "data[2]{id,name}:\\n  1,Alice\\n  2,Bob"
}`}</code>
            </pre>
          </div>
        </div>

        {/* cURL Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">cURL Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`curl -X POST https://toolteeno.com/api/json-to-toon \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "[{\\"id\\":1,\\"name\\":\\"Alice\\",\\"role\\":\\"admin\\"},{\\"id\\":2,\\"name\\":\\"Bob\\",\\"role\\":\\"user\\"}]",
    "mode": "json-to-toon"
  }'`}</code>
            </pre>
          </div>
        </div>

        {/* JavaScript Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">JavaScript/Fetch Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`const users = [
  { id: 1, name: "Alice", role: "admin" },
  { id: 2, name: "Bob", role: "user" }
];

const response = await fetch('https://toolteeno.com/api/json-to-toon', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: JSON.stringify(users),
    mode: 'json-to-toon'
  })
});

const data = await response.json();
console.log(data.output);
// Output: data[2]{id,name,role}:
//   1,Alice,admin
//   2,Bob,user`}</code>
            </pre>
          </div>
        </div>

        {/* Python Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Python Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`import requests
import json

users = [
    {"id": 1, "name": "Alice", "role": "admin", "active": True},
    {"id": 2, "name": "Bob", "role": "user", "active": False}
]

response = requests.post(
    'https://toolteeno.com/api/json-to-toon',
    json={
        'input': json.dumps(users),
        'mode': 'json-to-toon'
    }
)

result = response.json()
print(result['output'])
# Output: data[2]{id,name,role,active}:
#   1,Alice,admin,true
#   2,Bob,user,false`}</code>
            </pre>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
            Why Use TOON?
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li><strong>~50% Token Reduction:</strong> Significantly fewer tokens compared to JSON</li>
            <li><strong>Cost Savings:</strong> Reduce LLM API costs when processing large datasets</li>
            <li><strong>No Key Repetition:</strong> Declare structure once, not for every object</li>
            <li><strong>Optimized for LLMs:</strong> Designed specifically for language model efficiency</li>
            <li><strong>Type Preservation:</strong> Maintains strings, numbers, booleans, and null values</li>
            <li><strong>Bidirectional:</strong> Convert back to JSON anytime</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            This API is completely free to use with no rate limits or authentication required!
          </p>
        </div>
      </div>
    </div>
  );
}
