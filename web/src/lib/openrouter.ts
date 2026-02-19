/**
 * OpenRouter streaming client for recipe generation.
 * Server-side only — called from API endpoints.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const HTTP_REFERER = (import.meta.env.OPENROUTER_HTTP_REFERER as string) || "https://dogkit.vercel.app";
const APP_TITLE = (import.meta.env.OPENROUTER_APP_TITLE as string) || "Dogology Recipe Generator";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamOptions {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

type OpenRouterChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

function hasTextPart(value: unknown): value is { text: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "text" in value &&
    typeof (value as { text?: unknown }).text === "string"
  );
}

/**
 * Stream a chat completion from OpenRouter.
 * Returns a ReadableStream of SSE-formatted text chunks.
 */
export async function streamChatCompletion(
  apiKey: string,
  opts: StreamOptions,
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": HTTP_REFERER,
      "X-Title": APP_TITLE,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 4096,
      stream: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }

  if (!res.body) {
    throw new Error("OpenRouter returned no body");
  }

  return res.body;
}

/**
 * Non-streaming chat completion (for image generation prompts).
 */
export async function chatCompletion(
  apiKey: string,
  opts: Omit<StreamOptions, "max_tokens"> & { max_tokens?: number },
): Promise<string> {
  const data = await chatCompletionRaw(apiKey, opts);
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((p) => {
        if (typeof p === "string") return p;
        if (hasTextPart(p)) return p.text;
        return "";
      })
      .filter(Boolean)
      .join("");
  }
  return "";
}

/**
 * Non-streaming chat completion returning the full JSON response.
 * Use this when you need to parse structured model outputs (images, tool calls, parts).
 */
export async function chatCompletionRaw(
  apiKey: string,
  opts: Omit<StreamOptions, "max_tokens"> & { max_tokens?: number },
): Promise<OpenRouterChatCompletionResponse> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": HTTP_REFERER,
      "X-Title": APP_TITLE,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 4096,
      stream: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }

  return (await res.json()) as OpenRouterChatCompletionResponse;
}
