// app/api/json-to-toml/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple TOML encoder
function toTOML(obj: any, parentKey = ''): string {
  let toml = '';
  const tables: { [key: string]: any } = {};
  const values: string[] = [];

  for (const key in obj) {
    const value = obj[key];
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (value === null || value === undefined) {
      values.push(`${key} = null`);
    } else if (typeof value === 'boolean') {
      values.push(`${key} = ${value}`);
    } else if (typeof value === 'number') {
      values.push(`${key} = ${value}`);
    } else if (typeof value === 'string') {
      // Escape special characters in strings
      const escapedValue = value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      values.push(`${key} = "${escapedValue}"`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        values.push(`${key} = []`);
      } else if (typeof value[0] === 'object' && !Array.isArray(value[0])) {
        // Array of tables
        tables[key] = value;
      } else {
        // Simple array
        const arrayValues = value.map((v) => {
          if (typeof v === 'string') {
            const escapedValue = v
              .replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, '\\n');
            return `"${escapedValue}"`;
          }
          return v;
        });
        values.push(`${key} = [${arrayValues.join(', ')}]`);
      }
    } else if (typeof value === 'object') {
      // Nested object (table)
      tables[key] = value;
    }
  }

  // Add simple values first
  if (values.length > 0) {
    toml += values.join('\n') + '\n';
  }

  // Add tables
  for (const key in tables) {
    const value = tables[key];
    if (Array.isArray(value)) {
      // Array of tables
      toml += '\n';
      value.forEach((item) => {
        toml += `[[${parentKey ? parentKey + '.' : ''}${key}]]\n`;
        toml += toTOML(item, '');
      });
    } else {
      // Single table
      toml += '\n';
      toml += `[${parentKey ? parentKey + '.' : ''}${key}]\n`;
      toml += toTOML(value, '');
    }
  }

  return toml;
}

// Simple TOML decoder
function fromTOML(tomlStr: string): any {
  const result: any = {};
  let currentTable: any = result;
  let currentPath: string[] = [];

  const lines = tomlStr.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    // Handle table headers [table.name]
    if (line.startsWith('[') && line.endsWith(']')) {
      const isArrayTable = line.startsWith('[[') && line.endsWith(']]');
      const tableName = isArrayTable
        ? line.slice(2, -2).trim()
        : line.slice(1, -1).trim();

      const path = tableName.split('.');
      currentPath = path;
      currentTable = result;

      for (let j = 0; j < path.length; j++) {
        const key = path[j];
        if (isArrayTable && j === path.length - 1) {
          if (!currentTable[key]) {
            currentTable[key] = [];
          }
          const newObj = {};
          currentTable[key].push(newObj);
          currentTable = newObj;
        } else {
          if (!currentTable[key]) {
            currentTable[key] = {};
          }
          currentTable = currentTable[key];
        }
      }
      continue;
    }

    // Handle key-value pairs
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) continue;

    const key = line.slice(0, equalIndex).trim();
    let value = line.slice(equalIndex + 1).trim();

    // Parse the value
    let parsedValue: any;

    if (value === 'true') {
      parsedValue = true;
    } else if (value === 'false') {
      parsedValue = false;
    } else if (value === 'null') {
      parsedValue = null;
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Array
      const arrayContent = value.slice(1, -1).trim();
      if (!arrayContent) {
        parsedValue = [];
      } else {
        parsedValue = arrayContent.split(',').map((item) => {
          const trimmed = item.trim();
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return trimmed
              .slice(1, -1)
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
          }
          if (!isNaN(Number(trimmed))) {
            return Number(trimmed);
          }
          if (trimmed === 'true') return true;
          if (trimmed === 'false') return false;
          return trimmed;
        });
      }
    } else if (value.startsWith('"') && value.endsWith('"')) {
      // String
      parsedValue = value
        .slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    } else if (!isNaN(Number(value))) {
      // Number
      parsedValue = Number(value);
    } else {
      parsedValue = value;
    }

    currentTable[key] = parsedValue;
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

    if (!mode || !['json-to-toml', 'toml-to-json'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode: must be either "json-to-toml" or "toml-to-json"' },
        { status: 400 }
      );
    }

    try {
      let output: string;
      let parsedInput: any;

      if (mode === 'json-to-toml') {
        // Parse JSON and convert to TOML
        parsedInput = JSON.parse(input);
        output = toTOML(parsedInput).trim();
      } else {
        // Parse TOML and convert to JSON
        parsedInput = fromTOML(input);
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
            mode === 'json-to-toml'
              ? 'Invalid JSON: Failed to parse JSON input'
              : 'Invalid TOML: Failed to parse TOML input',
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
    message: 'JSON to TOML Converter API',
    usage: {
      method: 'POST',
      endpoint: '/api/json-to-toml',
      contentType: 'application/json',
      body: {
        input: 'string (required) - The JSON or TOML string to convert',
        mode: 'string (required) - Either "json-to-toml" or "toml-to-json"',
      },
      formats: {
        json: 'JavaScript Object Notation - Standard data interchange format',
        toml: 'Tom\'s Obvious, Minimal Language - Configuration file format',
      },
      features: {
        bidirectional: 'Convert JSON to TOML and TOML to JSON',
        preservation: 'Maintains data types (strings, numbers, booleans, arrays, objects)',
        formatting: 'Pretty-prints JSON output with 2-space indentation',
        nested: 'Supports nested objects and arrays',
        arrays: 'Handles both simple arrays and arrays of tables',
      },
      examples: {
        jsonToToml: {
          request: {
            input: '{"name":"John","age":30,"active":true,"tags":["dev","admin"]}',
            mode: 'json-to-toml',
          },
          response: {
            success: true,
            mode: 'json-to-toml',
            input: '{"name":"John","age":30,"active":true,"tags":["dev","admin"]}',
            output: 'name = "John"\nage = 30\nactive = true\ntags = ["dev", "admin"]',
          },
        },
        tomlToJson: {
          request: {
            input: 'name = "John"\nage = 30\nactive = true\ntags = ["dev", "admin"]',
            mode: 'toml-to-json',
          },
          response: {
            success: true,
            mode: 'toml-to-json',
            input: 'name = "John"\nage = 30\nactive = true\ntags = ["dev", "admin"]',
            output: '{\n  "name": "John",\n  "age": 30,\n  "active": true,\n  "tags": [\n    "dev",\n    "admin"\n  ]\n}',
          },
        },
        nestedObjects: {
          request: {
            input: '{"database":{"server":"192.168.1.1","ports":[8001,8002],"enabled":true}}',
            mode: 'json-to-toml',
          },
          response: {
            success: true,
            mode: 'json-to-toml',
            input: '{"database":{"server":"192.168.1.1","ports":[8001,8002],"enabled":true}}',
            output: '[database]\nserver = "192.168.1.1"\nports = [8001, 8002]\nenabled = true',
          },
        },
      },
      commonUseCases: [
        'Converting configuration files between formats',
        'Migrating from JSON to TOML configs',
        'API response transformation',
        'Configuration file generation',
        'Data format conversion in build pipelines',
      ],
    },
  });
}
