"use client";

import * as React from "react";
import type { OutputLocale } from "@/lib/brief-types";

type Props = {
  text: string;
  locale: OutputLocale;
  onBack: () => void;
};

export function BriefOutput({ text, locale, onBack }: Props) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = React.useState(false);
  const L = COPY[locale];

  const openPreview = () => {
    dialogRef.current?.showModal();
    document.body.dataset.neoDialogOpen = "";
  };

  const closePreview = React.useCallback(() => {
    dialogRef.current?.close();
    delete document.body.dataset.neoDialogOpen;
  }, []);

  React.useEffect(() => {
    return () => {
      delete document.body.dataset.neoDialogOpen;
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const wc = React.useMemo(
    () => (text.trim().length ? text.trim().split(/\s+/).length : 0),
    [text],
  );
  const cc = text.length;

  const handleDownload = () => {
    const slug = locale.toUpperCase();
    const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devbrief-${slug}-${date}.txt`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <div className="neo-report-ready-shell flex min-h-0 flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-10 px-3 py-8 text-center sm:gap-12">
        <div>
          <span className="neo-ribbon">{L.badge}</span>
          <h2 className="neo-output-heading mt-6 max-w-xl text-pretty">{L.readyTitle}</h2>
          <p className="neo-output-meta mt-8 max-w-md text-[1rem] leading-snug">{L.readyHint}</p>
        </div>

        <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-6">
          <button
            type="button"
            onClick={openPreview}
            className="neo-btn-primary neo-btn-enhanced min-w-[12rem] uppercase"
          >
            {L.preview}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="neo-btn-secondary neo-btn-enhanced-secondary min-w-[12rem] uppercase"
          >
            {L.download}
          </button>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="neo-btn-enhanced-secondary text-[0.8125rem] font-black uppercase tracking-[0.12em] text-foreground underline decoration-[3px] underline-offset-[0.38em]"
        >
          {L.back}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="neo-brief-dialog"
        aria-labelledby="neo-brief-dlg-heading"
        onClose={() => delete document.body.dataset.neoDialogOpen}
      >
        <div
          className="neo-brief-dialog-scrim"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePreview();
          }}
        >
          <div
            className="neo-brief-dialog-panel neo-panel-enhanced neo-brief-dlg-shell flex min-h-0 w-full max-w-full max-h-[min(56rem,calc(100dvh-48px))] flex-col"
            role="document"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="neo-brief-dlg-head relative shrink-0 border-b-[3px] border-neo-border px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-7">
              <div className="flex flex-wrap items-start gap-6">
                <div
                  className="neo-brief-dlg-symbol shrink-0"
                  aria-hidden
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="neo-brief-dlg-kicker">{L.previewKicker}</p>
                  <h2
                    id="neo-brief-dlg-heading"
                    className="neo-brief-dlg-title mt-2 text-balance font-mono text-[clamp(1rem,3.2vw,1.2rem)] font-black uppercase leading-tight tracking-[0.1em]"
                  >
                    {L.previewTitle}
                  </h2>
                  <p className="neo-brief-dlg-lede mt-3 max-w-2xl text-pretty font-sans text-[0.9625rem] font-semibold leading-snug opacity-94">
                    {L.previewSubtitle}
                  </p>
                  <div className="neo-brief-dlg-chips mt-5 flex flex-wrap gap-3">
                    <span className="neo-brief-dlg-chip neo-brief-dlg-chip-accent">
                      {L.langLabel}
                    </span>
                    <span className="neo-brief-dlg-chip">
                      {L.wordCountTpl.replace("{count}", String(wc))}
                    </span>
                    <span className="neo-brief-dlg-chip">
                      {L.charCountTpl.replace("{count}", String(cc))}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="neo-brief-dlg-close neo-btn-enhanced-secondary shrink-0 uppercase"
                  onClick={closePreview}
                  aria-label={L.close}
                  title={L.close}
                >
                  <span className="sr-only">{L.close}</span>
                  <span aria-hidden className="text-xl font-black leading-none">
                    ×
                  </span>
                </button>
              </div>
            </header>

            <div className="neo-brief-dlg-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-8">
              <div className="neo-brief-dlg-paper">
                <pre className="neo-brief-dlg-pre whitespace-pre-wrap break-words font-mono text-[0.9175rem] font-normal leading-[1.74] tracking-[0.01em] text-foreground md:text-[0.9575rem]">
                  {text}
                </pre>
              </div>
            </div>

            <footer className="neo-brief-dlg-foot shrink-0 border-t-[3px] border-neo-border px-5 py-5 sm:px-8 sm:py-7">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <p className="neo-brief-dlg-foot-note max-w-md text-[0.85rem] font-semibold leading-snug opacity-92">
                  {L.previewFooterNote}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="neo-btn-primary neo-btn-enhanced uppercase"
                  >
                    {copied ? L.copied : L.copy}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="neo-btn-secondary neo-btn-enhanced-secondary uppercase"
                  >
                    {L.download}
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </dialog>
    </div>
  );
}

const COPY: Record<
  OutputLocale,
  {
    badge: string;
    readyTitle: string;
    readyHint: string;
    preview: string;
    previewTitle: string;
    previewKicker: string;
    previewSubtitle: string;
    previewFooterNote: string;
    wordCountTpl: string;
    charCountTpl: string;
    download: string;
    close: string;
    back: string;
    copy: string;
    copied: string;
    langLabel: string;
  }
> = {
  en: {
    badge: "Ready",
    readyTitle: "Brief report generated.",
    readyHint:
      "Brief is rendered by Groq on the server. Use Preview for a popup, or Download plain text.",
    preview: "Preview",
    previewTitle: "Brief preview",
    previewKicker: "Live AI · Groq",
    previewSubtitle:
      "Server-side inference (not canned copy). Scroll the document, then copy or export as plain text.",
    previewFooterNote:
      "Every run calls Groq in real time—double-check budgets, dates, and legal claims.",
    wordCountTpl: "{count} words",
    charCountTpl: "{count} chars",
    download: "Download",
    close: "Close",
    back: "Refine inputs",
    copy: "Copy brief",
    copied: "Copied",
    langLabel: "English",
  },
  de: {
    badge: "Fertig",
    readyTitle: "Brief‑Bericht erstellt.",
    readyHint:
      "Brief wird auf dem Server per Groq gerendert — „Vorschau“ Popup oder TXT speichern.",
    preview: "Vorschau",
    previewTitle: "Brief‑Vorschau",
    previewKicker: "Live-KI · Groq",
    previewSubtitle:
      "Inferenz auf dem Server (keine statische Vorlage). Scrollen, dann kopieren oder als Text speichern.",
    previewFooterNote:
      "Jeder Lauf ruft Groq in Echtzeit auf—Budgets, Termine und rechtliche Angaben bitte prüfen.",
    wordCountTpl: "{count} Wörter",
    charCountTpl: "{count} Zeichen",
    download: "Herunterladen",
    close: "Schließen",
    back: "Eingaben ändern",
    copy: "Brief kopieren",
    copied: "Kopiert",
    langLabel: "Deutsch",
  },
  fr: {
    badge: "Prêt",
    readyTitle: "Rapport de brief généré.",
    readyHint:
      "Le brief est généré côté serveur avec Groq — aperçu en fenêtre ou export texte.",
    preview: "Aperçu",
    previewTitle: "Aperçu du brief",
    previewKicker: "IA en direct · Groq",
    previewSubtitle:
      "Inférence côté serveur (pas de texte statique). Faites défiler, puis copiez ou exportez en brut.",
    previewFooterNote:
      "Chaque génération appelle Groq en temps réel—vérifiez budgets, échéances et mentions légales.",
    wordCountTpl: "{count} mots",
    charCountTpl: "{count} car.",
    download: "Télécharger",
    close: "Fermer",
    back: "Modifier les entrées",
    copy: "Copier le brief",
    copied: "Copié",
    langLabel: "Français",
  },
  it: {
    badge: "Pronto",
    readyTitle: "Report del brief creato.",
    readyHint:
      "Il brief viene generato lato server con Groq — anteprima o download testuale.",
    preview: "Anteprima",
    previewTitle: "Anteprima brief",
    previewKicker: "IA live · Groq",
    previewSubtitle:
      "Inferenza lato server (non testo precompilato). Scorri il testo, poi copia o esporta in testo.",
    previewFooterNote:
      "Ogni generazione chiama Groq in tempo reale—verifica budget, scadenze e affermazioni legali.",
    wordCountTpl: "{count} parole",
    charCountTpl: "{count} car.",
    download: "Scarica",
    close: "Chiudi",
    back: "Modifica scelte",
    copy: "Copia brief",
    copied: "Copiato",
    langLabel: "Italiano",
  },
};
