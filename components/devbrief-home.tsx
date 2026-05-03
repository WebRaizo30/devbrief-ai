"use client";

import * as React from "react";
import { BriefForm } from "@/components/brief-form";
import { BriefOutput } from "@/components/brief-output";
import { NeoConduitBackdrop } from "@/components/neo-conduit-backdrop";
import { ThemeToggle } from "@/components/theme-toggle";
import type { BriefSectionId, DetailLevel, OutputLocale } from "@/lib/brief-types";
import { BRIEF_SECTIONS } from "@/lib/brief-types";

type ViewMode = "form" | "loading" | "result";

const defaultSections: Record<BriefSectionId, boolean> = {
  summary: true,
  techStack: true,
  milestones: true,
  timeline: true,
  budget: true,
};

const GROQ_TOAST_DISMISS_STORAGE = "devbrief-groq-toast-dismissed";

export function DevBriefHome() {
  const [groqToastOpen, setGroqToastOpen] = React.useState(true);

  React.useEffect(() => {
    try {
      if (globalThis.localStorage?.getItem(GROQ_TOAST_DISMISS_STORAGE) === "1") {
        setGroqToastOpen(false);
      }
    } catch {
      /* ignore quota / SSR */
    }
  }, []);

  const dismissGroqToast = React.useCallback(() => {
    try {
      globalThis.localStorage?.setItem(GROQ_TOAST_DISMISS_STORAGE, "1");
    } catch {
      /* ignore */
    }
    setGroqToastOpen(false);
  }, []);

  const [idea, setIdea] = React.useState("");
  const [sections, setSections] =
    React.useState<Record<BriefSectionId, boolean>>(defaultSections);
  const [detail, setDetail] = React.useState<DetailLevel>("medium");
  const [locale, setLocale] = React.useState<OutputLocale>("en");
  const [view, setView] = React.useState<ViewMode>("form");
  const [briefText, setBriefText] = React.useState("");

  const toggleSection = React.useCallback((id: BriefSectionId) => {
    setSections((prev) => {
      const enabledCount = Object.values(prev).filter(Boolean).length;
      if (prev[id] && enabledCount <= 1) return prev;
      return { ...prev, [id]: !prev[id] };
    });
  }, []);

  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = React.useCallback(async () => {
    const trimmed = idea.trim();
    if (trimmed.length < 10) return;

    let count = 0;
    BRIEF_SECTIONS.forEach(({ id }) => {
      if (sections[id]) count += 1;
    });
    if (count === 0) return;

    setSubmitError(null);
    const selected = sections;

    setView("loading");

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: trimmed,
          sections: selected,
          detail,
          locale,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        text?: string;
        message?: string;
      };

      if (!res.ok || !data.ok || typeof data.text !== "string") {
        const hint =
          data.message?.trim() ||
          (res.status === 503
            ? "Set GROQ_API_KEY in web/.env or web/.env.local and restart the dev server."
            : "Generation failed.");
        throw new Error(hint);
      }

      setBriefText(data.text);
      setView("result");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Network or server error.";
      setSubmitError(msg);
      setView("form");
    }
  }, [idea, sections, detail, locale]);

  const handleBack = React.useCallback(() => {
    setSubmitError(null);
    setView("form");
  }, []);

  return (
    <>
    <div className="relative flex h-[100dvh] flex-col overflow-hidden overscroll-none font-[family-name:var(--font-geist-sans)]">
      <div className="pointer-events-none absolute inset-0 neo-bg-visual" aria-hidden>
        <NeoConduitBackdrop />
      </div>

      <div className="relative z-[1] neo-shell flex min-h-0 flex-1 flex-col py-6 sm:py-8">
        <header className="flex shrink-0 flex-col gap-6 pb-8">
          <div className="flex items-start justify-between gap-8">
            <h1 className="neo-headline-shell text-balance">DevBrief</h1>
            <ThemeToggle />
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="neo-kicker">AI briefing</span>
            <span className="rounded-[3px] border-[3px] border-neo-border bg-[var(--neo-panel-bg)] px-5 py-2.5 font-mono text-sm font-black uppercase tracking-wide text-foreground">
              MVP lab build
            </span>
          </div>

          <p className="max-w-prose text-base font-semibold leading-snug text-foreground sm:text-[1.05rem]">
            One card, fixed viewport—the bar fills as checkpoints pass; steps slide sideways
            (swipe), or use Back / Next. The step pane stretches to fill the viewport without
            a page-level scrollbar inside the bordered content area.
          </p>
        </header>

        <main className="flex min-h-0 flex-1 flex-col pb-6">
          <div className="neo-panel neo-panel-enhanced flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
            {view === "form" && (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
                {submitError ? (
                  <p
                    className="neo-hint-warn mx-px mb-5 shrink-0 px-5 py-4 text-[0.9rem]"
                    role="alert"
                  >
                    {submitError}
                  </p>
                ) : null}
                <BriefForm
                  idea={idea}
                  setIdea={setIdea}
                  sections={sections}
                  toggleSection={toggleSection}
                  detail={detail}
                  setDetail={setDetail}
                  locale={locale}
                  setLocale={setLocale}
                  onSubmit={() => void handleSubmit()}
                  disabled={false}
                />
              </div>
            )}

            {view === "loading" && (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-10 px-5 py-12">
                <span
                  className="neo-spinner neo-spinner-lg ring-neo-spinner"
                  aria-hidden
                />
                <div className="text-center px-5">
                  <p className="font-mono text-[0.9rem] font-black uppercase tracking-[0.4em] text-foreground opacity-98">
                    Generating report
                  </p>
                  <p className="mt-8 text-[1.65rem] font-black uppercase tracking-wide leading-tight sm:text-[2rem]">
                    Building brief…
                  </p>
                  <p className="mx-auto mt-8 max-w-md text-[1rem] leading-snug opacity-94 sm:text-[1.06rem]">
                    Calling Groq on the server; then Preview (popup) or Download
                    the text—no inline preview beforehand.
                  </p>
                </div>
              </div>
            )}

            {view === "result" && (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-7">
                <BriefOutput
                  text={briefText}
                  locale={locale}
                  onBack={handleBack}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>

    {groqToastOpen ? (
      <aside className="neo-home-ai-toast" role="status" aria-live="polite">
        <button
          type="button"
          className="neo-home-ai-toast-dismiss neo-btn-enhanced-secondary"
          onClick={dismissGroqToast}
          aria-label="Dismiss Groq inference notice"
        >
          <span aria-hidden className="text-lg font-black leading-none">
            ×
          </span>
        </button>
        <span className="neo-home-ai-indicator shrink-0" aria-hidden />
        <div className="neo-home-ai-toast-copy min-w-0 text-left">
          <p className="neo-home-ai-title" id="groq-toast-heading">
            Groq-connected inference
          </p>
          <p className="neo-home-ai-body">
            Each brief is produced by live LLM calls from our Next.js route to Groq&apos;s
            inference API—not placeholder or offline samples. Responses change with every
            request.
          </p>
        </div>
      </aside>
    ) : null}
    </>
  );
}
