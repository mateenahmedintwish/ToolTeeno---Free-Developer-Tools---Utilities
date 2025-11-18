// app/api/password/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      length = 16, 
      uppercase = true, 
      lowercase = true, 
      numbers = true, 
      symbols = true,
      count = 1 
    } = body;

    // Validate length
    const passwordLength = parseInt(length as any);
    if (isNaN(passwordLength) || passwordLength < 4 || passwordLength > 128) {
      return NextResponse.json(
        { error: 'Invalid length: must be between 4 and 128 characters' },
        { status: 400 }
      );
    }

    // Validate count
    const passwordCount = parseInt(count as any);
    if (isNaN(passwordCount) || passwordCount < 1 || passwordCount > 50) {
      return NextResponse.json(
        { error: 'Invalid count: must be between 1 and 50 passwords' },
        { status: 400 }
      );
    }

    // Validate that at least one character type is selected
    if (!uppercase && !lowercase && !numbers && !symbols) {
      return NextResponse.json(
        { error: 'At least one character type must be selected' },
        { status: 400 }
      );
    }

    // Define character sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Build character pool based on options
    let charPool = '';
    if (uppercase) charPool += uppercaseChars;
    if (lowercase) charPool += lowercaseChars;
    if (numbers) charPool += numberChars;
    if (symbols) charPool += symbolChars;

    // Generate passwords
    const passwords: string[] = [];
    
    for (let i = 0; i < passwordCount; i++) {
      let password = '';
      const array = new Uint32Array(passwordLength);
      crypto.getRandomValues(array);
      
      for (let j = 0; j < passwordLength; j++) {
        password += charPool[array[j] % charPool.length];
      }
      
      passwords.push(password);
    }

    return NextResponse.json({
      success: true,
      config: {
        length: passwordLength,
        uppercase,
        lowercase,
        numbers,
        symbols,
        count: passwordCount,
      },
      passwords: passwordCount === 1 ? passwords[0] : passwords,
      entropy: Math.log2(Math.pow(charPool.length, passwordLength)).toFixed(2),
      charPoolSize: charPool.length,
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
    message: 'Password Generator API',
    usage: {
      method: 'POST',
      endpoint: '/api/password',
      contentType: 'application/json',
      body: {
        length: 'number (optional) - Password length, between 4-128 (default: 16)',
        uppercase: 'boolean (optional) - Include uppercase letters A-Z (default: true)',
        lowercase: 'boolean (optional) - Include lowercase letters a-z (default: true)',
        numbers: 'boolean (optional) - Include numbers 0-9 (default: true)',
        symbols: 'boolean (optional) - Include symbols !@#$%^&* etc. (default: true)',
        count: 'number (optional) - Number of passwords to generate, 1-50 (default: 1)',
      },
      notes: [
        'At least one character type must be enabled',
        'Uses cryptographically secure random number generation',
        'Entropy calculation provided for password strength assessment',
      ],
      examples: {
        basic: {
          request: {
            length: 16,
          },
          response: {
            success: true,
            config: {
              length: 16,
              uppercase: true,
              lowercase: true,
              numbers: true,
              symbols: true,
              count: 1,
            },
            passwords: 'aB3!xY7@mK9#pQ2$',
            entropy: '95.27',
            charPoolSize: 94,
          },
        },
        custom: {
          request: {
            length: 12,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: false,
            count: 3,
          },
          response: {
            success: true,
            config: {
              length: 12,
              uppercase: true,
              lowercase: true,
              numbers: true,
              symbols: false,
              count: 3,
            },
            passwords: [
              'aB7mK2pQ9xYz',
              'xR4nL8sT3wMk',
              'pQ6mY1hJ9cVb',
            ],
            entropy: '71.60',
            charPoolSize: 62,
          },
        },
        simple: {
          request: {
            length: 8,
            uppercase: false,
            lowercase: true,
            numbers: true,
            symbols: false,
          },
          response: {
            success: true,
            config: {
              length: 8,
              uppercase: false,
              lowercase: true,
              numbers: true,
              symbols: false,
              count: 1,
            },
            passwords: 'a7m2k9px',
            entropy: '47.63',
            charPoolSize: 36,
          },
        },
      },
    },
  });
}
