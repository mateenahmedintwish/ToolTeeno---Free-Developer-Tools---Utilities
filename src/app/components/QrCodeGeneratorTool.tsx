"use client";

import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'; // QR code generation library
import { saveAs } from 'file-saver'; // For saving files
import { QrCode, Download, Copy, Check, XCircle, Settings } from 'lucide-react';

export default function QrCodeGeneratorTool() {
  const [text, setText] = useState<string>('https://toolteeno.com'); // Default URL
  const [size, setSize] = useState<number>(256); // QR code size
  const [fgColor, setFgColor] = useState<string>('#000000'); // Foreground color (QR code lines)
  const [bgColor, setBgColor] = useState<string>('#ffffff'); // Background color
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M'); // Error correction level
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const qrCodeRef = useRef<HTMLDivElement>(null); // Reference to the QR code container
  const svgRef = useRef<HTMLDivElement>(null); // Hidden reference for SVG generation

  useEffect(() => {
    // Basic validation for QR code text length
    if (text.length > 2000) { // QR codes have a max capacity
      setError("Text is too long for a QR code. Max ~2000 characters.");
    } else {
      setError(null);
    }
  }, [text]);

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const downloadQrCode = (format: 'png' | 'jpeg' | 'svg') => {
    if (!text) {
      setError("No QR code to download or input text is empty.");
      return;
    }

    try {
      if (format === 'svg') {
        if (!svgRef.current) {
          throw new Error("SVG reference not found.");
        }
        const svgElement = svgRef.current.querySelector('svg');
        if (!svgElement) {
          throw new Error("SVG element not found.");
        }
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);
        // Add DOCTYPE and xmlns for better SVG compatibility
        svgString = `<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n${svgString}`;
        
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        saveAs(blob, `qrcode.${format}`);

      } else { // PNG or JPEG
        if (!qrCodeRef.current) {
          throw new Error("Canvas reference not found.");
        }
        const canvas = qrCodeRef.current.querySelector('canvas');
        if (!canvas) {
          throw new Error("Canvas element not found for PNG/JPEG export.");
        }

        const dataURL = canvas.toDataURL(`image/${format}`, 1.0); // 1.0 for max quality
        const blob = dataURLtoBlob(dataURL);
        saveAs(blob, `qrcode.${format}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(`Download failed: ${e.message}`);
      } else {
        setError("An unknown error occurred during download.");
      }
    }
  };

  // Utility to convert data URL to Blob (for file-saver)
  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };


  const commonInputClass = "p-3 border rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors duration-200 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const optionButtonClass = "px-4 py-2 rounded-md font-medium transition-colors duration-200 text-sm";
  const selectedOptionButtonClass = "bg-indigo-600 text-white hover:bg-indigo-700";
  const unselectedOptionButtonClass = "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500";


  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 text-gray-900 dark:text-gray-100">
      <header className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        <QrCode className="w-8 h-8 text-indigo-600" />
        <h2 className="text-3xl font-bold">QR Code Generator</h2>
      </header>

      {/* Error Display */}
      {error && (
        <div className="flex items-center p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
          <XCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Panel: Input & Settings */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <label htmlFor="qr-text" className={labelClass}>
              Text / URL to Encode
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="qr-text"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g., Your Website URL or any text"
                className={`${commonInputClass} flex-grow`}
              />
              <button
                onClick={handleCopy}
                disabled={!text}
                className={`p-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isCopied
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-700 dark:text-indigo-100 dark:hover:bg-indigo-600 disabled:opacity-50'
                }`}
                aria-label="Copy input text"
              >
                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Settings className="w-5 h-5 mr-2" />
            QR Code Settings
          </h3>

          <div>
            <label htmlFor="qr-size" className={labelClass}>
              Size (pixels)
            </label>
            <input
              id="qr-size"
              type="range"
              min="100"
              max="512"
              step="16"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="block text-center text-indigo-600 font-medium mt-1">{size}px</span>
          </div>

          <div>
            <label htmlFor="fg-color" className={labelClass}>
              Foreground Color
            </label>
            <input
              id="fg-color"
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className={`${commonInputClass} h-10 w-full p-1 cursor-pointer`}
            />
          </div>

          <div>
            <label htmlFor="bg-color" className={labelClass}>
              Background Color
            </label>
            <input
              id="bg-color"
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className={`${commonInputClass} h-10 w-full p-1 cursor-pointer`}
            />
          </div>

          <div>
            <label className={labelClass}>Error Correction Level</label>
            <div className="flex space-x-2">
              {['L', 'M', 'Q', 'H'].map((level) => (
                <button
                  key={level}
                  onClick={() => setErrorCorrection(level as 'L' | 'M' | 'Q' | 'H')}
                  className={`${optionButtonClass} ${
                    errorCorrection === level ? selectedOptionButtonClass : unselectedOptionButtonClass
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Higher levels (Q, H) can scan even if damaged, but result in a denser QR code.
            </p>
          </div>
        </div>

        {/* Right Panel: QR Code Display & Download */}
        <div className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner min-h-[400px]">
          {text && !error ? (
            <div ref={qrCodeRef} className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
              <QRCodeCanvas
                value={text}
                size={size}
                level={errorCorrection}
                bgColor={bgColor}
                fgColor={fgColor}
                includeMargin={true}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              {error ? (
                <p className="text-red-500 font-medium">{error}</p>
              ) : (
                <>
                  <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">Enter text or a URL to generate your QR code.</p>
                </>
              )}
            </div>
          )}

          {text && !error && (
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-600 w-full flex flex-col items-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Download QR Code
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadQrCode('png')}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.02] flex items-center"
                >
                  Download PNG
                </button>
                <button
                  onClick={() => downloadQrCode('jpeg')}
                  className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-150 transform hover:scale-[1.02] flex items-center"
                >
                  Download JPG
                </button>
                <button
                  onClick={() => downloadQrCode('svg')}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 transform hover:scale-[1.02] flex items-center"
                >
                  Download SVG
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                SVG is vector-based and scales without quality loss.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center border-t pt-4 border-gray-200 dark:border-gray-700">
        Generate and customize QR codes for URLs, text, Wi-Fi details, and more.
      </p>

      {/* API Documentation */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Use as API
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate QR codes programmatically via our REST API. Perfect for automating QR code generation in your applications!
        </p>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">API Endpoint</h4>
            <code className="block bg-white dark:bg-gray-800 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-sm text-indigo-600 dark:text-indigo-400">
              POST https://toolteeno.com/api/qr-code
            </code>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Request Body</h4>
            <pre className="bg-white dark:bg-gray-800 px-4 py-3 rounded border border-gray-300 dark:border-gray-600 text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "text": "https://toolteeno.com",
  "size": 512,
  "bgColor": "#ffffff",
  "fgColor": "#4f46e5",
  "level": "M"
}`}</code>
            </pre>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <p>• <strong>text</strong>: Content to encode (required, max 2000 chars)</p>
              <p>• <strong>size</strong>: Image size in pixels (optional, 128-1024, default: 256)</p>
              <p>• <strong>bgColor</strong>: Background hex color (optional, default: #ffffff)</p>
              <p>• <strong>fgColor</strong>: QR code hex color (optional, default: #000000)</p>
              <p>• <strong>level</strong>: Error correction L/M/Q/H (optional, default: M)</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Example Response</h4>
            <pre className="bg-white dark:bg-gray-800 px-4 py-3 rounded border border-gray-300 dark:border-gray-600 text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`{
  "success": true,
  "config": {
    "text": "https://toolteeno.com",
    "size": 512,
    "bgColor": "#ffffff",
    "fgColor": "#4f46e5",
    "level": "M"
  },
  "apiImageUrl": "https://api.qrserver.com/v1/..."
}`}</code>
            </pre>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">cURL Example</h4>
            <pre className="bg-white dark:bg-gray-800 px-4 py-3 rounded border border-gray-300 dark:border-gray-600 text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`curl -X POST https://toolteeno.com/api/qr-code \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "https://toolteeno.com",
    "size": 512,
    "fgColor": "#4f46e5"
  }'`}</code>
            </pre>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">JavaScript Example</h4>
            <pre className="bg-white dark:bg-gray-800 px-4 py-3 rounded border border-gray-300 dark:border-gray-600 text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`fetch('https://toolteeno.com/api/qr-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'https://toolteeno.com',
    size: 512,
    fgColor: '#4f46e5'
  })
})
.then(res => res.json())
.then(data => {
  console.log('QR Code URL:', data.apiImageUrl);
});`}</code>
            </pre>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Python Example</h4>
            <pre className="bg-white dark:bg-gray-800 px-4 py-3 rounded border border-gray-300 dark:border-gray-600 text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">{`import requests

response = requests.post(
    'https://toolteeno.com/api/qr-code',
    json={
        'text': 'https://toolteeno.com',
        'size': 512,
        'fgColor': '#4f46e5'
    }
)
result = response.json()
print(result['apiImageUrl'])`}</code>
            </pre>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>💡 Error Correction Levels:</strong><br />
              • <strong>L</strong> - Low (~7% correction)<br />
              • <strong>M</strong> - Medium (~15% correction) - Recommended<br />
              • <strong>Q</strong> - Quartile (~25% correction)<br />
              • <strong>H</strong> - High (~30% correction) - Best for damaged codes
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>🎯 Free & No Rate Limits:</strong> This API is completely free to use with no authentication required. 
              Use the returned <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">apiImageUrl</code> to get the actual QR code image!
            </p>
          </div>
        </div>
      </div>

      {/* Hidden SVG QR Code for SVG downloads */}
      <div ref={svgRef} className="hidden">
        {text && !error && (
          <QRCodeSVG
            value={text}
            size={size}
            level={errorCorrection}
            bgColor={bgColor}
            fgColor={fgColor}
            includeMargin={true}
          />
        )}
      </div>
    </div>
  );
}