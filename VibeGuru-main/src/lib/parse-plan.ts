export type PlanSection = {
  title: string;
  lines: string[];
};

export function parsePlanSections(markdown: string): PlanSection[] {
  const sections: PlanSection[] = [];
  let current: PlanSection | null = null;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { title: line.slice(3).trim(), lines: [] };
      continue;
    }

    if (current) {
      current.lines.push(line);
    } else if (!line.startsWith("#")) {
      if (!current) current = { title: "Plan", lines: [] };
      current.lines.push(line);
    }
  }

  if (current) sections.push(current);
  return sections;
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^>\s*/, "")
    .trim();
}

export function getQuadrantColor(q: string): string {
  if (q.includes("Q1")) return "bg-red-500/20 text-red-300 border-red-500/30";
  if (q.includes("Q2")) return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
  if (q.includes("Q3")) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  if (q.includes("Q4")) return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  return "bg-zinc-700/30 text-zinc-300 border-zinc-600/30";
}
