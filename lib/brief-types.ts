/** Brief options — stable ids for API */

export type BriefSectionId =
  | "summary"
  | "techStack"
  | "milestones"
  | "timeline"
  | "budget";

/** Section toggle labels — UI chrome stays English */
export const BRIEF_SECTIONS: readonly {
  id: BriefSectionId;
  label: string;
}[] = [
  { id: "summary", label: "Summary" },
  { id: "techStack", label: "Tech stack" },
  { id: "milestones", label: "Milestones" },
  { id: "timeline", label: "Timeline" },
  { id: "budget", label: "Budget range" },
] as const;

export type DetailLevel = "short" | "medium" | "long";

export const OUTPUT_LOCALES = ["en", "de", "fr", "it"] as const;
export type OutputLocale = (typeof OUTPUT_LOCALES)[number];
