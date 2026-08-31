/**
 * Groq OpenAI-compatible chat client (free tier).
 * Docs: https://console.groq.com/docs
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function isGroqConfigured() {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export async function groqChat(opts: {
  messages: GroqMessage[];
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}): Promise<{ ok: true; content: string } | { ok: false; error: string }> {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) {
    return {
      ok: false,
      error: "GROQ_API_KEY is not set. Add it in .env from console.groq.com",
    };
  }

  // llama-3.3-70b-versatile shut down for free/dev (Aug 2026). Prefer env override.
  const model =
    process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 800,
        ...(opts.json
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        error: `Groq HTTP ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return { ok: false, error: "Empty response from Groq" };
    }
    return { ok: true, content };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Groq request failed",
    };
  }
}

export async function draftPatternTriggers(input: {
  title: string;
  difficulty?: string | null;
  pattern?: string | null;
  approach?: string | null;
  pitfalls?: string | null;
  notesMd?: string | null;
}): Promise<
  | { ok: true; items: Array<{ trigger: string; pattern: string; notes?: string }> }
  | { ok: false; error: string }
> {
  const result = await groqChat({
    json: true,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `You help DSA students build recognition skills. Given a LeetCode-style problem journal, return JSON:
{"items":[{"trigger":"short constraint/signal the interviewee notices","pattern":"algorithm pattern name","notes":"optional one-line tip"}]}
Return 2-4 high-quality trigger→pattern pairs. Triggers must be about constraints/wording, NOT the problem title. No spoilers beyond the pattern name.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          title: input.title,
          difficulty: input.difficulty,
          pattern: input.pattern,
          approach: input.approach,
          pitfalls: input.pitfalls,
          notes: input.notesMd?.slice(0, 2000),
        }),
      },
    ],
  });

  if (!result.ok) return result;

  try {
    const parsed = JSON.parse(result.content) as {
      items?: Array<{ trigger?: string; pattern?: string; notes?: string }>;
    };
    const items = (parsed.items ?? [])
      .filter((i) => i.trigger && i.pattern)
      .map((i) => ({
        trigger: String(i.trigger).slice(0, 200),
        pattern: String(i.pattern).slice(0, 80),
        notes: i.notes ? String(i.notes).slice(0, 300) : undefined,
      }));
    if (!items.length) {
      return { ok: false, error: "Groq returned no usable triggers" };
    }
    return { ok: true, items };
  } catch {
    return { ok: false, error: "Failed to parse Groq JSON" };
  }
}

export async function socraticHint(input: {
  title: string;
  difficulty?: string | null;
  tags?: string[];
  userGuess?: string;
  stage: "pattern" | "approach" | "stuck";
}): Promise<{ ok: true; hint: string } | { ok: false; error: string }> {
  const result = await groqChat({
    temperature: 0.5,
    maxTokens: 280,
    messages: [
      {
        role: "system",
        content: `You are a Socratic DSA coach. Never give the full solution or complete code. Ask one probing question OR give one tiny nudge (constraints → pattern). Max 3 short sentences. Stage=${input.stage}.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          title: input.title,
          difficulty: input.difficulty,
          tags: input.tags,
          studentSaid: input.userGuess,
        }),
      },
    ],
  });

  if (!result.ok) return result;
  return { ok: true, hint: result.content };
}
