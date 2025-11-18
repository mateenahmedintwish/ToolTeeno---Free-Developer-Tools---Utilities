// app/api/color-palette-generator/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Color Palette Generator API
 * 
 * Generates harmonious color palettes based on a starting color.
 * Supports various color harmony schemes including monochromatic, analogous,
 * complementary, triadic, tetradic, and split-complementary.
 * 
 * @route POST /api/color-palette-generator
 * @route GET /api/color-palette-generator (for documentation)
 */

interface PaletteRequest {
  color: string; // HEX color (e.g., "#FF5733")
  scheme: string; // monochromatic, analogous, complementary, triadic, tetradic, split-complementary
  count?: number; // Number of colors to generate (for applicable schemes)
}

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  name?: string;
}

interface PaletteResponse {
  success: boolean;
  scheme?: string;
  baseColor?: ColorInfo;
  palette?: ColorInfo[];
  error?: string;
}

// Supported color schemes
const SUPPORTED_SCHEMES = [
  'monochromatic',
  'analogous',
  'complementary',
  'triadic',
  'tetradic',
  'split-complementary',
  'double-complementary',
];

/**
 * Convert HEX to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert RGB to HSV
 */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Create ColorInfo object from RGB
 */
function createColorInfo(r: number, g: number, b: number): ColorInfo {
  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  const hsv = rgbToHsv(r, g, b);

  return {
    hex,
    rgb: { r, g, b },
    hsl,
    hsv,
  };
}

/**
 * Generate monochromatic palette (variations in lightness)
 */
function generateMonochromatic(baseColor: ColorInfo, count: number = 5): ColorInfo[] {
  const palette: ColorInfo[] = [baseColor];
  const { h, s } = baseColor.hsl;

  // Generate lighter shades
  for (let i = 1; i < Math.ceil(count / 2); i++) {
    const l = Math.min(95, baseColor.hsl.l + (i * 15));
    const rgb = hslToRgb(h, s, l);
    palette.push(createColorInfo(rgb.r, rgb.g, rgb.b));
  }

  // Generate darker shades
  for (let i = 1; i < Math.floor(count / 2); i++) {
    const l = Math.max(5, baseColor.hsl.l - (i * 15));
    const rgb = hslToRgb(h, s, l);
    palette.unshift(createColorInfo(rgb.r, rgb.g, rgb.b));
  }

  return palette;
}

/**
 * Generate analogous palette (adjacent hues)
 */
function generateAnalogous(baseColor: ColorInfo, count: number = 5): ColorInfo[] {
  const palette: ColorInfo[] = [baseColor];
  const { h, s, l } = baseColor.hsl;
  const step = 30;

  for (let i = 1; i <= Math.floor(count / 2); i++) {
    const hue = (h + step * i) % 360;
    const rgb = hslToRgb(hue, s, l);
    palette.push(createColorInfo(rgb.r, rgb.g, rgb.b));
  }

  for (let i = 1; i <= Math.floor(count / 2); i++) {
    const hue = (h - step * i + 360) % 360;
    const rgb = hslToRgb(hue, s, l);
    palette.unshift(createColorInfo(rgb.r, rgb.g, rgb.b));
  }

  return palette;
}

/**
 * Generate complementary palette (opposite hue)
 */
function generateComplementary(baseColor: ColorInfo): ColorInfo[] {
  const { h, s, l } = baseColor.hsl;
  const complementHue = (h + 180) % 360;
  const rgb = hslToRgb(complementHue, s, l);

  return [baseColor, createColorInfo(rgb.r, rgb.g, rgb.b)];
}

/**
 * Generate split-complementary palette
 */
function generateSplitComplementary(baseColor: ColorInfo): ColorInfo[] {
  const { h, s, l } = baseColor.hsl;
  const palette: ColorInfo[] = [baseColor];

  // Two colors adjacent to the complement
  const hue1 = (h + 150) % 360;
  const hue2 = (h + 210) % 360;

  const rgb1 = hslToRgb(hue1, s, l);
  const rgb2 = hslToRgb(hue2, s, l);

  palette.push(createColorInfo(rgb1.r, rgb1.g, rgb1.b));
  palette.push(createColorInfo(rgb2.r, rgb2.g, rgb2.b));

  return palette;
}

/**
 * Generate triadic palette (120° apart)
 */
function generateTriadic(baseColor: ColorInfo): ColorInfo[] {
  const { h, s, l } = baseColor.hsl;
  const palette: ColorInfo[] = [baseColor];

  const hue1 = (h + 120) % 360;
  const hue2 = (h + 240) % 360;

  const rgb1 = hslToRgb(hue1, s, l);
  const rgb2 = hslToRgb(hue2, s, l);

  palette.push(createColorInfo(rgb1.r, rgb1.g, rgb1.b));
  palette.push(createColorInfo(rgb2.r, rgb2.g, rgb2.b));

  return palette;
}

/**
 * Generate tetradic palette (90° apart)
 */
function generateTetradic(baseColor: ColorInfo): ColorInfo[] {
  const { h, s, l } = baseColor.hsl;
  const palette: ColorInfo[] = [baseColor];

  const hue1 = (h + 90) % 360;
  const hue2 = (h + 180) % 360;
  const hue3 = (h + 270) % 360;

  const rgb1 = hslToRgb(hue1, s, l);
  const rgb2 = hslToRgb(hue2, s, l);
  const rgb3 = hslToRgb(hue3, s, l);

  palette.push(createColorInfo(rgb1.r, rgb1.g, rgb1.b));
  palette.push(createColorInfo(rgb2.r, rgb2.g, rgb2.b));
  palette.push(createColorInfo(rgb3.r, rgb3.g, rgb3.b));

  return palette;
}

/**
 * Generate double-complementary palette
 */
function generateDoubleComplementary(baseColor: ColorInfo): ColorInfo[] {
  const { h, s, l } = baseColor.hsl;
  const palette: ColorInfo[] = [baseColor];

  const hue1 = (h + 30) % 360;
  const hue2 = (h + 180) % 360;
  const hue3 = (h + 210) % 360;

  const rgb1 = hslToRgb(hue1, s, l);
  const rgb2 = hslToRgb(hue2, s, l);
  const rgb3 = hslToRgb(hue3, s, l);

  palette.push(createColorInfo(rgb1.r, rgb1.g, rgb1.b));
  palette.push(createColorInfo(rgb2.r, rgb2.g, rgb2.b));
  palette.push(createColorInfo(rgb3.r, rgb3.g, rgb3.b));

  return palette;
}

/**
 * GET handler - Returns API documentation
 */
export async function GET() {
  const documentation = {
    endpoint: '/api/color-palette-generator',
    method: 'POST',
    description: 'Generate harmonious color palettes based on a starting color using various color harmony schemes',
    supportedSchemes: SUPPORTED_SCHEMES,
    requestBody: {
      color: 'string (required) - HEX color code (e.g., "#FF5733" or "FF5733")',
      scheme: `string (required) - Color harmony scheme. Options: ${SUPPORTED_SCHEMES.join(', ')}`,
      count: 'number (optional) - Number of colors to generate (default: 5, applies to monochromatic and analogous)',
    },
    exampleRequest: {
      color: '#3B82F6',
      scheme: 'complementary',
    },
    exampleResponse: {
      success: true,
      scheme: 'complementary',
      baseColor: {
        hex: '#3b82f6',
        rgb: { r: 59, g: 130, b: 246 },
        hsl: { h: 217, s: 91, l: 60 },
        hsv: { h: 217, s: 76, v: 96 },
      },
      palette: [
        {
          hex: '#3b82f6',
          rgb: { r: 59, g: 130, b: 246 },
          hsl: { h: 217, s: 91, l: 60 },
          hsv: { h: 217, s: 76, v: 96 },
        },
        {
          hex: '#f6ad3b',
          rgb: { r: 246, g: 173, b: 59 },
          hsl: { h: 37, s: 91, l: 60 },
          hsv: { h: 37, s: 76, v: 96 },
        },
      ],
    },
    curlExample: `curl -X POST https://toolteeno.com/api/color-palette-generator \\
  -H "Content-Type: application/json" \\
  -d '{"color":"#3B82F6","scheme":"complementary"}'`,
    javascriptExample: `fetch('https://toolteeno.com/api/color-palette-generator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    color: '#3B82F6',
    scheme: 'complementary'
  })
})
.then(res => res.json())
.then(data => console.log(data));`,
    pythonExample: `import requests

response = requests.post(
    'https://toolteeno.com/api/color-palette-generator',
    json={
        'color': '#3B82F6',
        'scheme': 'complementary'
    }
)
print(response.json())`,
  };

  return NextResponse.json(documentation);
}

/**
 * POST handler - Generate color palette
 */
export async function POST(request: NextRequest) {
  try {
    const body: PaletteRequest = await request.json();

    // Validate input
    if (!body.color) {
      return NextResponse.json(
        {
          success: false,
          error: 'Color is required',
        } as PaletteResponse,
        { status: 400 }
      );
    }

    if (!body.scheme) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheme is required',
        } as PaletteResponse,
        { status: 400 }
      );
    }

    // Normalize color (add # if missing)
    let color = body.color.trim();
    if (!color.startsWith('#')) {
      color = '#' + color;
    }

    // Validate HEX format
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid HEX color format. Expected format: #RRGGBB',
        } as PaletteResponse,
        { status: 400 }
      );
    }

    // Validate scheme
    const scheme = body.scheme.toLowerCase();
    if (!SUPPORTED_SCHEMES.includes(scheme)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported scheme. Supported schemes: ${SUPPORTED_SCHEMES.join(', ')}`,
        } as PaletteResponse,
        { status: 400 }
      );
    }

    // Convert base color
    const rgb = hexToRgb(color);
    if (!rgb) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse color',
        } as PaletteResponse,
        { status: 400 }
      );
    }

    const baseColor = createColorInfo(rgb.r, rgb.g, rgb.b);
    let palette: ColorInfo[] = [];
    const count = body.count || 5;

    // Generate palette based on scheme
    switch (scheme) {
      case 'monochromatic':
        palette = generateMonochromatic(baseColor, count);
        break;
      case 'analogous':
        palette = generateAnalogous(baseColor, count);
        break;
      case 'complementary':
        palette = generateComplementary(baseColor);
        break;
      case 'split-complementary':
        palette = generateSplitComplementary(baseColor);
        break;
      case 'triadic':
        palette = generateTriadic(baseColor);
        break;
      case 'tetradic':
        palette = generateTetradic(baseColor);
        break;
      case 'double-complementary':
        palette = generateDoubleComplementary(baseColor);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid scheme',
          } as PaletteResponse,
          { status: 400 }
        );
    }

    // Return results
    return NextResponse.json({
      success: true,
      scheme,
      baseColor,
      palette,
    } as PaletteResponse);

  } catch (error) {
    console.error('Color palette generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate palette',
      } as PaletteResponse,
      { status: 500 }
    );
  }
}
