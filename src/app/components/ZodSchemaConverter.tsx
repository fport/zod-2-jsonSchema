'use client';

import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
import { z } from 'zod';

interface JsonSchemaType {
  type: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  enum?: string[];
  default?: unknown;
  properties?: Record<string, JsonSchemaType>;
  required?: string[];
  items?: JsonSchemaType;
}

type ZodStringCheck = { kind: string; value?: unknown };
type ZodNumberCheck = { kind: string; value: number };

const zodToJsonSchema = (schema: z.ZodTypeAny): JsonSchemaType => {
  if (schema instanceof z.ZodString) {
    const base: JsonSchemaType = { type: 'string' };
    const checks = schema._def.checks as ZodStringCheck[] | undefined;
    if (checks) {
      for (const check of checks) {
        if (check.kind === 'email') base.format = 'email';
        if (check.kind === 'url') base.format = 'uri';
      }
    }
    return base;
  }

  if (schema instanceof z.ZodNumber) {
    const base: JsonSchemaType = { type: 'number' };
    const checks = schema._def.checks as ZodNumberCheck[] | undefined;
    if (checks) {
      for (const check of checks) {
        if (check.kind === 'min') base.minimum = check.value;
        if (check.kind === 'max') base.maximum = check.value;
      }
    }
    return base;
  }

  if (schema instanceof z.ZodDate) {
    return { type: 'string', format: 'date-time' };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema._def.values as string[],
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema._def.innerType);
  }

  if (schema instanceof z.ZodDefault) {
    const innerSchema = zodToJsonSchema(schema._def.innerType);
    const defaultValue = schema._def.defaultValue();
    return {
      ...innerSchema,
      default: defaultValue,
    };
  }

  if (schema instanceof z.ZodObject) {
    const properties: Record<string, JsonSchemaType> = {};
    const required: string[] = [];

    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value);
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema._def.type),
    };
  }

  return { type: 'any' };
};

const DEFAULT_SCHEMA = `z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]).default("system"),
    language: z.enum(["en", "tr"]).default("en"),
  }).optional(),
})`;

export default function ZodSchemaConverter() {
  const [zodInput, setZodInput] = useState(DEFAULT_SCHEMA);
  const [jsonSchemaOutput, setJsonSchemaOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const convertToJsonSchema = () => {
    try {
      setError(null);
      
      // Create a safe evaluation context
      const safeEval = new Function('z', `return ${zodInput}`) as (zodLib: typeof z) => z.ZodTypeAny;
      const zodSchema = safeEval(z);
      
      if (!(zodSchema instanceof z.ZodType)) {
        throw new Error('Invalid Zod schema');
      }

      const jsonSchema = zodToJsonSchema(zodSchema);
      setJsonSchemaOutput(JSON.stringify(jsonSchema, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Zod to JSON Schema Converter</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Zod Schema Input</h2>
          <div className="h-[500px] border rounded-lg overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              value={zodInput}
              onChange={(value) => setZodInput(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">JSON Schema Output</h2>
          <div className="h-[500px] border rounded-lg overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              theme="vs-dark"
              value={jsonSchemaOutput}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 mt-2">
          Error: {error}
        </div>
      )}

      <button
        onClick={convertToJsonSchema}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Convert to JSON Schema
      </button>
    </div>
  );
} 