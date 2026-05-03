"use client";

import * as React from "react";

import {
  type BriefSectionId,
  type DetailLevel,
  BRIEF_SECTIONS,
  OUTPUT_LOCALES,
  type OutputLocale,
} from "@/lib/brief-types";

type Props = {
  idea: string;
  setIdea: (v: string) => void;
  sections: Record<BriefSectionId, boolean>;
  toggleSection: (id: BriefSectionId) => void;
  detail: DetailLevel;
  setDetail: (d: DetailLevel) => void;
  locale: OutputLocale;
  setLocale: (l: OutputLocale) => void;
  onSubmit: () => void;
  disabled: boolean;
};

const DETAIL_KEYS: DetailLevel[] = ["short", "medium", "long"];

const WIZARD_STEPS = [
  { num: "01", label: "Pitch", key: "pitch" },
  { num: "02", label: "Sections", key: "sections" },
  { num: "03", label: "Scope", key: "scope" },
  { num: "04", label: "Run", key: "run" },
] as const;

const SWIPE_PX = 52;

export function BriefForm({
  idea,
  setIdea,
  sections,
  toggleSection,
  detail,
  setDetail,
  locale,
  setLocale,
  onSubmit,
  disabled,
}: Props) {
  const hasSection = Object.values(sections).some(Boolean);

  const [step, setStep] = React.useState(0);
  const [maxVisited, setMaxVisited] = React.useState(0);
  const touchRef = React.useRef<{ x: number; y: number } | null>(null);

  const pitchOk = idea.trim().length >= 10;
  const sectionsOk = hasSection;
  const idxLast = WIZARD_STEPS.length - 1;

  const progressPct =
    (pitchOk ? 25 : 0) +
    (sectionsOk ? 25 : 0) +
    (step >= 2 ? 25 : 0) +
    (step >= idxLast && pitchOk && sectionsOk ? 25 : 0);

  const setStepVisited = React.useCallback((target: number) => {
    setStep(target);
    setMaxVisited((m) => Math.max(m, target));
  }, []);

  const canLeaveStep = React.useCallback(
    (i: number) => {
      if (i === 0) return pitchOk;
      if (i === 1) return sectionsOk;
      return true;
    },
    [pitchOk, sectionsOk]
  );

  const goNext = React.useCallback(() => {
    if (!canLeaveStep(step) || step >= idxLast) return;
    const next = step + 1;
    setStep(next);
    setMaxVisited((m) => Math.max(m, next));
  }, [canLeaveStep, idxLast, step]);

  const goPrev = React.useCallback(() => {
    if (step <= 0) return;
    setStep((s) => s - 1);
  }, [step]);

  const onRailClick = React.useCallback(
    (target: number) => {
      if (target <= maxVisited) setStepVisited(target);
    },
    [maxVisited, setStepVisited]
  );

  const touchStart = React.useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    const p = e.touches[0];
    touchRef.current = { x: p.clientX, y: p.clientY };
  }, [disabled]);

  const touchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      const start = touchRef.current;
      touchRef.current = null;
      if (!start) return;
      const end = e.changedTouches[0];
      const dx = end.clientX - start.x;
      const dy = end.clientY - start.y;
      if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < SWIPE_PX) return;
      if (dx < 0) goNext();
      else goPrev();
    },
    [disabled, goNext, goPrev]
  );

  const sectionLabelsActive = React.useMemo(
    () =>
      BRIEF_SECTIONS.filter(({ id }) => sections[id]).map(({ label }) => label),
    [sections]
  );

  React.useEffect(() => {
    function onWinKey(ev: KeyboardEvent) {
      if (disabled) return;

      const ae = document.activeElement;
      if (ae instanceof HTMLTextAreaElement || ae instanceof HTMLInputElement) {
        return;
      }

      const t = ae as HTMLElement | undefined;
      if (t?.isContentEditable) return;

      if (ev.key === "ArrowRight") {
        if (step >= idxLast) return;
        if (!canLeaveStep(step)) return;
        ev.preventDefault();
        goNext();
      } else if (ev.key === "ArrowLeft" && step > 0) {
        ev.preventDefault();
        goPrev();
      }
    }

    window.addEventListener("keydown", onWinKey);
    return () => window.removeEventListener("keydown", onWinKey);
  }, [
    disabled,
    step,
    idxLast,
    canLeaveStep,
    goNext,
    goPrev,
  ]);

  return (
    <div className="neo-wizard min-h-0 w-full">
      <div
        className="neo-wizard-progress shrink-0"
        style={
          {
            "--neo-wizard-pct": String(progressPct),
          } as React.CSSProperties
        }
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      >
        <div className="neo-wizard-progress-inner">
          <div className="neo-wizard-progress-fill" />
        </div>
      </div>

      <div className="neo-wizard-rail-wrap">
        <div className="neo-wizard-rail" role="tablist" aria-label="Brief steps">
          {WIZARD_STEPS.map((s, i) => {
            const locked = i > maxVisited;
            const tabClass =
              step === i
                ? "neo-wizard-tab neo-wizard-tab--current"
                : "neo-wizard-tab";
            return (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={step === i}
                disabled={locked || disabled}
                className={tabClass}
                onClick={() => onRailClick(i)}
              >
                <span className="neo-wizard-tab-num">{s.num}</span>
                <span className="text-[0.765rem] font-black uppercase leading-tight tracking-[0.1em]">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="neo-wizard-viewport"
        role="presentation"
        onTouchStart={touchStart}
        onTouchEnd={touchEnd}
      >
        <div
          className="neo-wizard-track h-full"
          style={{ transform: `translateX(-${step * 25}%)` }}
        >
          <div className="neo-wizard-slide" aria-hidden={step !== 0}>
            <div className="neo-wizard-slide-inner">
              <section aria-labelledby="wf-h-pitch">
                <div className="neo-wf-row">
                  <span className="neo-pin" aria-hidden>
                    01
                  </span>
                  <div className="neo-wf-stack">
                    <h3 id="wf-h-pitch" className="neo-wf-heading">
                      Your pitch
                    </h3>
                    <p className="neo-wf-desc">
                      One coherent paragraph beats a spray of bullets—the model
                      extrapolates from grounded context instead of guesses.
                    </p>
                    <div className="neo-wf-body flex flex-col gap-4">
                      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-3">
                        <label htmlFor="idea" className="neo-field-label">
                          Idea
                        </label>
                        <span className="neo-count tabular-nums leading-none">
                          {idea.length}/3000
                        </span>
                      </div>
                      <textarea
                        id="idea"
                        name="idea"
                        value={idea}
                        maxLength={3000}
                        onChange={(e) => setIdea(e.target.value)}
                        disabled={disabled}
                        rows={10}
                        className="neo-field neo-field-textarea neo-field-enhanced neo-wizard-pitch-area"
                        placeholder='Example: “A bilingual marketplace linking independent furniture makers…”'
                        autoCorrect="off"
                        spellCheck={false}
                      />

                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="neo-wizard-slide" aria-hidden={step !== 1}>
            <div className="neo-wizard-slide-inner">
              <section aria-labelledby="wf-h-sections">
                <div className="neo-wf-row">
                  <span className="neo-pin" aria-hidden>
                    02
                  </span>
                  <div className="neo-wf-stack">
                    <h3 id="wf-h-sections" className="neo-wf-heading">
                      Brief sections
                    </h3>
                    <p className="neo-wf-desc">
                      Switch off anything you never want surfaced—leave at least
                      one heading so the exporter still produces a meaningful skeleton.
                    </p>
                    <div className="neo-wf-body">
                      <div className="neo-fieldset-flat">
                        <div className="flex flex-wrap gap-3 md:gap-3">
                          {BRIEF_SECTIONS.map(({ id, label }) => (
                            <button
                              key={id}
                              type="button"
                              disabled={disabled}
                              aria-pressed={sections[id]}
                              onClick={() => toggleSection(id)}
                              className={`neo-chip min-w-[10.75rem] flex-1 sm:min-w-[8.75rem] ${sections[id] ? "neo-chip-on" : "neo-chip-off"}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="neo-wizard-slide" aria-hidden={step !== 2}>
            <div className="neo-wizard-slide-inner">
              <section
                aria-labelledby="wf-h-scope"
                className="neo-w-scope-step"
              >
                <div className="neo-wf-row">
                  <span className="neo-pin" aria-hidden>
                    03
                  </span>
                  <div className="neo-wf-stack">
                    <h3 id="wf-h-scope" className="neo-wf-heading">
                      Verbosity & voice
                    </h3>
                    <p className="neo-wf-desc">
                      Decide how condensed the wording should be and which human
                      language Groq should target for the downloadable brief body.
                    </p>
                    <div className="neo-wf-body neo-wf-body--scope">
                      <div className="neo-scope-box">
                        <div className="neo-scope-col neo-scope-col-verbosity min-w-0">
                          <h4 className="neo-scope-row-heading">Verbosity</h4>
                          <div
                            role="group"
                            aria-label="Detail level"
                            className="neo-segment-shell neo-segment-shell--wizard-scope mt-3 flex flex-row flex-wrap"
                          >
                            {DETAIL_KEYS.map((d) => (
                              <button
                                key={d}
                                type="button"
                                disabled={disabled}
                                onClick={() => setDetail(d)}
                                className={`neo-detail-segment neo-detail-enhanced flex-1 ${detail === d ? "neo-segment-active" : ""}`}
                              >
                                {UI.detail[d]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="neo-scope-col neo-scope-col-locale min-w-0">
                          <h4 className="neo-scope-row-heading">
                            Output language
                          </h4>
                          <div className="neo-scope-lang-grid mt-3 grid grid-cols-2 gap-2 min-[760px]:grid-cols-4 min-[760px]:gap-1.5">
                            {OUTPUT_LOCALES.map((code) => (
                              <button
                                key={code}
                                type="button"
                                disabled={disabled}
                                onClick={() => setLocale(code)}
                                aria-pressed={locale === code}
                                className={`neo-lang-tile ${locale === code ? "neo-lang-tile-on" : ""}`}
                                title={`Brief output · ${LANGUAGE_NAMES[code]}`}
                              >
                                <span className="block text-[1.55rem] font-black leading-none tracking-tight lowercase sm:text-[1.7rem]">
                                  {code}
                                </span>
                                <span
                                  className={`neo-lang-name mt-2 block truncate ${locale === code ? "" : "neo-lang-off-name"}`}
                                >
                                  {LANGUAGE_NAMES[code]}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div
            className="neo-wizard-slide neo-wizard-review-slide"
            aria-hidden={step !== idxLast}
          >
            <div className="neo-wizard-slide-inner">
              <section aria-labelledby="wf-h-review">
                <div className="neo-wf-row items-start">
                  <span className="neo-pin" aria-hidden>
                    04
                  </span>
                  <div className="neo-wf-stack gap-4">
                    <div>
                      <h3 id="wf-h-review" className="neo-wf-heading">
                        Review &amp; generate
                      </h3>
                      <p className="neo-wf-desc">
                        Sanity-check inputs before sending—generation hits the
                        Groq API on submit and returns Markdown for preview / download.
                      </p>
                    </div>

                    <div className="neo-recap-panel flex flex-col gap-3 font-mono text-[0.836rem] font-semibold leading-relaxed md:text-[0.8675rem]">
                      <div>
                        <span className="neo-field-label opacity-92">Pitch</span>
                        <p className="neo-wizard-review-pitch mt-3 whitespace-pre-wrap break-words opacity-94">
                          {pitchOk ? idea.trim() : "Too short (<10 chars) — refine first."}
                        </p>
                      </div>

                      <div>
                        <span className="neo-field-label opacity-92">Sections</span>
                        <p className="mt-3 opacity-94">
                          {sectionsOk
                            ? sectionLabelsActive.join(" · ")
                            : "Activate at least one section."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-5 opacity-94">
                        <div>
                          <span className="neo-field-label opacity-92">
                            Verbosity
                          </span>
                          <p className="mt-3 uppercase">{UI.detail[detail]}</p>
                        </div>
                        <div>
                          <span className="neo-field-label opacity-92">
                            Language
                          </span>
                          <p className="mt-3">
                            <span className="font-black uppercase">{locale}</span>
                            {" · "}
                            {LANGUAGE_NAMES[locale]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!sectionsOk ? (
                      <p className="neo-hint-warn text-center">
                        Toggle at least one section before sending—generation halts entirely
                        if all chips are inactive.
                      </p>
                    ) : !pitchOk ? (
                      <p className="neo-hint-warn text-center">
                        Add ten or more typed characters—we need a substantive seed even if it is messy.
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={onSubmit}
                      disabled={
                        disabled || idea.trim().length < 10 || !hasSection
                      }
                      className="neo-btn-primary neo-btn-enhanced w-full uppercase"
                    >
                      Generate brief
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="neo-wizard-foot">
        <div className="justify-self-start">
          <button
            type="button"
            onClick={goPrev}
            disabled={disabled || step <= 0}
            className="neo-btn-secondary neo-btn-enhanced-secondary uppercase"
          >
            Back
          </button>
        </div>

        <p className="neo-wizard-caption text-center">
          Step {WIZARD_STEPS[step].num} · {WIZARD_STEPS[step].label}
          <span className="hidden sm:inline">{` · ${progressPct}%`}</span>
        </p>

        <div className="flex justify-self-end justify-end">
          {step < idxLast ? (
            <button
              type="button"
              onClick={goNext}
              disabled={
                disabled || step >= idxLast || !canLeaveStep(step)
              }
              className="neo-btn-primary neo-btn-enhanced uppercase"
            >
              Next
            </button>
          ) : (
            <span
              aria-hidden
              className="inline-flex min-h-[3.125rem] min-w-[6.75rem]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

const UI = {
  detail: {
    short: "Short",
    medium: "Medium",
    long: "Long",
  },
} as const;

const LANGUAGE_NAMES: Record<OutputLocale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
};
