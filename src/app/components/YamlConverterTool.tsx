"use client";

import React, { useState } from 'react';
import { RefreshCw, Copy, Check, XCircle, Download, ArrowRight, FileJson } from 'lucide-react';

export default function YamlConverterTool() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [fromFormat, setFromFormat] = useState<string>('json');
  const [toFormat, setToFormat] = useState<string>('yaml');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [stats, setStats] = useState<any>(null);

  const handleConvert = async () => {
    setError(null);
    setStats(null);

    if (!input.trim()) {
      setOutput('');
      setError("Input cannot be empty.");
      return;
    }

    if (fromFormat === toFormat) {
      setError("Source and target formats must be different.");
      return;
    }

    setIsConverting(true);

    try {
      const response = await fetch('/api/yaml-converter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input,
          from: fromFormat,
          to: toFormat,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOutput(data.output);
        setStats({
          from: data.from,
          to: data.to,
          inputSize: data.inputSize,
          outputSize: data.outputSize,
        });
      } else {
        setError(data.error || 'Conversion failed');
        setOutput('');
      }
    } catch (err) {
      setError('Failed to convert. Please try again.');
      setOutput('');
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (output) {
      const extension = toFormat === 'json' ? 'json' : toFormat === 'yaml' ? 'yaml' : 'xml';
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleSwap = () => {
    const temp = fromFormat;
    setFromFormat(toFormat);
    setToFormat(temp);
    
    if (output) {
      setInput(output);
      setOutput('');
      setStats(null);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setIsCopied(false);
    setStats(null);
  };

  const loadExample = (format: string) => {
    setFromFormat(format);
    
    const examples: { [key: string]: string } = {
      json: `{
  "user": {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "active": true,
    "roles": ["admin", "user"],
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "zip": "10001"
    }
  }
}`,
      yaml: `user:
  name: John Doe
  age: 30
  email: john@example.com
  active: true
  roles:
    - admin
    - user
  address:
    street: 123 Main St
    city: New York
    zip: "10001"`,
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<user>
  <name>John Doe</name>
  <age>30</age>
  <email>john@example.com</email>
  <active>true</active>
  <roles>admin</roles>
  <roles>user</roles>
  <address>
    <street>123 Main St</street>
    <city>New York</city>
    <zip>10001</zip>
  </address>
</user>`,
    };

    setInput(examples[format]);
    setOutput('');
    setStats(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">YAML Converter</h2>
      </header>

      {/* Format Selector */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From:</label>
            <select
              value={fromFormat}
              onChange={(e) => setFromFormat(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            >
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="xml">XML</option>
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="mt-6 p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
            title="Swap formats"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <div className="flex flex-col w-full md:w-auto">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To:</label>
            <select
              value={toFormat}
              onChange={(e) => setToFormat(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            >
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="xml">XML</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <button
            onClick={() => loadExample('json')}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            JSON Example
          </button>
          <button
            onClick={() => loadExample('yaml')}
            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            YAML Example
          </button>
          <button
            onClick={() => loadExample('xml')}
            className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
          >
            XML Example
          </button>
        </div>
      </div>

      {/* Stats Display */}
      {stats && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">From</div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">{stats.from}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">To</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.to}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Input Size</div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">{stats.inputSize}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Output Size</div>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats.outputSize}</div>
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
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
            Input ({fromFormat.toUpperCase()})
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${fromFormat.toUpperCase()} here...`}
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Output Area */}
        <div className="flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">
              Output ({toFormat.toUpperCase()})
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!output}
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
                disabled={!output}
                className="flex items-center px-4 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={`Converted ${toFormat.toUpperCase()} will appear here...`}
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={handleConvert}
          disabled={isConverting}
          className="flex items-center px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-150 transform hover:scale-[1.02] disabled:opacity-50"
        >
          {isConverting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Converting...
            </>
          ) : (
            <>
              <ArrowRight className="w-5 h-5 mr-2" />
              Convert
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150"
        >
          Clear
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Convert between JSON, YAML, and XML formats with bidirectional support.
      </p>

      {/* API Documentation Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          API Access
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Use this tool programmatically via our REST API. Perfect for configuration file conversion, data transformation, and format migration.
        </p>

        {/* API Endpoint */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Endpoint</h4>
          <code className="text-sm text-indigo-600 dark:text-indigo-400 break-all">
            POST https://toolteeno.com/api/yaml-converter
          </code>
        </div>

        {/* Request Body */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Request Body</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "input": "string",  // Required: Input data in source format
  "from": "string",   // Required: Source format (json|yaml|xml)
  "to": "string"      // Required: Target format (json|yaml|xml)
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
  "output": "name: John Doe\\nage: 30\\n",
  "from": "JSON",
  "to": "YAML",
  "inputSize": 32,
  "outputSize": 24
}`}</code>
            </pre>
          </div>
        </div>

        {/* cURL Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">cURL Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`curl -X POST https://toolteeno.com/api/yaml-converter \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "{\\"name\\":\\"John\\",\\"age\\":30}",
    "from": "json",
    "to": "yaml"
  }'`}</code>
            </pre>
          </div>
        </div>

        {/* JavaScript Example */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">JavaScript/Fetch Example</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`const jsonData = { name: "John", age: 30 };

const response = await fetch('https://toolteeno.com/api/yaml-converter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: JSON.stringify(jsonData),
    from: 'json',
    to: 'yaml'
  })
});

const data = await response.json();
console.log('Converted YAML:', data.output);
console.log(\`Size: \${data.inputSize} → \${data.outputSize}\`);`}</code>
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

data = {"name": "John", "age": 30}

response = requests.post(
    'https://toolteeno.com/api/yaml-converter',
    json={
        'input': json.dumps(data),
        'from': 'json',
        'to': 'yaml'
    }
)

result = response.json()
print(f"Converted from {result['from']} to {result['to']}")
print(result['output'])`}</code>
            </pre>
          </div>
        </div>

        {/* Supported Conversions */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Supported Conversions</h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">JSON → YAML</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">YAML → JSON</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">JSON → XML</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">XML → JSON</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">YAML → XML</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">XML → YAML</span>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
            Common Use Cases
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li><strong>Configuration Files:</strong> Convert between Kubernetes YAML, JSON configs, and XML</li>
            <li><strong>API Transformation:</strong> Transform data between different API formats</li>
            <li><strong>Data Migration:</strong> Migrate data from one format to another</li>
            <li><strong>CI/CD Pipelines:</strong> Convert pipeline configurations between formats</li>
            <li><strong>Documentation:</strong> Generate documentation in different formats</li>
            <li><strong>OpenAPI/Swagger:</strong> Convert API specs between YAML and JSON</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            This API is completely free to use with no rate limits or authentication required!
          </p>
        </div>
      </div>
    </div>
  );
}
