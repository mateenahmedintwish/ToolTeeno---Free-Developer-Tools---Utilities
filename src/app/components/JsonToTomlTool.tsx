"use client";

import React, { useState } from 'react';
import { FileJson, ArrowLeftRight, Copy, Check, XCircle } from 'lucide-react';

// Simple TOML encoder
function toTOML(obj: any, parentKey = ''): string {
  let toml = '';
  const tables: { [key: string]: any } = {};
  const values: string[] = [];

  for (const key in obj) {
    const value = obj[key];
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (value === null || value === undefined) {
      values.push(`${key} = null`);
    } else if (typeof value === 'boolean') {
      values.push(`${key} = ${value}`);
    } else if (typeof value === 'number') {
      values.push(`${key} = ${value}`);
    } else if (typeof value === 'string') {
      const escapedValue = value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      values.push(`${key} = "${escapedValue}"`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        values.push(`${key} = []`);
      } else if (typeof value[0] === 'object' && !Array.isArray(value[0])) {
        tables[key] = value;
      } else {
        const arrayValues = value.map((v) => {
          if (typeof v === 'string') {
            const escapedValue = v
              .replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, '\\n');
            return `"${escapedValue}"`;
          }
          return v;
        });
        values.push(`${key} = [${arrayValues.join(', ')}]`);
      }
    } else if (typeof value === 'object') {
      tables[key] = value;
    }
  }

  if (values.length > 0) {
    toml += values.join('\n') + '\n';
  }

  for (const key in tables) {
    const value = tables[key];
    if (Array.isArray(value)) {
      toml += '\n';
      value.forEach((item) => {
        toml += `[[${parentKey ? parentKey + '.' : ''}${key}]]\n`;
        toml += toTOML(item, '');
      });
    } else {
      toml += '\n';
      toml += `[${parentKey ? parentKey + '.' : ''}${key}]\n`;
      toml += toTOML(value, '');
    }
  }

  return toml;
}

// Simple TOML decoder
function fromTOML(tomlStr: string): any {
  const result: any = {};
  let currentTable: any = result;
  let currentPath: string[] = [];

  const lines = tomlStr.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('[') && line.endsWith(']')) {
      const isArrayTable = line.startsWith('[[') && line.endsWith(']]');
      const tableName = isArrayTable
        ? line.slice(2, -2).trim()
        : line.slice(1, -1).trim();

      const path = tableName.split('.');
      currentPath = path;
      currentTable = result;

      for (let j = 0; j < path.length; j++) {
        const key = path[j];
        if (isArrayTable && j === path.length - 1) {
          if (!currentTable[key]) {
            currentTable[key] = [];
          }
          const newObj = {};
          currentTable[key].push(newObj);
          currentTable = newObj;
        } else {
          if (!currentTable[key]) {
            currentTable[key] = {};
          }
          currentTable = currentTable[key];
        }
      }
      continue;
    }

    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) continue;

    const key = line.slice(0, equalIndex).trim();
    let value = line.slice(equalIndex + 1).trim();

    let parsedValue: any;

    if (value === 'true') {
      parsedValue = true;
    } else if (value === 'false') {
      parsedValue = false;
    } else if (value === 'null') {
      parsedValue = null;
    } else if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1).trim();
      if (!arrayContent) {
        parsedValue = [];
      } else {
        parsedValue = arrayContent.split(',').map((item) => {
          const trimmed = item.trim();
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return trimmed
              .slice(1, -1)
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
          }
          if (!isNaN(Number(trimmed))) {
            return Number(trimmed);
          }
          if (trimmed === 'true') return true;
          if (trimmed === 'false') return false;
          return trimmed;
        });
      }
    } else if (value.startsWith('"') && value.endsWith('"')) {
      parsedValue = value
        .slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    } else if (!isNaN(Number(value))) {
      parsedValue = Number(value);
    } else {
      parsedValue = value;
    }

    currentTable[key] = parsedValue;
  }

  return result;
}

export default function JsonToTomlTool() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [mode, setMode] = useState<'json-to-toml' | 'toml-to-json'>('json-to-toml');

  const handleConvert = () => {
    setError(null);
    if (!inputText.trim()) {
      setOutputText('');
      setError("Input cannot be empty.");
      return;
    }

    try {
      if (mode === 'json-to-toml') {
        const jsonObj = JSON.parse(inputText);
        const tomlOutput = toTOML(jsonObj).trim();
        setOutputText(tomlOutput);
      } else {
        const tomlObj = fromTOML(inputText);
        const jsonOutput = JSON.stringify(tomlObj, null, 2);
        setOutputText(jsonOutput);
      }
    } catch (e) {
      setError(
        mode === 'json-to-toml'
          ? "Invalid JSON. Please check your syntax."
          : "Invalid TOML. Please check your syntax."
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
  };

  const handleSwapMode = () => {
    setMode((prevMode) =>
      prevMode === 'json-to-toml' ? 'toml-to-json' : 'json-to-toml'
    );
    setInputText(outputText);
    setOutputText(inputText);
    setError(null);
  };

  const loadExample = () => {
    const exampleJson = {
      name: "ToolTeeno",
      version: "1.0.0",
      description: "Free developer tools",
      author: {
        name: "Mateen Ahmed",
        role: "Developer"
      },
      features: ["Fast", "Free", "Privacy First"],
      settings: {
        darkMode: true,
        port: 3000
      }
    };

    if (mode === 'json-to-toml') {
      setInputText(JSON.stringify(exampleJson, null, 2));
    } else {
      const tomlExample = toTOML(exampleJson).trim();
      setInputText(tomlExample);
    }
    setOutputText('');
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <FileJson className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">JSON ⇄ TOML Converter</h2>
      </header>

      {/* Mode Selector */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <span className={`font-semibold ${mode === 'json-to-toml' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
          JSON
        </span>
        <button
          onClick={handleSwapMode}
          className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          title="Swap conversion direction"
        >
          <ArrowLeftRight className="w-5 h-5" />
        </button>
        <span className={`font-semibold ${mode === 'toml-to-json' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
          TOML
        </span>
      </div>

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
            Input ({mode === 'json-to-toml' ? 'JSON' : 'TOML'})
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'json-to-toml' ? 'Paste your JSON here...' : 'Paste your TOML here...'}
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Output Area */}
        <div className="flex flex-col h-96">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">
              Output ({mode === 'json-to-toml' ? 'TOML' : 'JSON'})
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
            placeholder={mode === 'json-to-toml' ? 'TOML output will appear here...' : 'JSON output will appear here...'}
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

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Convert between JSON and TOML formats. TOML is commonly used for configuration files.
      </p>

      {/* API Documentation Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          API Access
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Use this tool programmatically via our REST API. Perfect for build pipelines, configuration management, and automated data transformation.
        </p>

        {/* API Endpoint */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Endpoint</h4>
          <code className="text-sm text-indigo-600 dark:text-indigo-400 break-all">
            POST https://toolteeno.com/api/json-to-toml
          </code>
        </div>

        {/* Request Body */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Request Body</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "input": "string",           // Required: JSON or TOML string to convert
  "mode": "json-to-toml|toml-to-json" // Required: Conversion direction
}`}</code>
            </pre>
          </div>
        </div>

        {/* Response Examples */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Example Response (JSON to TOML)</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "success": true,
  "mode": "json-to-toml",
  "input": "{\\"name\\":\\"John\\",\\"age\\":30,\\"active\\":true}",
  "output": "name = \\"John\\"\\nage = 30\\nactive = true"
}`}</code>
            </pre>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Example Response (TOML to JSON)</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "success": true,
  "mode": "toml-to-json",
  "input": "name = \\"John\\"\\nage = 30\\nactive = true",
  "output": "{\\n  \\"name\\": \\"John\\",\\n  \\"age\\": 30,\\n  \\"active\\": true\\n}"
}`}</code>
            </pre>
          </div>
        </div>

        {/* cURL Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">cURL Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`curl -X POST https://toolteeno.com/api/json-to-toml \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "{\\"database\\":{\\"server\\":\\"192.168.1.1\\",\\"port\\":5432}}",
    "mode": "json-to-toml"
  }'`}</code>
            </pre>
          </div>
        </div>

        {/* JavaScript Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">JavaScript/Fetch Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`const configJson = {
  database: {
    server: "192.168.1.1",
    ports: [8001, 8002],
    enabled: true
  }
};

const response = await fetch('https://toolteeno.com/api/json-to-toml', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: JSON.stringify(configJson),
    mode: 'json-to-toml'
  })
});

const data = await response.json();
console.log(data.output);
// Output: TOML formatted configuration`}</code>
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

config = {
    "app": {
        "name": "MyApp",
        "version": "1.0.0",
        "debug": False
    }
}

response = requests.post(
    'https://toolteeno.com/api/json-to-toml',
    json={
        'input': json.dumps(config),
        'mode': 'json-to-toml'
    }
)

result = response.json()
print(result['output'])
# Output: TOML configuration`}</code>
            </pre>
          </div>
        </div>

        {/* Use Cases */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
            Common Use Cases
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li>Converting configuration files between formats</li>
            <li>Migrating from JSON to TOML configs (Cargo, Rust, etc.)</li>
            <li>API response transformation</li>
            <li>Configuration file generation in build pipelines</li>
            <li>Data format conversion for different tools and frameworks</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            <strong>Format Support:</strong> Handles nested objects, arrays, strings, numbers, booleans, and null values in both directions.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This API is completely free to use with no rate limits or authentication required!
          </p>
        </div>
      </div>
    </div>
  );
}
