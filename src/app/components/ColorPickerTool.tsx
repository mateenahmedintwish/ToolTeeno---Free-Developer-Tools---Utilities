// app/tools/components/ColorPickerTool.tsx

"use client"; // REQUIRED: This enables the use of React Hooks (useState, useEffect)

import React, { useState, useEffect } from 'react';
import { Palette, Copy, Check } from 'lucide-react';

// Utility function to convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function ColorPickerTool() {
  const initialColor = '#4f46e5'; // Default indigo color
  const [color, setColor] = useState<string>(initialColor);
  const [hex, setHex] = useState<string>(initialColor);
  const [rgb, setRgb] = useState<string>('rgb(79, 70, 229)');
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Effect to convert hex input to RGB and update state
  useEffect(() => {
    // Regex to validate and capture hex color (with or without #)
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

    if (hexMatch) {
      const r = parseInt(hexMatch[1], 16);
      const g = parseInt(hexMatch[2], 16);
      const b = parseInt(hexMatch[3], 16);
      setRgb(`rgb(${r}, ${g}, ${b})`);
      setHex(`#${hexMatch[1]}${hexMatch[2]}${hexMatch[3]}`.toLowerCase());
    } else {
      // Handle invalid or partial input if necessary, but keep original if valid
    }
  }, [color]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure the input field always starts with a # for a smoother experience
    const newColor = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
    setColor(newColor);
  };

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(format);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const formatBox = (format: string, value: string) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner flex justify-between items-center w-full">
      <span className="font-mono text-sm text-gray-700 dark:text-gray-200 truncate">{value}</span>
      <button 
        onClick={() => handleCopy(value, format)} 
        className="ml-4 p-2 bg-white dark:bg-gray-600 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-500 transition-colors shadow"
        aria-label={`Copy ${format} value`}
      >
        {isCopied === format ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      <header className="flex items-center space-x-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <Palette className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Color Picker</h2>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side: Input and Swatch */}
        <div className="flex flex-col items-center">
          
          <div className="w-full aspect-square rounded-xl shadow-xl mb-6 border-4 border-gray-200 dark:border-gray-600" style={{ backgroundColor: hex }}>
            {/* Color Swatch */}
          </div>

          <label className="block w-full text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Select Color</label>
          <div className="flex w-full space-x-3">
            <input 
              type="color" 
              value={hex} 
              onChange={handleColorChange} 
              className="w-16 h-12 p-1 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
              aria-label="Color input selector"
            />
            <input 
              type="text" 
              value={hex} 
              onChange={handleColorChange} 
              className="grow p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-mono text-lg uppercase shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={7}
              placeholder="#RRGGBB"
              aria-label="Hex color code input"
            />
          </div>
        </div>
        
        {/* Right Side: Output Formats */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Output Formats</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">HEX</label>
            {formatBox('HEX', hex.toUpperCase())}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">RGB</label>
            {formatBox('RGB', rgb)}
          </div>
          
          {/* A brief explanation/instruction */}
          <p className="pt-4 text-sm text-gray-500 dark:text-gray-400">
            Use the color picker or enter a valid HEX code to see the equivalent RGB value.
          </p>
        </div>
      </div>
    </div>
  );
}