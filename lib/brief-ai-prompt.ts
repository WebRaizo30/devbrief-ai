/**
 * Groq/chat completion için sistem + kullanıcı mesajları.
 * Bu modülü yalnızca sunucu tarafı (route handler) içe aktarın — istemci bundle'ına sokmayın.
 */

import type {
  BriefSectionId,
  DetailLevel,
  OutputLocale,
} from "./brief-types";
import { BRIEF_SECTIONS } from "./brief-types";
import { SECTION_MARKDOWN_TITLE } from "./section-headings";

const LOCALE_LANGUAGE_NAME: Record<OutputLocale, string> = {
  en: "English",
  de: "German",
  fr: "French",
  it: "Italian",
};

/** Tahmini kelime üst bandı — model rehberi */
export const VERBOSITY_GUIDANCE: Record<DetailLevel, string> = {
  short: "about 280–450 words total for selected sections combined",
  medium: "about 550–950 words total for selected sections combined",
  long: "about 1100–1800 words total for selected sections combined",
};

function activeSectionTitles(
  sections: Record<BriefSectionId, boolean>,
  locale: OutputLocale
): { id: BriefSectionId; mdHeading: string; labelEn: string }[] {
  return BRIEF_SECTIONS.filter(({ id }) => sections[id]).map(({ id, label }) => ({
    id,
    mdHeading: SECTION_MARKDOWN_TITLE[id][locale],
    labelEn: label,
  }));
}

export function buildBriefMessages(args: {
  idea: string;
  sections: Record<BriefSectionId, boolean>;
  detail: DetailLevel;
  locale: OutputLocale;
}): { role: "system" | "user"; content: string }[] {
  const { idea, sections, detail, locale } = args;
  const titles = activeSectionTitles(sections, locale);
  const lang = LOCALE_LANGUAGE_NAME[locale];
  const v = VERBOSITY_GUIDANCE[detail];

  const sectionListText = titles
    .map(
      (t) =>
        `- Use exactly \`## ${t.mdHeading}\` as the heading for section id \`${t.id}\` (${t.labelEn} in UI).`
    )
    .join("\n");

  const system = [
    "You are DevBrief: a pragmatic product/engineering briefing assistant.",
    "Write ONE coherent project brief document in Markdown.",
    "",
    "Rules:",
    `- Entire reply body must be written in ${lang} (locale: ${locale}).`,
    `- Start with a single top-level line: \`# Project brief\` translated naturally into ${lang} (adapt the phrase; keep it as ONE H1).`,
    `- After the opening paragraph, output ONLY those sections requested below, IN THIS ORDER.`,
    `- Do not add extra top-level (\`#\`) headings besides the opening title.`,
    "- Under each ## section: use bullets (not walls of prose) unless a short bridging sentence helps.",
    "- Stay grounded in the pitch; clearly mark assumptions if the pitch lacks detail.",
    "- No invented stakeholder names.",
    `- Target length: ${v}. Prefer fewer sharper bullets when short.`,
    "",
    "Section heading contract:",
    sectionListText,
    "",
    "Respond with Markdown only — no preamble or apologies.",
  ].join("\n");

  const user = [
    "### Pitch seed",
    idea.trim(),
    "",
    "### Verbosity level",
    detail,
    "",
    "### Required section order (ids)",
    titles.map((t) => t.id).join(", "),
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
