import { NextResponse } from "next/server";

import { briefRequestIdentity, consumeBriefQuota } from "@/lib/brief-rate-limit";
import { buildBriefMessages } from "@/lib/brief-ai-prompt";
import {
  type BriefSectionId,
  type DetailLevel,
  BRIEF_SECTIONS,
  OUTPUT_LOCALES,
  type OutputLocale,
} from "@/lib/brief-types";

export const runtime = "nodejs";

/** Groq çıktısı yüksek çıktılar için zaman sınırı (Vercel vb. uyumlu) */
export const maxDuration = 60;

const IDEA_MAX = 3000;

const MAX_COMPLETION_BY_DETAIL: Record<DetailLevel, number> = {
  short: 2200,
  medium: 4500,
  long: 8000,
};

function isBriefSectionRecord(
  raw: unknown
): raw is Record<BriefSectionId, boolean> {
  if (!raw || typeof raw !== "object") return false;
  const obj = raw as Record<string, unknown>;
  let okCount = 0;
  for (const { id } of BRIEF_SECTIONS) {
    const v = obj[id];
    if (typeof v !== "boolean") return false;
    if (v) okCount++;
  }
  return okCount > 0;
}

function validateBody(value: unknown):
  | { ok: true; data: {
      idea: string;
      sections: Record<BriefSectionId, boolean>;
      detail: DetailLevel;
      locale: OutputLocale;
    }}
  | { ok: false; status: number; message: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, status: 400, message: "Invalid JSON body." };
  }
  const body = value as Record<string, unknown>;
  const idea = typeof body.idea === "string" ? body.idea.trim() : "";
  const detail = body.detail as DetailLevel;
  const locale = body.locale as OutputLocale;
  const sections = body.sections;

  if (!idea || idea.length < 10 || idea.length > IDEA_MAX) {
    return {
      ok: false,
      status: 400,
      message: `Pitch must be between 10 and ${IDEA_MAX} characters.`,
    };
  }
  if (detail !== "short" && detail !== "medium" && detail !== "long") {
    return { ok: false, status: 400, message: "Invalid detail level." };
  }
  if (!OUTPUT_LOCALES.includes(locale as OutputLocale)) {
    return { ok: false, status: 400, message: "Invalid locale." };
  }
  if (!isBriefSectionRecord(sections)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid sections payload (need booleans per id, ≥1 enabled).",
    };
  }

  return {
    ok: true,
    data: {
      idea,
      sections,
      detail,
      locale: locale as OutputLocale,
    },
  };
}

type GroqChatResponse = {
  choices?: Array<{
    finish_reason?: string;
    message?: { content?: string | null | unknown[] };
  }>;
  error?: { message?: string };
};

function extractCompletionText(parsed: GroqChatResponse): string {
  const content = parsed.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (
          typeof part === "object" &&
          part !== null &&
          "text" in part &&
          typeof (part as { text?: unknown }).text === "string"
        ) {
          return (part as { text: string }).text;
        }
        return "";
      })
      .join("")
      .trim();
  }
  return "";
}

/** Anahtarı asla sızdırmaz — env ve model etiketi kontrolü (tarayıcıda test için). */
export async function GET() {
  const key = !!process.env.GROQ_API_KEY?.trim();
  const model =
    process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
  return NextResponse.json(
    {
      ok: true,
      groqConfigured: key,
      model,
      hint:
        key
          ? null
          : "Add GROQ_API_KEY to web/.env or web/.env.local and restart npm run dev.",
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  const id = briefRequestIdentity(req);
  const quota = consumeBriefQuota(id);
  if (!quota.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "ratelimit",
        message:
          "Too many brief generations from this session. Wait a minute and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(quota.retryAfterSeconds),
        },
      }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "parse", message: "Body must be JSON." },
      { status: 400 }
    );
  }

  const valid = validateBody(json);
  if (!valid.ok) {
    return NextResponse.json(
      { ok: false, error: "validation", message: valid.message },
      { status: valid.status }
    );
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model =
    process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_key",
        message:
          "Server has no GROQ_API_KEY. Add it to web/.env or web/.env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  const messages = buildBriefMessages(valid.data);
  const maxTokens = MAX_COMPLETION_BY_DETAIL[valid.data.detail];

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 55000);

  try {
    const upstream = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.45,
          max_tokens: maxTokens,
          top_p: 0.92,
        }),
      }
    );

    clearTimeout(to);

    const raw = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const groqErr = raw as GroqChatResponse;
      const msg =
        groqErr?.error?.message ||
        `Groq upstream error (${upstream.status}).`;

      console.error("[api/brief] Groq HTTP", upstream.status, raw);

      return NextResponse.json(
        { ok: false, error: "groq_upstream", message: msg },
        { status: 502 }
      );
    }

    const parsed = raw as GroqChatResponse;

    const finishReason = parsed.choices?.[0]?.finish_reason;
    if (
      finishReason &&
      finishReason !== "stop" &&
      finishReason !== "end_turn"
    ) {
      console.warn("[api/brief] finish_reason", finishReason);
    }

    const text = extractCompletionText(parsed);

    if (!text) {
      console.error("[api/brief] empty completion", parsed);
      return NextResponse.json(
        {
          ok: false,
          error: "empty",
          message: "Model returned an empty brief. Retry or shorten input.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, text }, { status: 200 });
  } catch (e) {
    clearTimeout(to);
    const aborted = e instanceof Error && e.name === "AbortError";
    console.error("[api/brief]", e);
    return NextResponse.json(
      {
        ok: false,
        error: aborted ? "timeout" : "unknown",
        message: aborted
          ? "Brief generation timed out. Try lowering verbosity."
          : "Unexpected server error while calling Groq.",
      },
      { status: aborted ? 504 : 500 }
    );
  }
}
