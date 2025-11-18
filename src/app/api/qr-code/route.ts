// app/api/qr-code/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, size = 256, bgColor = '#ffffff', fgColor = '#000000', level = 'M' } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 2000 characters allowed.' },
        { status: 400 }
      );
    }

    // Validate size
    const qrSize = parseInt(size as any);
    if (isNaN(qrSize) || qrSize < 128 || qrSize > 1024) {
      return NextResponse.json(
        { error: 'Invalid size: must be between 128 and 1024 pixels' },
        { status: 400 }
      );
    }

    // Validate error correction level
    if (!['L', 'M', 'Q', 'H'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid error correction level: must be L, M, Q, or H' },
        { status: 400 }
      );
    }

    // Validate colors (hex format)
    const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
    if (!hexColorRegex.test(bgColor) || !hexColorRegex.test(fgColor)) {
      return NextResponse.json(
        { error: 'Invalid color format: colors must be valid hex codes (e.g., #ffffff)' },
        { status: 400 }
      );
    }

    // Generate QR code URL using a third-party service or return configuration
    // Since we need to generate the QR code on client-side with qrcode.react,
    // we return the configuration and a data URL can be generated client-side
    
    return NextResponse.json({
      success: true,
      config: {
        text,
        size: qrSize,
        bgColor,
        fgColor,
        level,
      },
      message: 'QR Code configuration generated successfully',
      note: 'To get the actual QR code image, use the provided configuration with a QR code library in your application, or visit the web interface at https://toolteeno.com/tools/qr-code-generator',
      apiImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(text)}&bgcolor=${bgColor.replace('#', '')}&color=${fgColor.replace('#', '')}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body or server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

// Handle GET requests with usage information
export async function GET() {
  return NextResponse.json({
    message: 'QR Code Generator API',
    usage: {
      method: 'POST',
      endpoint: '/api/qr-code',
      contentType: 'application/json',
      body: {
        text: 'string (required) - The text or URL to encode in the QR code (max 2000 characters)',
        size: 'number (optional) - QR code size in pixels, between 128-1024 (default: 256)',
        bgColor: 'string (optional) - Background color in hex format (default: #ffffff)',
        fgColor: 'string (optional) - Foreground/QR code color in hex format (default: #000000)',
        level: 'string (optional) - Error correction level: L, M, Q, or H (default: M)',
      },
      errorCorrectionLevels: {
        L: 'Low - ~7% correction',
        M: 'Medium - ~15% correction (recommended)',
        Q: 'Quartile - ~25% correction',
        H: 'High - ~30% correction',
      },
      examples: {
        basic: {
          request: {
            text: 'https://toolteeno.com',
          },
          response: {
            success: true,
            config: {
              text: 'https://toolteeno.com',
              size: 256,
              bgColor: '#ffffff',
              fgColor: '#000000',
              level: 'M',
            },
            message: 'QR Code configuration generated successfully',
            apiImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=https://toolteeno.com...',
          },
        },
        custom: {
          request: {
            text: 'Hello, World!',
            size: 512,
            bgColor: '#ffffff',
            fgColor: '#4f46e5',
            level: 'H',
          },
          response: {
            success: true,
            config: {
              text: 'Hello, World!',
              size: 512,
              bgColor: '#ffffff',
              fgColor: '#4f46e5',
              level: 'H',
            },
            message: 'QR Code configuration generated successfully',
            apiImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=Hello, World!...',
          },
        },
      },
    },
  });
}
