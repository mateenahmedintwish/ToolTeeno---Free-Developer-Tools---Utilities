import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, secret } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'JWT token is required' },
        { status: 400 }
      );
    }

    // Split the JWT token into parts
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid JWT format. JWT must have 3 parts separated by dots (header.payload.signature)' },
        { status: 400 }
      );
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    let header: any;
    let payload: any;
    
    // Decode header
    try {
      const headerJson = Buffer.from(headerB64, 'base64url').toString('utf-8');
      header = JSON.parse(headerJson);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid JWT header: Unable to decode base64url or parse JSON' },
        { status: 400 }
      );
    }

    // Decode payload
    try {
      const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      payload = JSON.parse(payloadJson);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid JWT payload: Unable to decode base64url or parse JSON' },
        { status: 400 }
      );
    }

    // Parse timestamps if present
    const timestamps: any = {};
    if (payload.iat) {
      timestamps.issuedAt = {
        timestamp: payload.iat,
        date: new Date(payload.iat * 1000).toISOString(),
      };
    }
    if (payload.exp) {
      timestamps.expiresAt = {
        timestamp: payload.exp,
        date: new Date(payload.exp * 1000).toISOString(),
      };
      timestamps.isExpired = payload.exp * 1000 < Date.now();
    }
    if (payload.nbf) {
      timestamps.notBefore = {
        timestamp: payload.nbf,
        date: new Date(payload.nbf * 1000).toISOString(),
      };
    }

    // Basic signature verification (if secret provided)
    let signatureValid: boolean | null = null;
    if (secret) {
      try {
        const crypto = require('crypto');
        const algorithm = header.alg?.toLowerCase() || 'hs256';
        
        // Only support HMAC algorithms for now
        if (algorithm.startsWith('hs')) {
          const hmacAlgorithm = algorithm.replace('hs', 'sha');
          const dataToSign = `${headerB64}.${payloadB64}`;
          const expectedSignature = crypto
            .createHmac(hmacAlgorithm, secret)
            .update(dataToSign)
            .digest('base64url');
          
          signatureValid = expectedSignature === signatureB64;
        } else {
          signatureValid = null; // Algorithm not supported
        }
      } catch (err) {
        signatureValid = null;
      }
    }

    return NextResponse.json({
      success: true,
      decoded: {
        header,
        payload,
        signature: signatureB64,
        raw: {
          header: headerB64,
          payload: payloadB64,
          signature: signatureB64,
        },
      },
      timestamps,
      signatureValid,
      algorithm: header.alg || 'unknown',
      type: header.typ || 'JWT',
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const documentation = {
    endpoint: '/api/jwt-debugger',
    method: 'POST',
    description: 'Decode and inspect JSON Web Tokens (JWT) including header, payload, and signature validation',
    requestBody: {
      token: {
        type: 'string',
        required: true,
        description: 'The JWT token to decode (format: header.payload.signature)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
      secret: {
        type: 'string',
        required: false,
        description: 'Secret key for signature verification (only for HMAC algorithms: HS256, HS384, HS512)',
        example: 'your-256-bit-secret',
      },
    },
    response: {
      success: {
        type: 'boolean',
        description: 'Whether the request was successful',
      },
      decoded: {
        type: 'object',
        description: 'Decoded JWT components',
        properties: {
          header: 'The decoded JWT header (algorithm, type, etc.)',
          payload: 'The decoded JWT payload (claims, data)',
          signature: 'The signature part of the JWT',
          raw: 'The raw base64url encoded parts',
        },
      },
      timestamps: {
        type: 'object',
        description: 'Parsed timestamp claims with human-readable dates',
        properties: {
          issuedAt: 'iat (Issued At) claim',
          expiresAt: 'exp (Expiration Time) claim',
          notBefore: 'nbf (Not Before) claim',
          isExpired: 'Whether the token is expired',
        },
      },
      signatureValid: {
        type: 'boolean | null',
        description: 'Signature validation result (null if secret not provided or algorithm not supported)',
      },
      algorithm: {
        type: 'string',
        description: 'The algorithm used to sign the JWT',
      },
      type: {
        type: 'string',
        description: 'The token type (usually JWT)',
      },
    },
    examples: [
      {
        name: 'Basic JWT Decoding',
        description: 'Decode a JWT without signature verification',
        request: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        },
        response: {
          success: true,
          decoded: {
            header: {
              alg: 'HS256',
              typ: 'JWT',
            },
            payload: {
              sub: '1234567890',
              name: 'John Doe',
              iat: 1516239022,
            },
            signature: 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          },
          timestamps: {
            issuedAt: {
              timestamp: 1516239022,
              date: '2018-01-18T01:30:22.000Z',
            },
          },
          signatureValid: null,
          algorithm: 'HS256',
          type: 'JWT',
        },
      },
      {
        name: 'JWT with Signature Verification',
        description: 'Decode and verify JWT signature using a secret',
        request: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          secret: 'your-256-bit-secret',
        },
        response: {
          success: true,
          decoded: {
            header: { alg: 'HS256', typ: 'JWT' },
            payload: {
              sub: '1234567890',
              name: 'John Doe',
              iat: 1516239022,
            },
          },
          signatureValid: true,
          algorithm: 'HS256',
        },
      },
      {
        name: 'JWT with Expiration',
        description: 'Decode JWT with expiration time to check if expired',
        request: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNzAwMDAwMDAwLCJpYXQiOjE2OTk5OTk5OTl9.signature',
        },
        response: {
          success: true,
          timestamps: {
            issuedAt: {
              timestamp: 1699999999,
              date: '2023-11-15T06:13:19.000Z',
            },
            expiresAt: {
              timestamp: 1700000000,
              date: '2023-11-15T06:13:20.000Z',
            },
            isExpired: true,
          },
        },
      },
    ],
    useCases: [
      'Debug JWT tokens during development',
      'Inspect JWT claims and payload data',
      'Verify JWT signature validity',
      'Check token expiration status',
      'Understand JWT structure and encoding',
      'Troubleshoot authentication issues',
      'Validate JWT format before processing',
      'Educational tool for learning about JWTs',
    ],
    benefits: [
      'Instant JWT decoding without external libraries',
      'Support for all standard JWT claims',
      'Signature verification for HMAC algorithms',
      'Timestamp parsing with human-readable dates',
      'Expiration status checking',
      'Detailed error messages for invalid tokens',
      'Free to use with no rate limits',
      'No data logging or storage',
    ],
    securityNote: 'Never share your secret keys publicly. This API does not store or log any tokens or secrets. For production use, always verify JWTs on the server side.',
  };

  return NextResponse.json(documentation, { status: 200 });
}
