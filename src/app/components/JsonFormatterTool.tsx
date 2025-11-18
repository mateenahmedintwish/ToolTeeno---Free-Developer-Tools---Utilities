"use client";

import React, { useState } from 'react';
import { Code, Zap, Copy, Check, XCircle } from 'lucide-react';

export default function JsonFormatterTool() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [indentation, setIndentation] = useState<number>(2); // Default to 2 spaces

  const handleFormat = () => {
    setError(null);
    setOutputText('');
    
    if (!inputText.trim()) {
      setError("Input cannot be empty.");
      return;
    }

    try {
      // Attempt to parse the input text
      const parsedJson = JSON.parse(inputText);
      
      // Beautify (stringify) the parsed JSON with the selected indentation
      const formattedJson = JSON.stringify(parsedJson, null, indentation);
      
      setOutputText(formattedJson);

    } catch (e) {
      // If parsing fails, display the error message
      if (e instanceof Error) {
        setError(`Invalid JSON: ${e.message}`);
      } else {
        setError("An unknown error occurred during parsing.");
      }
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <Code className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">JSON Formatter</h2>
      </header>
      
      {/* Settings Bar */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
        <div className="flex items-center space-x-4">
          <label htmlFor="indentation" className="text-sm font-medium text-gray-700 dark:text-gray-200">Indentation:</label>
          <select
            id="indentation"
            value={indentation}
            onChange={(e) => setIndentation(parseInt(e.target.value))}
            className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value={0}>Minified (0 Spaces)</option>
          </select>
        </div>

        <button
          onClick={handleFormat}
          className="flex items-center px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-150 transform hover:scale-[1.02]"
        >
          <Zap className="w-5 h-5 mr-2" />
          Format
        </button>
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
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">JSON Input</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Paste your JSON here (e.g., {"key": "value"})'
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
        
        {/* Output Area */}
        <div className="flex flex-col h-96">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">Formatted Output</label>
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
            placeholder='Formatted JSON will appear here...'
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner resize-none"
          />
        </div>
      </div>
      
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Enter raw JSON, select your indentation preference, and click 'Format' to beautify.
      </p>
    </div>
  );
}