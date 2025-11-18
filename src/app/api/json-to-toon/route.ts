// app/api/json-to-toon/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Convert JSON to TOON format
function toTOON(data: any): string {
  if (!Array.isArray(data)) {
    throw new Error('TOON format requires an array of objects');
  }

  if (data.length === 0) {
    return '';
  }

  // Ensure all items are objects
  if (!data.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
    throw new Error('TOON format requires an array of objects (not primitives or nested arrays)');
  }

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  const keys = Array.from(allKeys);
  
  if (keys.length === 0) {
    return '';
  }

  // Determine array name (try to infer from context or use generic name)
  const arrayName = 'data';
  
  // Build TOON header: arrayName[count]{key1,key2,key3}:
  let toon = `${arrayName}[${data.length}]{${keys.join(',')}}:\n`;
  
  // Build data rows
  data.forEach(item => {
    const values = keys.map(key => {
      const value = item[key];
      
      if (value === null || value === undefined) {
        return 'null';
      }
      
      if (typeof value === 'string') {
        // Escape commas and newlines in strings
        const escaped = value
          .replace(/\\/g, '\\\\')
          .replace(/,/g, '\\,')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        return escaped;
      }
      
      if (typeof value === 'boolean') {
        return value.toString();
      }
      
      if (typeof value === 'number') {
        return value.toString();
      }
      
      if (typeof value === 'object') {
        // For nested objects/arrays, convert to compact JSON
        return JSON.stringify(value).replace(/,/g, '\\,');
      }
      
      return String(value);
    });
    
    toon += `  ${values.join(',')}\n`;
  });
  
  return toon.trim();
}

// Convert TOON to JSON format
function fromTOON(toonStr: string): any[] {
  const lines = toonStr.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('Invalid TOON format: needs header and at least one data row');
  }
  
  // Parse header: arrayName[count]{key1,key2,key3}:
  const headerLine = lines[0];
  const headerMatch = headerLine.match(/^(\w+)\[(\d+)\]\{([^}]+)\}:$/);
  
  if (!headerMatch) {
    throw new Error('Invalid TOON header format. Expected: arrayName[count]{key1,key2,key3}:');
  }
  
  const [, arrayName, countStr, keysStr] = headerMatch;
  const count = parseInt(countStr, 10);
  const keys = keysStr.split(',').map(k => k.trim());
  
  const result: any[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Remove leading whitespace (indentation)
    const trimmedLine = line.trim();
    
    // Split by comma, but respect escaped commas
    const values: string[] = [];
    let currentValue = '';
    let escaped = false;
    
    for (let j = 0; j < trimmedLine.length; j++) {
      const char = trimmedLine[j];
      
      if (escaped) {
        if (char === '\\') {
          currentValue += '\\';
        } else if (char === ',') {
          currentValue += ',';
        } else if (char === 'n') {
          currentValue += '\n';
        } else if (char === 'r') {
          currentValue += '\r';
        } else {
          currentValue += char;
        }
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === ',') {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Push the last value
    values.push(currentValue);
    
    // Build object from keys and values
    const obj: any = {};
    keys.forEach((key, index) => {
      const value = values[index]?.trim() || '';
      
      // Parse the value
      if (value === 'null') {
        obj[key] = null;
      } else if (value === 'true') {
        obj[key] = true;
      } else if (value === 'false') {
        obj[key] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        obj[key] = Number(value);
      } else if (value.startsWith('{') || value.startsWith('[')) {
        // Try to parse as JSON for nested objects/arrays
        try {
          obj[key] = JSON.parse(value);
        } catch {
          obj[key] = value;
        }
      } else {
        obj[key] = value;
      }
    });
    
    result.push(obj);
  }
  
  if (result.length !== count) {
    console.warn(`Warning: Header declared ${count} items but found ${result.length}`);
  }
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, mode } = body;

    // Validate input
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: input is required and must be a string' },
        { status: 400 }
      );
    }

    if (!mode || !['json-to-toon', 'toon-to-json'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode: must be either "json-to-toon" or "toon-to-json"' },
        { status: 400 }
      );
    }

    try {
      let output: string;
      let parsedInput: any;

      if (mode === 'json-to-toon') {
        // Parse JSON and convert to TOON
        parsedInput = JSON.parse(input);
        output = toTOON(parsedInput);
      } else {
        // Parse TOON and convert to JSON
        parsedInput = fromTOON(input);
        output = JSON.stringify(parsedInput, null, 2);
      }

      return NextResponse.json({
        success: true,
        mode,
        input,
        output,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            mode === 'json-to-toon'
              ? 'Invalid JSON or conversion failed'
              : 'Invalid TOON format or parsing failed',
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
    message: 'JSON to TOON Converter API',
    description: 'TOON (Tabular Object Oriented Notation) is a compact data format designed to reduce token usage for LLMs by eliminating redundant structure repetition found in JSON.',
    usage: {
      method: 'POST',
      endpoint: '/api/json-to-toon',
      contentType: 'application/json',
      body: {
        input: 'string (required) - The JSON array or TOON string to convert',
        mode: 'string (required) - Either "json-to-toon" or "toon-to-json"',
      },
      toonFormat: {
        description: 'TOON eliminates JSON redundancy by declaring structure once',
        syntax: 'arrayName[count]{key1,key2,key3}:\n  value1,value2,value3\n  value4,value5,value6',
        benefits: [
          'Reduces token count by ~50% compared to JSON',
          'Eliminates repeated key names',
          'Removes unnecessary quotes, braces, and commas',
          'Optimized for LLM processing',
          'Maintains data structure and types',
        ],
        rules: [
          'Header declares: array name, count, and column names',
          'Data rows are indented with 2 spaces',
          'Values separated by commas',
          'Escape commas in values with backslash (\\,)',
          'Supports strings, numbers, booleans, null, and nested JSON',
        ],
      },
      examples: {
        jsonToToon: {
          request: {
            input: '[{"id":1,"name":"Alice","role":"admin"},{"id":2,"name":"Bob","role":"user"}]',
            mode: 'json-to-toon',
          },
          response: {
            success: true,
            mode: 'json-to-toon',
            input: '[{"id":1,"name":"Alice","role":"admin"},{"id":2,"name":"Bob","role":"user"}]',
            output: 'data[2]{id,name,role}:\n  1,Alice,admin\n  2,Bob,user',
          },
        },
        toonToJson: {
          request: {
            input: 'data[2]{id,name,role}:\n  1,Alice,admin\n  2,Bob,user',
            mode: 'toon-to-json',
          },
          response: {
            success: true,
            mode: 'toon-to-json',
            input: 'data[2]{id,name,role}:\n  1,Alice,admin\n  2,Bob,user',
            output: '[\n  {\n    "id": 1,\n    "name": "Alice",\n    "role": "admin"\n  },\n  {\n    "id": 2,\n    "name": "Bob",\n    "role": "user"\n  }\n]',
          },
        },
        complexData: {
          request: {
            input: '[{"id":1,"name":"Product A","price":29.99,"inStock":true},{"id":2,"name":"Product B","price":49.99,"inStock":false}]',
            mode: 'json-to-toon',
          },
          response: {
            success: true,
            mode: 'json-to-toon',
            input: '[{"id":1,"name":"Product A","price":29.99,"inStock":true},{"id":2,"name":"Product B","price":49.99,"inStock":false}]',
            output: 'data[2]{id,name,price,inStock}:\n  1,Product A,29.99,true\n  2,Product B,49.99,false',
          },
        },
      },
      tokenSavings: {
        explanation: 'TOON reduces LLM token usage by eliminating JSON redundancy',
        comparison: {
          json: 'Repeats keys for every object: {"id":1,"name":"A"},{"id":2,"name":"B"}',
          toon: 'Declares keys once: data[2]{id,name}:\n  1,A\n  2,B',
          savings: 'Approximately 50% fewer tokens for typical datasets',
        },
      },
      commonUseCases: [
        'Reducing token costs when feeding data to LLMs',
        'Optimizing prompt engineering with large datasets',
        'Efficient data serialization for AI applications',
        'Minimizing API costs for language model services',
        'Compact data representation for training data',
      ],
    },
  });
}
