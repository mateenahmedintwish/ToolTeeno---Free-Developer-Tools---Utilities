"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Zap, Copy, Check, RefreshCw } from 'lucide-react';

// Define character sets
const CHARS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_+=[]{}|;:,.<>?/~',
};

// --- Password Strength Calculation (Basic) ---
const calculateStrength = (password: string): { text: string, color: string } => {
  const length = password.length;
  let score = 0;

  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()-_+=]/.test(password)) score += 1;

  if (score < 3) return { text: 'Weak', color: 'bg-red-500' };
  if (score < 5) return { text: 'Medium', color: 'bg-yellow-500' };
  return { text: 'Strong', color: 'bg-green-500' };
};


export default function PasswordGeneratorTool() {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(16);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  const strength = calculateStrength(password);

  // Function to generate the password
  const generatePassword = useCallback(() => {
    setError(null);
    
    // 1. Build the character pool and required characters
    let charPool = '';
    let requiredChars = [];

    if (includeLower) {
      charPool += CHARS.lowercase;
      requiredChars.push(CHARS.lowercase[Math.floor(Math.random() * CHARS.lowercase.length)]);
    }
    if (includeUpper) {
      charPool += CHARS.uppercase;
      requiredChars.push(CHARS.uppercase[Math.floor(Math.random() * CHARS.uppercase.length)]);
    }
    if (includeNumbers) {
      charPool += CHARS.numbers;
      requiredChars.push(CHARS.numbers[Math.floor(Math.random() * CHARS.numbers.length)]);
    }
    if (includeSymbols) {
      charPool += CHARS.symbols;
      requiredChars.push(CHARS.symbols[Math.floor(Math.random() * CHARS.symbols.length)]);
    }

    if (charPool.length === 0) {
      setError("Please select at least one character type.");
      setPassword('');
      return;
    }

    let generatedPassword = '';
    
    // 2. Fill the remaining length with random characters from the full pool
    const remainingLength = length - requiredChars.length;
    for (let i = 0; i < remainingLength; i++) {
      generatedPassword += charPool[Math.floor(Math.random() * charPool.length)];
    }

    // 3. Combine required characters and the rest
    generatedPassword = requiredChars.join('') + generatedPassword;

    // 4. Shuffle the password to ensure required characters aren't always at the start
    const shuffledPassword = generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(shuffledPassword);

  }, [length, includeLower, includeUpper, includeNumbers, includeSymbols]);

  // Generate an initial password on load and whenever criteria changes
  useEffect(() => {
    generatePassword();
  }, [generatePassword]); 

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const checkboxClass = "form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Secure Password Generator</h2>
      </header>

      {/* Output Display */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-inner">
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Generated Password</label>
        <div className="flex items-center justify-between">
          <input 
            type="text" 
            readOnly
            value={password}
            className="grow p-2 text-xl font-mono text-gray-800 dark:text-white bg-transparent truncate"
            aria-label="Generated password"
          />
          <button
            onClick={handleCopy}
            disabled={!password}
            className={`flex items-center px-4 py-2 ml-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              isCopied 
                ? 'bg-green-500 text-white' 
                : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50'
            }`}
          >
            {isCopied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        {/* Strength Indicator */}
        <div className="flex items-center mt-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Strength:</span>
          <div className="grow h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
            <div 
              className={`h-full transition-all duration-500 ${strength.color}`}
              style={{ width: `${Math.min(100, (strength.text === 'Strong' ? 100 : strength.text === 'Medium' ? 66 : 33))}%` }}
            ></div>
          </div>
          <span className={`ml-2 text-sm font-bold w-16 text-right ${strength.color.replace('bg-', 'text-')}`}>{strength.text}</span>
        </div>
      </div>
      
      {/* Configuration */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Settings</h3>
        
        {/* Password Length Slider */}
        <div className="mb-6">
          <label htmlFor="length" className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
            Password Length: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{length}</span>
          </label>
          <input
            id="length"
            type="range"
            min="4"
            max="32"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg"
          />
        </div>

        {/* Character Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <input 
              id="includeLower" 
              type="checkbox" 
              checked={includeLower} 
              onChange={(e) => setIncludeLower(e.target.checked)}
              className={checkboxClass}
            />
            <label htmlFor="includeLower" className="ml-2 text-base font-medium text-gray-700 dark:text-gray-200">Lowercase (a-z)</label>
          </div>
          <div className="flex items-center">
            <input 
              id="includeUpper" 
              type="checkbox" 
              checked={includeUpper} 
              onChange={(e) => setIncludeUpper(e.target.checked)}
              className={checkboxClass}
            />
            <label htmlFor="includeUpper" className="ml-2 text-base font-medium text-gray-700 dark:text-gray-200">Uppercase (A-Z)</label>
          </div>
          <div className="flex items-center">
            <input 
              id="includeNumbers" 
              type="checkbox" 
              checked={includeNumbers} 
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className={checkboxClass}
            />
            <label htmlFor="includeNumbers" className="ml-2 text-base font-medium text-gray-700 dark:text-gray-200">Numbers (0-9)</label>
          </div>
          <div className="flex items-center">
            <input 
              id="includeSymbols" 
              type="checkbox" 
              checked={includeSymbols} 
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className={checkboxClass}
            />
            <label htmlFor="includeSymbols" className="ml-2 text-base font-medium text-gray-700 dark:text-gray-200">Symbols (!@#$)</label>
          </div>
        </div>
      </div>
      
      {/* Generate Button and Error */}
      <div className="flex justify-center flex-col items-center">
        {error && (
          <div className="flex items-center p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg w-full">
            <Zap className="w-5 h-5 mr-2" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        <button
          onClick={generatePassword}
          className="flex items-center px-8 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-lg shadow-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-150 transform hover:scale-[1.03]"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Generate New Password
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        A strong password should be long and combine different character types.
      </p>
    </div>
  );
}