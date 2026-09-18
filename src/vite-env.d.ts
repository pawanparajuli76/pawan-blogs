/// <reference types="vite/client" />

declare module 'mammoth' {
  export interface ConvertOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: unknown;
    path?: string;
  }
  export interface ConvertResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer } | { buffer: unknown } | { path: string },
    options?: {
      styleMap?: string | string[];
      includeDefaultStyleMap?: boolean;
      [key: string]: unknown;
    }
  ): Promise<ConvertResult>;
  export function extractRawText(
    input: { arrayBuffer: ArrayBuffer } | { buffer: unknown } | { path: string }
  ): Promise<{ value: string; messages: Array<{ type: string; message: string }> }>;
}
