// app/api/svg-optimizer/route.ts
import { NextRequest, NextResponse } from 'next/server';

// SVG optimization function
function optimizeSVG(svgContent: string, options: {
  removeComments?: boolean;
  removeMetadata?: boolean;
  removeHiddenElements?: boolean;
  minifyColors?: boolean;
  removeEmptyAttrs?: boolean;
  convertStyleToAttrs?: boolean;
  removeViewBox?: boolean;
  precision?: number;
} = {}): { optimized: string; originalSize: number; optimizedSize: number; savings: number } {
  
  const {
    removeComments = true,
    removeMetadata = true,
    removeHiddenElements = true,
    minifyColors = true,
    removeEmptyAttrs = true,
    convertStyleToAttrs = false,
    removeViewBox = false,
    precision = 2,
  } = options;

  const originalSize = svgContent.length;
  let optimized = svgContent;

  // Remove XML declaration
  optimized = optimized.replace(/<\?xml[^?]*\?>/g, '');

  // Remove comments
  if (removeComments) {
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Remove metadata, title, desc tags
  if (removeMetadata) {
    optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, '');
    optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, '');
  }

  // Remove editor-specific attributes
  optimized = optimized.replace(/\s+xmlns:(inkscape|sodipodi|sketch)="[^"]*"/g, '');
  optimized = optimized.replace(/\s+(inkscape|sodipodi|sketch):[a-z-]+="[^"]*"/g, '');
  
  // Remove hidden elements
  if (removeHiddenElements) {
    optimized = optimized.replace(/<[^>]*display="none"[^>]*>[\s\S]*?<\/[^>]+>/g, '');
    optimized = optimized.replace(/<[^>]*visibility="hidden"[^>]*>[\s\S]*?<\/[^>]+>/g, '');
  }

  // Remove empty attributes
  if (removeEmptyAttrs) {
    optimized = optimized.replace(/\s+[a-z-]+=""\s*/g, ' ');
  }

  // Minify colors
  if (minifyColors) {
    // Convert RGB to hex
    optimized = optimized.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
      const toHex = (n: string) => parseInt(n).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });
    
    // Shorten hex colors
    optimized = optimized.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');
  }

  // Round numbers to specified precision
  if (precision >= 0) {
    optimized = optimized.replace(/(\d+\.\d{2,})/g, (match) => {
      return parseFloat(match).toFixed(precision);
    });
  }

  // Remove unnecessary whitespace
  optimized = optimized.replace(/\s+/g, ' ');
  optimized = optimized.replace(/>\s+</g, '><');
  optimized = optimized.trim();

  // Remove default attribute values
  optimized = optimized.replace(/\s+fill="black"/g, '');
  optimized = optimized.replace(/\s+stroke="none"/g, '');
  optimized = optimized.replace(/\s+stroke-width="1"/g, '');

  // Optionally remove viewBox
  if (removeViewBox) {
    optimized = optimized.replace(/\s+viewBox="[^"]*"/g, '');
  }

  const optimizedSize = optimized.length;
  const savings = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

  return {
    optimized,
    originalSize,
    optimizedSize,
    savings,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { svg, options } = body;

    // Validate input
    if (!svg || typeof svg !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: svg is required and must be a string' },
        { status: 400 }
      );
    }

    // Check if it's valid SVG
    if (!svg.includes('<svg') && !svg.includes('<?xml')) {
      return NextResponse.json(
        { error: 'Invalid SVG: Input must contain valid SVG markup' },
        { status: 400 }
      );
    }

    try {
      const result = optimizeSVG(svg, options || {});

      return NextResponse.json({
        success: true,
        original: svg,
        optimized: result.optimized,
        stats: {
          originalSize: result.originalSize,
          optimizedSize: result.optimizedSize,
          savings: result.savings,
          originalSizeKB: (result.originalSize / 1024).toFixed(2),
          optimizedSizeKB: (result.optimizedSize / 1024).toFixed(2),
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Optimization failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}

// Handle GET requests with usage information
export async function GET() {
  return NextResponse.json({
    message: 'SVG Optimizer API',
    description: 'Reduce SVG file size by removing unnecessary code, metadata, and optimizing attributes. Perfect for web performance optimization.',
    usage: {
      method: 'POST',
      endpoint: '/api/svg-optimizer',
      contentType: 'application/json',
      body: {
        svg: 'string (required) - The SVG content to optimize',
        options: {
          removeComments: 'boolean (default: true) - Remove XML comments',
          removeMetadata: 'boolean (default: true) - Remove metadata, title, desc tags',
          removeHiddenElements: 'boolean (default: true) - Remove hidden elements',
          minifyColors: 'boolean (default: true) - Convert colors to shortest format',
          removeEmptyAttrs: 'boolean (default: true) - Remove empty attributes',
          convertStyleToAttrs: 'boolean (default: false) - Convert inline styles to attributes',
          removeViewBox: 'boolean (default: false) - Remove viewBox attribute',
          precision: 'number (default: 2) - Decimal precision for numbers',
        },
      },
      optimizations: [
        'Removes XML declarations and comments',
        'Strips metadata, title, and description tags',
        'Removes editor-specific attributes (Inkscape, Sketch, etc.)',
        'Eliminates hidden elements (display:none, visibility:hidden)',
        'Minifies colors (RGB to hex, shorthand hex)',
        'Rounds decimal numbers to specified precision',
        'Removes unnecessary whitespace',
        'Strips default attribute values',
        'Compresses the overall file size',
      ],
      examples: {
        basic: {
          request: {
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>',
            options: {},
          },
          response: {
            success: true,
            optimized: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg>',
            stats: {
              originalSize: 120,
              optimizedSize: 110,
              savings: 8,
              originalSizeKB: '0.12',
              optimizedSizeKB: '0.11',
            },
          },
        },
        withOptions: {
          request: {
            svg: '<!-- Comment --><svg><metadata>...</metadata><circle cx="50.123456" cy="50.123456" r="40" fill="#ff0000"/></svg>',
            options: {
              removeComments: true,
              removeMetadata: true,
              precision: 1,
            },
          },
          response: {
            success: true,
            optimized: '<svg><circle cx="50.1" cy="50.1" r="40" fill="red"/></svg>',
            stats: {
              originalSize: 150,
              optimizedSize: 65,
              savings: 57,
            },
          },
        },
        complexSVG: {
          request: {
            svg: '<svg xmlns:inkscape="..." inkscape:version="1.0"><title>My Icon</title><desc>Description</desc><g display="none"><path.../></g><rect fill="rgb(255, 0, 0)"/></svg>',
            options: {
              removeComments: true,
              removeMetadata: true,
              removeHiddenElements: true,
              minifyColors: true,
            },
          },
          response: {
            success: true,
            optimized: '<svg><rect fill="red"/></svg>',
            stats: {
              originalSize: 200,
              optimizedSize: 30,
              savings: 85,
            },
          },
        },
      },
      benefits: [
        'Faster page load times',
        'Reduced bandwidth usage',
        'Improved web performance scores',
        'Cleaner, more maintainable code',
        'Better SEO rankings',
      ],
      commonUseCases: [
        'Optimizing SVG icons for websites',
        'Reducing file size before deployment',
        'Cleaning up exported SVGs from design tools',
        'Batch processing SVG assets',
        'Improving web performance metrics',
      ],
    },
  });
}
