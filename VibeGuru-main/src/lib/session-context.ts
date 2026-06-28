import { buildAvailabilityRules } from "./availability";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type PlanSessionContext = {
  task: string;
  deadline: string;
  dailyHours: string;
  originalBlocker: string;
  constraints: string[];
  currentPlan?: string;
  chatHistory?: ChatTurn[];
};

export function getAllConstraints(
  originalBlocker: string,
  constraints: string[]
): string[] {
  const merged = [...constraints];
  const trimmed = originalBlocker?.trim();
  if (trimmed && !merged.some((c) => c.trim() === trimmed)) {
    merged.unshift(trimmed);
  }
  return [...new Set(merged.filter(Boolean))];
}

export function formatSessionContext(ctx: PlanSessionContext): string {
  const uniqueConstraints = getAllConstraints(
    ctx.originalBlocker,
    ctx.constraints
  );

  const constraintBlock =
    uniqueConstraints.length > 0
      ? uniqueConstraints.map((c, i) => `${i + 1}. ${c}`).join("\n")
      : "None specified";

  const availabilityRules = buildAvailabilityRules(
    uniqueConstraints,
    ctx.originalBlocker,
    ctx.dailyHours
  );

  const recentChat = (ctx.chatHistory ?? [])
    .filter((m) => m.content.trim())
    .slice(-12)
    .map((m) => `${m.role === "user" ? "USER" : "VIBEGURU"}: ${m.content}`)
    .join("\n\n");

  return `=== SESSION MEMORY ===

PERMANENT CONSTRAINTS (HARD RULES — never ignore):
${constraintBlock}

=== COMPUTED AVAILABILITY (schedule ONLY in allowed windows) ===
${availabilityRules}

Task: ${ctx.task}
Deadline: ${ctx.deadline}
Daily work budget: ${ctx.dailyHours}

${ctx.currentPlan ? `--- CURRENT PLAN ---\n${ctx.currentPlan}\n--- END PLAN ---\n` : ""}
${recentChat ? `--- CONVERSATION HISTORY ---\n${recentChat}\n--- END HISTORY ---\n` : ""}`;
}

export function mergeConstraint(
  existing: string[],
  addition: string
): string[] {
  const trimmed = addition.trim();
  if (!trimmed) return existing;
  if (existing.some((c) => c.trim() === trimmed)) return existing;
  return [...existing, trimmed];
}
