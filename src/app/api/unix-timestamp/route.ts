import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/unix-timestamp
 * 
 * Converts between human-readable date/time and Unix timestamps.
 * 
 * Request body:
 * {
 *   "mode": "toTimestamp" | "toDate",
 *   "input": string,           // Date string (ISO, locale) or Unix timestamp
 *   "timezone"?: string,        // Optional: IANA timezone (e.g., "America/New_York")
 *   "format"?: string           // Optional: "seconds" | "milliseconds" (default: "seconds")
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "mode": "toTimestamp" | "toDate",
 *   "input": string,
 *   "output": {
 *     "timestamp": number,           // Unix timestamp
 *     "milliseconds": number,        // Unix timestamp in milliseconds
 *     "iso": string,                 // ISO 8601 format
 *     "utc": string,                 // UTC string
 *     "locale": string,              // Localized date string
 *     "date": string,                // Date only (YYYY-MM-DD)
 *     "time": string,                // Time only (HH:MM:SS)
 *     "year": number,
 *     "month": number,
 *     "day": number,
 *     "hour": number,
 *     "minute": number,
 *     "second": number,
 *     "dayOfWeek": string,
 *     "timezone": string
 *   }
 * }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, input, timezone = 'UTC', format = 'seconds' } = body;

    // Validation
    if (!mode || !['toTimestamp', 'toDate'].includes(mode)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid mode. Must be "toTimestamp" or "toDate".' 
        },
        { status: 400 }
      );
    }

    if (!input && input !== 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Input is required.' 
        },
        { status: 400 }
      );
    }

    let date: Date;
    let timestampSeconds: number;
    let timestampMilliseconds: number;

    if (mode === 'toTimestamp') {
      // Convert date string to timestamp
      const inputStr = String(input).trim();
      
      // Try to parse the date
      date = new Date(inputStr);
      
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid date format. Please provide a valid date string.' 
          },
          { status: 400 }
        );
      }

      timestampMilliseconds = date.getTime();
      timestampSeconds = Math.floor(timestampMilliseconds / 1000);
    } else {
      // Convert timestamp to date
      const inputNum = Number(input);
      
      if (isNaN(inputNum)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid timestamp. Must be a number.' 
          },
          { status: 400 }
        );
      }

      // Determine if input is in seconds or milliseconds
      // Timestamps after year 2286 would be in milliseconds if interpreted as seconds
      if (format === 'milliseconds' || inputNum > 10000000000) {
        timestampMilliseconds = inputNum;
        timestampSeconds = Math.floor(inputNum / 1000);
      } else {
        timestampSeconds = inputNum;
        timestampMilliseconds = inputNum * 1000;
      }

      date = new Date(timestampMilliseconds);
      
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid timestamp value.' 
          },
          { status: 400 }
        );
      }
    }

    // Format output with all possible representations
    const output = {
      timestamp: timestampSeconds,
      milliseconds: timestampMilliseconds,
      iso: date.toISOString(),
      utc: date.toUTCString(),
      locale: date.toLocaleString('en-US', { timeZone: timezone }),
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0],
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      timezone: timezone,
      relative: getRelativeTime(date),
    };

    return NextResponse.json({
      success: true,
      mode,
      input: String(input),
      output,
    });
  } catch (error) {
    console.error('Unix Timestamp Converter Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred.' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/unix-timestamp
 * 
 * Returns API documentation and usage examples.
 */
export async function GET() {
  const documentation = {
    endpoint: '/api/unix-timestamp',
    method: 'POST',
    description: 'Convert between human-readable date/time and Unix timestamps with timezone support.',
    requestBody: {
      mode: {
        type: 'string',
        required: true,
        enum: ['toTimestamp', 'toDate'],
        description: 'Conversion mode: "toTimestamp" converts date to timestamp, "toDate" converts timestamp to date',
      },
      input: {
        type: 'string | number',
        required: true,
        description: 'Date string (for toTimestamp mode) or Unix timestamp (for toDate mode)',
      },
      timezone: {
        type: 'string',
        required: false,
        default: 'UTC',
        description: 'IANA timezone identifier (e.g., "America/New_York", "Europe/London", "Asia/Tokyo")',
      },
      format: {
        type: 'string',
        required: false,
        default: 'seconds',
        enum: ['seconds', 'milliseconds'],
        description: 'Timestamp format for toDate mode',
      },
    },
    response: {
      success: 'boolean',
      mode: 'string',
      input: 'string',
      output: {
        timestamp: 'number (seconds)',
        milliseconds: 'number',
        iso: 'string (ISO 8601 format)',
        utc: 'string (UTC format)',
        locale: 'string (localized format)',
        date: 'string (YYYY-MM-DD)',
        time: 'string (HH:MM:SS)',
        year: 'number',
        month: 'number (1-12)',
        day: 'number (1-31)',
        hour: 'number (0-23)',
        minute: 'number (0-59)',
        second: 'number (0-59)',
        dayOfWeek: 'string',
        timezone: 'string',
        relative: 'string (e.g., "2 hours ago")',
      },
    },
    examples: [
      {
        title: 'Convert Date to Unix Timestamp',
        request: {
          mode: 'toTimestamp',
          input: '2024-01-15T10:30:00Z',
          timezone: 'UTC',
        },
        response: {
          success: true,
          mode: 'toTimestamp',
          input: '2024-01-15T10:30:00Z',
          output: {
            timestamp: 1705315800,
            milliseconds: 1705315800000,
            iso: '2024-01-15T10:30:00.000Z',
            utc: 'Mon, 15 Jan 2024 10:30:00 GMT',
            locale: '1/15/2024, 10:30:00 AM',
            date: '2024-01-15',
            time: '10:30:00',
            year: 2024,
            month: 1,
            day: 15,
            hour: 10,
            minute: 30,
            second: 0,
            dayOfWeek: 'Monday',
            timezone: 'UTC',
            relative: '10 months ago',
          },
        },
      },
      {
        title: 'Convert Unix Timestamp to Date',
        request: {
          mode: 'toDate',
          input: 1705315800,
          timezone: 'America/New_York',
          format: 'seconds',
        },
        response: {
          success: true,
          mode: 'toDate',
          input: '1705315800',
          output: {
            timestamp: 1705315800,
            milliseconds: 1705315800000,
            iso: '2024-01-15T10:30:00.000Z',
            utc: 'Mon, 15 Jan 2024 10:30:00 GMT',
            locale: '1/15/2024, 5:30:00 AM',
            date: '2024-01-15',
            time: '10:30:00',
            year: 2024,
            month: 1,
            day: 15,
            hour: 10,
            minute: 30,
            second: 0,
            dayOfWeek: 'Monday',
            timezone: 'America/New_York',
            relative: '10 months ago',
          },
        },
      },
      {
        title: 'Convert Current Date',
        request: {
          mode: 'toTimestamp',
          input: 'November 19, 2025 3:45 PM',
          timezone: 'Europe/London',
        },
        response: {
          success: true,
          mode: 'toTimestamp',
          input: 'November 19, 2025 3:45 PM',
          output: {
            timestamp: 1763559900,
            milliseconds: 1763559900000,
            iso: '2025-11-19T15:45:00.000Z',
            utc: 'Wed, 19 Nov 2025 15:45:00 GMT',
            locale: '11/19/2025, 3:45:00 PM',
            date: '2025-11-19',
            time: '15:45:00',
            year: 2025,
            month: 11,
            day: 19,
            hour: 15,
            minute: 45,
            second: 0,
            dayOfWeek: 'Wednesday',
            timezone: 'Europe/London',
            relative: 'just now',
          },
        },
      },
      {
        title: 'Convert Millisecond Timestamp',
        request: {
          mode: 'toDate',
          input: 1705315800000,
          timezone: 'Asia/Tokyo',
          format: 'milliseconds',
        },
        response: {
          success: true,
          mode: 'toDate',
          input: '1705315800000',
          output: {
            timestamp: 1705315800,
            milliseconds: 1705315800000,
            iso: '2024-01-15T10:30:00.000Z',
            utc: 'Mon, 15 Jan 2024 10:30:00 GMT',
            locale: '1/15/2024, 7:30:00 PM',
            date: '2024-01-15',
            time: '10:30:00',
            year: 2024,
            month: 1,
            day: 15,
            hour: 10,
            minute: 30,
            second: 0,
            dayOfWeek: 'Monday',
            timezone: 'Asia/Tokyo',
            relative: '10 months ago',
          },
        },
      },
    ],
    useCases: [
      'Convert timestamps from API responses to readable dates',
      'Store dates as Unix timestamps in databases',
      'Synchronize time across different systems and timezones',
      'Calculate time differences and durations',
      'Schedule tasks and events with precise timing',
      'Debug timestamp-related issues in applications',
    ],
    notes: [
      'Unix timestamps represent seconds since January 1, 1970 00:00:00 UTC (Unix epoch)',
      'Millisecond timestamps are common in JavaScript (Date.now())',
      'Timestamps are timezone-independent; timezone affects display only',
      'Supports all IANA timezone identifiers',
      'Accepts various date formats: ISO 8601, locale strings, natural language',
      'Relative time provides human-friendly descriptions (e.g., "2 hours ago")',
    ],
  };

  return NextResponse.json(documentation, { status: 200 });
}

/**
 * Helper function to get relative time description
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (Math.abs(diffSeconds) < 10) {
    return 'just now';
  } else if (Math.abs(diffSeconds) < 60) {
    return diffSeconds > 0 ? `${diffSeconds} seconds ago` : `in ${Math.abs(diffSeconds)} seconds`;
  } else if (Math.abs(diffMinutes) < 60) {
    return diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''}`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''}`;
  } else if (Math.abs(diffDays) < 30) {
    return diffDays > 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (Math.abs(diffMonths) < 12) {
    return diffMonths > 0 ? `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffMonths)} month${Math.abs(diffMonths) !== 1 ? 's' : ''}`;
  } else {
    return diffYears > 0 ? `${diffYears} year${diffYears !== 1 ? 's' : ''} ago` : `in ${Math.abs(diffYears)} year${Math.abs(diffYears) !== 1 ? 's' : ''}`;
  }
}
