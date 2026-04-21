import { AXON_RULES_SECTIONS } from "@/lib/axon-rules-content";

/** Full rulebook as markdown — used when `rules.md` is missing or too short. */
export function rulesMarkdownFromSections(): string {
  const parts: string[] = [
    "# Axon Funded — Official Trading Rules",
    "",
    "_This text is derived from the same source as `/rules` on the site._",
    "",
  ];

  for (const sec of AXON_RULES_SECTIONS) {
    parts.push(`## ${sec.title}`, "");
    if (sec.paragraphs?.length) {
      for (const p of sec.paragraphs) {
        parts.push(p, "");
      }
    }
    if (sec.subsections?.length) {
      for (const sub of sec.subsections) {
        parts.push(`### ${sub.title}`, "");
        for (const p of sub.paragraphs) {
          parts.push(p, "");
        }
      }
    }
  }

  return parts.join("\n").trim() + "\n";
}
