import "server-only";
import { GoogleGenAI } from "@google/genai";

/** Models (see Gemini API docs; update here to upgrade the whole app). */
export const LIVE_MODEL = "gemini-3.8-live";
export const EVAL_MODEL = "gemini-3.8-flash";
export const LIVE_VOICE = "Kore";

let client: GoogleGenAI | null = null;

/** Server-side Gemini client. The API key never leaves the server. */
export function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diset. Tambahkan ke file .env.local lalu restart server.");
  }
  // Ephemeral auth tokens are created via the v1alpha endpoint in the JS SDK.
  client ??= new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });
  return client;
}

let evalClient: GoogleGenAI | null = null;
export function getEvalAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diset. Tambahkan ke file .env.local lalu restart server.");
  }
  evalClient ??= new GoogleGenAI({ apiKey });
  return evalClient;
}

/** Run a structured-output (JSON schema) request and parse the result. */
export async function generateJson<T>(params: {
  input: string | Array<Record<string, unknown>>;
  schema: Record<string, unknown>;
}): Promise<T> {
  const ai = getEvalAI();
  const interaction = await ai.interactions.create({
    model: EVAL_MODEL,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: params.input as any,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: params.schema,
    },
    store: false,
  });
  const text = interaction.output_text;
  if (!text) throw new Error("Model tidak mengembalikan output.");
  return JSON.parse(text) as T;
}

export function errorResponse(err: unknown, status = 500) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[api]", message);
  return Response.json({ error: message }, { status });
}
