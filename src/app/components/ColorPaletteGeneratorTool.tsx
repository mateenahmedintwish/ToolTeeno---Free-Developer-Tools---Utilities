// app/components/ColorPaletteGeneratorTool.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Palette, Copy, Check, FileText, AlertCircle, Sparkles } from 'lucide-react';

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

interface PaletteResponse {
  success: boolean;
  scheme?: string;
  baseColor?: ColorInfo;
  palette?: ColorInfo[];
  error?: string;
}

const COLOR_SCHEMES = [
  { id: 'monochromatic', name: 'Monochromatic', description: 'Variations in lightness of a single hue' },
  { id: 'analogous', name: 'Analogous', description: 'Adjacent hues on the color wheel' },
  { id: 'complementary', name: 'Complementary', description: 'Opposite hues on the color wheel' },
  { id: 'split-complementary', name: 'Split Complementary', description: 'Base color + two adjacent to complement' },
  { id: 'triadic', name: 'Triadic', description: 'Three colors evenly spaced (120°)' },
  { id: 'tetradic', name: 'Tetradic', description: 'Four colors evenly spaced (90°)' },
  { id: 'double-complementary', name: 'Double Complementary', description: 'Two pairs of complementary colors' },
];

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

export default function ColorPaletteGeneratorTool() {
  const [inputColor, setInputColor] = useState('#3B82F6');
  const [selectedScheme, setSelectedScheme] = useState('complementary');
  const [colorCount, setColorCount] = useState(5);
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [baseColor, setBaseColor] = useState<ColorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Auto-generate palette when inputs change
  useEffect(() => {
    if (inputColor) {
      const debounceTimer = setTimeout(() => {
        generatePalette();
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [inputColor, selectedScheme, colorCount]);

  const generatePalette = async () => {
    if (!inputColor) {
      setError('Please enter a color');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/color-palette-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: inputColor,
          scheme: selectedScheme,
          count: colorCount,
        }),
      });

      const data: PaletteResponse = await response.json();

      if (data.success && data.palette) {
        setPalette(data.palette);
        setBaseColor(data.baseColor || null);
      } else {
        setError(data.error || 'Failed to generate palette');
      }
    } catch (err) {
      setError('Failed to generate palette. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, colorHex: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedColor(colorHex);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /**
   * Generate ASE (Adobe Swatch Exchange) binary format
   */
  const generateASE = (): ArrayBuffer => {
    const colors = palette;
    
    // ASE file structure:
    // Header: "ASEF" (4 bytes)
    // Version: Major (2 bytes), Minor (2 bytes) - typically 1.0
    // Number of blocks: (4 bytes)
    // Color blocks...

    // Calculate total size
    const headerSize = 4 + 2 + 2 + 4; // "ASEF" + version + block count
    const blockSize = 2 + 4 + 2 + (4 * 3) + 2; // type + length + name length + RGB (3 floats) + color mode
    const totalSize = headerSize + (blockSize * colors.length);

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    let offset = 0;

    // Write header "ASEF"
    view.setUint8(offset++, 0x41); // 'A'
    view.setUint8(offset++, 0x53); // 'S'
    view.setUint8(offset++, 0x45); // 'E'
    view.setUint8(offset++, 0x46); // 'F'

    // Write version (1.0)
    view.setUint16(offset, 1, false); // Major version (big-endian)
    offset += 2;
    view.setUint16(offset, 0, false); // Minor version (big-endian)
    offset += 2;

    // Write number of blocks
    view.setUint32(offset, colors.length, false); // Big-endian
    offset += 4;

    // Write each color block
    colors.forEach((color, index) => {
      // Block type: 0x0001 for color entry
      view.setUint16(offset, 0x0001, false);
      offset += 2;

      // Block length (will calculate)
      const blockLengthOffset = offset;
      offset += 4; // Skip for now, will fill in later

      // Color name length (UTF-16 characters + null terminator)
      const colorName = `Color ${index + 1}`;
      const nameLength = colorName.length + 1; // +1 for null terminator
      view.setUint16(offset, nameLength, false);
      offset += 2;

      // Write color name in UTF-16 big-endian
      for (let i = 0; i < colorName.length; i++) {
        view.setUint16(offset, colorName.charCodeAt(i), false);
        offset += 2;
      }
      // Null terminator
      view.setUint16(offset, 0, false);
      offset += 2;

      // Color mode: "RGB " (4 bytes)
      view.setUint8(offset++, 0x52); // 'R'
      view.setUint8(offset++, 0x47); // 'G'
      view.setUint8(offset++, 0x42); // 'B'
      view.setUint8(offset++, 0x20); // ' '

      // RGB values as 32-bit floats (0.0 to 1.0)
      view.setFloat32(offset, color.rgb.r / 255, false);
      offset += 4;
      view.setFloat32(offset, color.rgb.g / 255, false);
      offset += 4;
      view.setFloat32(offset, color.rgb.b / 255, false);
      offset += 4;

      // Color type: 0x0002 for global (process) color
      view.setUint16(offset, 0x0002, false);
      offset += 2;

      // Go back and fill in block length
      const blockLength = (nameLength * 2) + 2 + 4 + (4 * 3) + 2;
      view.setUint32(blockLengthOffset, blockLength, false);
    });

    return buffer;
  };

  const exportPalette = (format: 'css' | 'json' | 'scss' | 'ase') => {
    if (format === 'ase') {
      // Generate ASE binary format
      const aseBuffer = generateASE();
      const blob = new Blob([aseBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `palette-${selectedScheme}.ase`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    let content = '';

    switch (format) {
      case 'css':
        content = ':root {\n' + palette.map((color, index) => 
          `  --color-${index + 1}: ${color.hex};`
        ).join('\n') + '\n}';
        break;
      case 'scss':
        content = palette.map((color, index) => 
          `$color-${index + 1}: ${color.hex};`
        ).join('\n');
        break;
      case 'json':
        content = JSON.stringify(
          palette.map((color, index) => ({
            name: `color-${index + 1}`,
            ...color,
          })),
          null,
          2
        );
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette-${selectedScheme}.${format === 'json' ? 'json' : format === 'scss' ? 'scss' : 'css'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadRandomColor = () => {
    const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    setInputColor(randomColor);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-600 dark:border-indigo-400 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-4">
            <Palette className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Color Palette Generator</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Generate harmonious color palettes from a single color</p>
          </div>
        </div>
        <button
          onClick={loadRandomColor}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Random Color
        </button>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Color Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Base Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              placeholder="#3B82F6"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white uppercase font-mono"
              maxLength={7}
            />
          </div>
        </div>

        {/* Scheme Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Color Scheme
          </label>
          <select
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            {COLOR_SCHEMES.map((scheme) => (
              <option key={scheme.id} value={scheme.id}>
                {scheme.name}
              </option>
            ))}
          </select>
        </div>

        {/* Count Selection (for applicable schemes) */}
        {(selectedScheme === 'monochromatic' || selectedScheme === 'analogous') && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Number of Colors
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={colorCount}
              onChange={(e) => setColorCount(parseInt(e.target.value) || 5)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Scheme Description */}
      <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          <strong>{COLOR_SCHEMES.find(s => s.id === selectedScheme)?.name}:</strong>{' '}
          {COLOR_SCHEMES.find(s => s.id === selectedScheme)?.description}
        </p>
      </div>

      {/* Preset Colors */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Quick Start Colors
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setInputColor(color)}
              className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                inputColor.toUpperCase() === color.toUpperCase()
                  ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-300 dark:ring-indigo-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Generating palette...</p>
        </div>
      )}

      {/* Generated Palette */}
      {palette.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Generated Palette</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => exportPalette('css')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Export CSS
              </button>
              <button
                onClick={() => exportPalette('scss')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Export SCSS
              </button>
              <button
                onClick={() => exportPalette('json')}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Export JSON
              </button>
              <button
                onClick={() => exportPalette('ase')}
                className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200 font-medium"
                title="Adobe Swatch Exchange format"
              >
                Export ASE
              </button>
            </div>
          </div>

          {/* Color Swatches */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {palette.map((color, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                {/* Color Swatch */}
                <div
                  className="h-32 cursor-pointer"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex, color.hex)}
                  title="Click to copy HEX"
                />

                {/* Color Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-gray-800 dark:text-white">
                      {color.hex.toUpperCase()}
                    </span>
                    <button
                      onClick={() => copyToClipboard(color.hex, color.hex)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                    >
                      {copiedColor === color.hex ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span className="font-semibold">RGB:</span>
                      <span className="font-mono">
                        {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">HSL:</span>
                      <span className="font-mono">
                        {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                      </span>
                    </div>
                  </div>

                  {/* Copy Format Buttons */}
                  <div className="flex gap-1 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, `${color.hex}-rgb`)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                      title="Copy RGB"
                    >
                      {copiedColor === `${color.hex}-rgb` ? '✓' : 'RGB'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, `${color.hex}-hsl`)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                      title="Copy HSL"
                    >
                      {copiedColor === `${color.hex}-hsl` ? '✓' : 'HSL'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Documentation */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          API Documentation
        </h3>
        
        <div className="space-y-4">
          {/* cURL Example */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">cURL Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST https://toolteeno.com/api/color-palette-generator \\
  -H "Content-Type: application/json" \\
  -d '{
    "color": "#3B82F6",
    "scheme": "complementary" // or "monochromatic", "analogous", "triadic", "split-complementary", "tetradic", "double-complementary", etc.
    // "count": 5 // optional, for monochromatic/analogous
  }'`}
            </pre>
          </div>

          {/* JavaScript Example */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">JavaScript Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`fetch('https://toolteeno.com/api/color-palette-generator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    color: '#3B82F6',
    scheme: 'triadic', // or "complementary", "monochromatic", etc.
    count: 5  // for monochromatic/analogous
  })
})
.then(res => res.json())
.then(data => console.log(data));`}
            </pre>
          </div>

          {/* Python Example */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Python Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import requests

response = requests.post(
    'https://toolteeno.com/api/color-palette-generator',
    json={
        'color': '#3B82F6',
        'scheme': 'complementary'
    }
)
print(response.json())`}
            </pre>
          </div>

          {/* Response Example */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Response Example</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "success": true,
  "scheme": "complementary",
  "baseColor": {
    "hex": "#3b82f6",
    "rgb": { "r": 59, "g": 130, "b": 246 },
    "hsl": { "h": 217, "s": 91, "l": 60 }
  },
  "palette": [
    {
      "hex": "#3b82f6",
      "rgb": { "r": 59, "g": 130, "b": 246 },
      "hsl": { "h": 217, "s": 91, "l": 60 }
    },
    {
      "hex": "#f6ad3b",
      "rgb": { "r": 246, "g": 173, "b": 59 },
      "hsl": { "h": 37, "s": 91, "l": 60 }
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </div>

    </div>
  );
}
