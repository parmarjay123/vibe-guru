export function formatToday(date: Date = new Date()) {
  return {
    label: date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    iso: date.toISOString().split("T")[0],
  };
}

/** Pass `todayIso` from the client (YYYY-MM-DD) so schedules match the user's calendar. */
export function buildDateContext(todayIso?: string): string {
  const date = todayIso
    ? new Date(`${todayIso}T12:00:00`)
    : new Date();
  const { label, iso } = formatToday(date);

  return `TODAY IS: ${label} (ISO: ${iso})
RULES:
- "Today" in Schedule MUST be exactly: ${label}
- Schedule starts from TODAY and counts forward to the deadline
- NEVER use May 2025, random past dates, or dates from your training data
- Always write full dates like "Tuesday, June 24, 2025" not just "May 25"`;
}

export function getClientTodayIso(): string {
  return new Date().toISOString().split("T")[0];
}
