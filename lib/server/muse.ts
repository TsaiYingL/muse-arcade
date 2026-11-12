// Thin Muse client: OpenAI-compatible Responses API at api.meta.ai, strict JSON output, timing.
import OpenAI from "openai";

export const MODELS = {
  spark: "muse-spark-1.3",
  ember: "muse-ember-1.0",
} as const;

let client: OpenAI | null = null;
function muse() {
  if (!client) {
    const apiKey = process.env.MUSE_API_KEY;
    if (!apiKey) throw new Error("MUSE_API_KEY is not set");
    client = new OpenAI({ apiKey, baseURL: "https://api.meta.ai/v1", timeout: 90_000, maxRetries: 0 });
  }
  return client;
}

type Content =
  | string
  | { type: "input_text"; text: string }[]
  | ({ type: "input_text"; text: string } | { type: "input_image"; image_url: string; detail: "auto" })[];

export const hasKey = () => !!process.env.MUSE_API_KEY;

export interface JsonCall {
  model: keyof typeof MODELS;
  effort?: "low" | "medium" | "high";
  instructions: string;
  input: Content;
  schemaName: string;
  schema: Record<string, unknown>;
  label: string; // for logs
  webSearch?: boolean;
  timeoutMs?: number; // fail fast and retry instead of hanging on a dead connection
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Retries network blips, 429s and 5xx with backoff; anything else surfaces immediately.
export async function museJson<T>(c: JsonCall): Promise<{ data: T; ms: number }> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await museJsonOnce<T>(c);
    } catch (e) {
      const status = (e as { status?: number }).status;
      const retryable = status === undefined || status === 429 || status >= 500;
      if (!retryable || attempt >= 2) throw e;
      console.warn(`[muse] ${c.label} retry ${attempt + 1}: ${(e as Error).message}`);
      await sleep(600 * 2 ** attempt);
    }
  }
}

async function museJsonOnce<T>(c: JsonCall): Promise<{ data: T; ms: number }> {
  const start = Date.now();
  const res = await muse().responses.create({
    model: MODELS[c.model],
    reasoning: { effort: c.effort ?? "low" },
    instructions: c.instructions,
    input: typeof c.input === "string" ? c.input : [{ role: "user", content: c.input }],
    text: { format: { type: "json_schema", name: c.schemaName, schema: c.schema, strict: true } },
    ...(c.webSearch ? { tools: [{ type: "web_search" }] } : {}),
  } as never, { timeout: c.timeoutMs ?? (c.model === "ember" ? 25_000 : 60_000) });
  const ms = Date.now() - start;
  // With tools, Muse may narrate between searches; the final message carries the JSON.
  const r = res as unknown as { output?: { type: string; content?: { text?: string }[] }[] };
  const last = (r.output ?? []).filter((o) => o.type === "message").at(-1);
  const text = (last?.content ?? []).map((x) => x.text ?? "").join("");
  console.log(`[muse] ${c.label} ${MODELS[c.model]} ${ms}ms`);
  return { data: JSON.parse(text) as T, ms };
}

// Strict mode wants every property required; nullable is expressed as a type union.
export const nullable = (t: string) => ({ type: [t, "null"] });
