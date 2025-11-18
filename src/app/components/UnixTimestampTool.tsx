"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowRight, Copy, Check, RefreshCw, Globe, XCircle } from 'lucide-react';

interface ConversionOutput {
  timestamp: number;
  milliseconds: number;
  iso: string;
  utc: string;
  locale: string;
  date: string;
  time: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: string;
  timezone: string;
  relative: string;
}

interface ConversionResult {
  success: boolean;
  mode: 'toTimestamp' | 'toDate';
  input: string;
  output: ConversionOutput;
  error?: string;
}

export default function UnixTimestampTool() {
  const [mode, setMode] = useState<'toTimestamp' | 'toDate'>('toTimestamp');
  const [input, setInput] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [format, setFormat] = useState<'seconds' | 'milliseconds'>('seconds');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const commonTimezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Denver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
  ];

  const handleConvert = async () => {
    if (!input.trim()) {
      setError('Please enter a value to convert');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/unix-timestamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          input,
          timezone,
          format,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Conversion failed');
      }
    } catch (err) {
      setError('An error occurred during conversion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapMode = () => {
    setMode(mode === 'toTimestamp' ? 'toDate' : 'toTimestamp');
    setInput('');
    setResult(null);
    setError('');
  };

  const loadCurrentTimestamp = () => {
    const now = Date.now();
    setMode('toDate');
    setInput(String(Math.floor(now / 1000)));
    setFormat('seconds');
  };

  const loadExampleDate = () => {
    setMode('toTimestamp');
    setInput(new Date().toISOString());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Unix Timestamp Converter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert between human-readable date/time and Unix timestamps
        </p>
      </div>

      {/* Current Time Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Unix Timestamp</p>
            <p className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {Math.floor(currentTime / 1000)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Date/Time (UTC)</p>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {new Date(currentTime).toISOString()}
            </p>
          </div>
          <button
            onClick={loadCurrentTimestamp}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm font-medium"
          >
            Use Current Time
          </button>
        </div>
      </div>

      {/* Conversion Mode Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => {
                setMode('toTimestamp');
                setInput('');
                setResult(null);
                setError('');
              }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                mode === 'toTimestamp'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Date → Timestamp
            </button>
            <button
              onClick={() => {
                setMode('toDate');
                setInput('');
                setResult(null);
                setError('');
              }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                mode === 'toDate'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Timestamp → Date
            </button>
          </div>
          <button
            onClick={handleSwapMode}
            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="Swap conversion mode"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {mode === 'toTimestamp' ? 'Enter Date/Time' : 'Enter Unix Timestamp'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'toTimestamp'
                ? 'e.g., 2024-01-15T10:30:00Z or January 15, 2024'
                : 'e.g., 1705315800'
            }
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleConvert()}
          />
          <button
            onClick={mode === 'toTimestamp' ? loadExampleDate : loadCurrentTimestamp}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Example
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timezone Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
          >
            {commonTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {/* Format Selector (for toDate mode) */}
        {mode === 'toDate' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Timestamp Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'seconds' | 'milliseconds')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
            >
              <option value="seconds">Seconds (default)</option>
              <option value="milliseconds">Milliseconds</option>
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleConvert}
          disabled={loading || !input.trim()}
          className="flex-1 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <ArrowRight className="w-5 h-5" />
              Convert
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

      {/* Results Display */}
      {result && result.success && (
        <div className="space-y-6">
          {/* Primary Result */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {mode === 'toTimestamp' ? 'Unix Timestamp' : 'Date & Time'}
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    mode === 'toTimestamp'
                      ? String(result.output.timestamp)
                      : result.output.iso
                  )
                }
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
              {mode === 'toTimestamp' ? result.output.timestamp : result.output.iso}
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {result.output.relative}
            </p>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* All Formats */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                All Formats
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Timestamp (seconds):</span>
                  <p className="font-mono text-gray-900 dark:text-white">{result.output.timestamp}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Timestamp (milliseconds):</span>
                  <p className="font-mono text-gray-900 dark:text-white">{result.output.milliseconds}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">ISO 8601:</span>
                  <p className="font-mono text-gray-900 dark:text-white break-all">{result.output.iso}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">UTC:</span>
                  <p className="font-mono text-gray-900 dark:text-white break-all">{result.output.utc}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Locale ({result.output.timezone}):</span>
                  <p className="font-mono text-gray-900 dark:text-white">{result.output.locale}</p>
                </div>
              </div>
            </div>

            {/* Components */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Date Components
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Year:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{result.output.year}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Month:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{result.output.month}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Day:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{result.output.day}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Day of Week:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{result.output.dayOfWeek}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Hour:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{result.output.hour}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Minute:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{result.output.minute}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Second:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{result.output.second}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-xs">{result.output.timezone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => copyToClipboard(String(result.output.timestamp))}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Copy Timestamp
            </button>
            <button
              onClick={() => copyToClipboard(result.output.iso)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Copy ISO
            </button>
            <button
              onClick={() => copyToClipboard(result.output.date)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Copy Date
            </button>
            <button
              onClick={() => copyToClipboard(result.output.time)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Copy Time
            </button>
          </div>
        </div>
      )}

      {/* API Documentation */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">API Usage</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Integrate Unix timestamp conversion into your applications with our REST API.
        </p>

        <div className="space-y-6">
          {/* Endpoint */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Endpoint</h3>
            <code className="block p-4 bg-gray-900 dark:bg-gray-950 text-green-400 rounded-lg overflow-x-auto">
              POST /api/unix-timestamp
            </code>
          </div>

          {/* Request */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Request Body</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`{
  "mode": "toTimestamp",           // or "toDate"
  "input": "2024-01-15T10:30:00Z", // date string or timestamp
  "timezone": "America/New_York",  // optional, default: "UTC"
  "format": "seconds"              // optional, "seconds" or "milliseconds"
}`}
            </pre>
          </div>

          {/* cURL Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">cURL Example</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`curl -X POST https://toolteeno.com/api/unix-timestamp \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "toTimestamp",
    "input": "2024-01-15T10:30:00Z",
    "timezone": "UTC"
  }'`}
            </pre>
          </div>

          {/* JavaScript Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">JavaScript Example</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`const response = await fetch('/api/unix-timestamp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'toDate',
    input: 1705315800,
    timezone: 'America/New_York',
    format: 'seconds'
  })
});

const data = await response.json();
console.log(data.output.iso); // "2024-01-15T10:30:00.000Z"`}
            </pre>
          </div>

          {/* Python Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Python Example</h3>
            <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 rounded-lg overflow-x-auto text-sm">
{`import requests

response = requests.post('https://toolteeno.com/api/unix-timestamp', json={
    'mode': 'toTimestamp',
    'input': '2024-01-15T10:30:00Z',
    'timezone': 'UTC'
})

data = response.json()
print(data['output']['timestamp'])  # 1705315800`}
            </pre>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Common Use Cases</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Convert API timestamps to readable dates in web applications</li>
            <li>Store dates as Unix timestamps in databases for efficient querying</li>
            <li>Synchronize time across distributed systems and different timezones</li>
            <li>Schedule tasks and cron jobs with precise Unix timestamps</li>
            <li>Debug timestamp-related issues in logs and error reports</li>
            <li>Calculate time differences and durations in applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
