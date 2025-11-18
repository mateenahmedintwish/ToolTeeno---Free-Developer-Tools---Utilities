"use client";

import React, { useState } from 'react';
import { Link as LinkIcon, ChevronRight, ChevronLeft, Copy, Check, XCircle } from 'lucide-react';

export default function UrlEncoderDecoderTool() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleEncode = () => {
    setError(null);
    if (!inputText.trim()) {
      setOutputText('');
      setError("Input cannot be empty.");
      return;
    }
    
    try {
      // Use encodeURIComponent to convert string to a URL-safe format
      const encodedText = encodeURIComponent(inputText);
      setOutputText(encodedText);
    } catch (e) {
      setError("Encoding failed. Ensure the input is valid text.");
    }
  };

  const handleDecode = () => {
    setError(null);
    if (!inputText.trim()) {
      setOutputText('');
      setError("Input cannot be empty.");
      return;
    }
    
    try {
      // Use decodeURIComponent to convert URL-safe format back to normal string
      const decodedText = decodeURIComponent(inputText);
      setOutputText(decodedText);
    } catch (e) {
      setError("Decoding failed. The input string may not be a valid URL-encoded value (e.g., missing '%').");
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
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <LinkIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">URL Encoder / Decoder</h2>
      </header>
      
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
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Input Text</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Enter text to encode or decode...'
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
        
        {/* Output Area */}
        <div className="flex flex-col h-96">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">Output</label>
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
            placeholder='Encoded or decoded text will appear here...'
            className="grow p-4 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm shadow-inner resize-none"
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={handleEncode}
          className="flex items-center px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-150 transform hover:scale-[1.02]"
        >
          Encode URL <ChevronRight className="w-5 h-5 ml-2" />
        </button>
        <button
          onClick={handleDecode}
          className="flex items-center px-6 py-3 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 dark:hover:bg-green-600 transition duration-150 transform hover:scale-[1.02]"
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Decode URL 
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150"
        >
          Clear
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        Use Encode to prepare text for a URL (e.g., spaces to `%20`). Use Decode to read an encoded URL.
      </p>
    </div>
  );
}