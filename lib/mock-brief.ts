import {
  type BriefSectionId,
  type DetailLevel,
  type OutputLocale,
  BRIEF_SECTIONS,
} from "./brief-types";

type BuildArgs = {
  idea: string;
  sections: Record<BriefSectionId, boolean>;
  detail: DetailLevel;
  locale: OutputLocale;
};

function clip(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

const VERBOSITY: Record<OutputLocale, Record<DetailLevel, string>> = {
  en: { short: "concise", medium: "balanced", long: "detailed" },
  de: {
    short: "kompakt",
    medium: "ausgewogen",
    long: "ausführlich",
  },
  fr: { short: "concise", medium: "standard", long: "détaillé" },
  it: { short: "sintetico", medium: "bilanciato", long: "approfondito" },
};

function timelineCopy(locale: OutputLocale, v: string): string {
  switch (locale) {
    case "de":
      return `Zeitrahmen · Typisches Fenster bei ${v} Tiefe (Konkretisierung im Scoping).`;
    case "fr":
      return `Planning · Horizon typique « ${v} » (affiné au cadrage).`;
    case "it":
      return `Tempistiche · Fascia tipo con dettaglio ${v} (definito in scope).`;
    default:
      return `Timeline · Typical horizon at ${v} depth (narrowed when scoping).`;
  }
}

function budgetCopy(locale: OutputLocale, v: string): string {
  switch (locale) {
    case "de":
      return `Budget · Freelancer‑Band zur ${v} Umfangsstufe (grobe Orientierung).`;
    case "fr":
      return `Budget · Fourchette freelance pour un niveau « ${v} » (ordre de grandeur).`;
    case "it":
      return `Budget · Fascia freelance per livello ${v} (ordine di grandezza).`;
    default:
      return `Budget · Freelance‑market band at ${v} scope level (orientation).`;
  }
}

const BASE = {
  summary: {
    en: "Summary · Problem framing and measurable goals from your pitch.",
    de: "Kurzfassung · Problemrahmen und messbare Ziele aus deinem Pitch.",
    fr: "Résumé · Cadrage du problème et objectifs mesurables issus du pitch.",
    it: "Sommario · Quadro problema e obiettivi misurabili dal pitch.",
  },
  techStack: {
    en: "Tech stack · Pragmatic web/mobile foundations before procurement.",
    de: "Technologie · Praktische Web/Mobile‑Basics vor Ausschreibung.",
    fr: "Stack · Socle web/mobile pragmatique avant appel d’offres léger.",
    it: "Stack · Fondazioni web/mobile pragmatiche ante approvvigionamento.",
  },
  milestones: {
    en: "Milestones · Discovery → MVP → validation → hardening checkpoints.",
    de: "Meilensteine · Discovery → MVP → Validierung → Härtungs‑Checks.",
    fr: "Jalons · Découverte → MVP → validation → jalons de durcissement.",
    it: "Milestone · Discovery → MVP → validazione → gate di hardening.",
  },
};

const HEAD = {
  en: {
    title: "# Project brief — placeholder (pre-API)",
    ideaLabel: "Idea",
    modeLabel: "Mode",
    footer: "Placeholder output until Groq is connected.",
  },
  de: {
    title: "# Projektbrief — Platzhalter (vor API)",
    ideaLabel: "Idee",
    modeLabel: "Tiefe",
    footer: "Platzhalter bis Groq angebunden ist.",
  },
  fr: {
    title: "# Fiche projet — espace réservé (avant API)",
    ideaLabel: "Idée",
    modeLabel: "Détail",
    footer: "Texte fictif jusqu’à branchement Groq.",
  },
  it: {
    title: "# Brief di progetto — segnaposto (pre-API)",
    ideaLabel: "Idea",
    modeLabel: "Dettaglio",
    footer: "Testo di esempio fino al collegamento Groq.",
  },
} satisfies Record<OutputLocale, { title: string; ideaLabel: string; modeLabel: string; footer: string }>;

export function buildPlaceholderBrief({
  idea,
  sections,
  detail,
  locale,
}: BuildArgs): string {
  const v = VERBOSITY[locale][detail];
  const H = HEAD[locale];
  const ideaBlock = clip(idea, 1200);

  const lines = [
    H.title,
    "",
    `${H.ideaLabel}:`,
    ideaBlock,
    "",
    `${H.modeLabel} · ${v}`,
    "",
  ];

  const bulletsFull: Record<BriefSectionId, string> = {
    summary: BASE.summary[locale],
    techStack: BASE.techStack[locale],
    milestones: BASE.milestones[locale],
    timeline: timelineCopy(locale, v),
    budget: budgetCopy(locale, v),
  };

  BRIEF_SECTIONS.forEach(({ id }) => {
    if (!sections[id]) return;
    lines.push(`- ${bulletsFull[id]}`);
  });

  lines.push("", "---", H.footer);

  return lines.join("\n");
}
