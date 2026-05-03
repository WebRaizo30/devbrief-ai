import type { BriefSectionId, OutputLocale } from "./brief-types";

/** AI'nin çıktıda kullanacağı Markdown `##` başlıkları — seçilen çıktı diline uyumlu */
export const SECTION_MARKDOWN_TITLE: Record<
  BriefSectionId,
  Record<OutputLocale, string>
> = {
  summary: {
    en: "Summary",
    de: "Kurzfassung",
    fr: "Résumé",
    it: "Sommario",
  },
  techStack: {
    en: "Tech stack",
    de: "Technologie‑Stack",
    fr: "Stack technique",
    it: "Stack tecnologico",
  },
  milestones: {
    en: "Milestones",
    de: "Meilensteine",
    fr: "Jalons",
    it: "Milestone",
  },
  timeline: {
    en: "Timeline",
    de: "Zeitplan",
    fr: "Planning",
    it: "Cronoprogramma",
  },
  budget: {
    en: "Budget range",
    de: "Budgetrahmen",
    fr: "Fourchette budget",
    it: "Fascia di budget",
  },
};
