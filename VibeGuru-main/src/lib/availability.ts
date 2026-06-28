/** Parse constraints → work windows + validate generated schedules */

export type TimeWindow = {
  startMin: number;
  endMin: number;
  label: string;
  type: "work" | "blocked" | "break";
};

function collectText(constraints: string[], originalBlocker: string): string {
  return [...constraints, originalBlocker].filter(Boolean).join(" | ");
}

export function parseTimeToMinutes(timeStr: string): number {
  const m = timeStr.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return -1;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const period = m[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

function minutesToLabel(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return m > 0
    ? `${h}:${m.toString().padStart(2, "0")} ${period}`
    : `${h}:00 ${period}`;
}

function extractBlockedRanges(text: string): { start: string; end: string }[] {
  const ranges: { start: string; end: string }[] = [];
  const lower = text.toLowerCase();

  if (
    !/not free|not available|unavailable|office|busy|cannot|can't|blocked|swamped|meeting/i.test(
      lower
    )
  ) {
    return ranges;
  }

  const patterns = [
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*(?:-|–|—|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi,
    /between\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+(?:and|to)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      ranges.push({
        start: match[1].trim().toUpperCase(),
        end: match[2].trim().toUpperCase(),
      });
    }
  }

  return ranges;
}

function extractBreaks(
  text: string
): { durationMin: number; before?: string; after?: string }[] {
  const breaks: { durationMin: number; before?: string; after?: string }[] = [];
  const lower = text.toLowerCase();

  if (!/break|refreshment|rest|buffer/i.test(lower)) return breaks;

  const combined = text.match(
    /(\d+(?:\.\d+)?)\s*hour(?:s)?\s*(?:of\s+)?(?:break|refreshment|rest|buffer).*?before\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+and\s+after\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
  );
  if (combined) {
    const dur = Math.round(parseFloat(combined[1]) * 60);
    breaks.push({
      durationMin: dur,
      before: combined[2].trim().toUpperCase(),
    });
    breaks.push({
      durationMin: dur,
      after: combined[3].trim().toUpperCase(),
    });
    return breaks;
  }

  const beforeMatches = [
    ...text.matchAll(
      /(?:(\d+(?:\.\d+)?)\s*hour(?:s)?|(\d+)\s*min(?:ute)?s?)\s*(?:of\s+)?(?:break|refreshment|rest|buffer).*?before\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi
    ),
  ];
  for (const m of beforeMatches) {
    const dur = m[1]
      ? Math.round(parseFloat(m[1]) * 60)
      : parseInt(m[2] || "60", 10);
    breaks.push({
      durationMin: dur,
      before: m[3].trim().toUpperCase(),
    });
  }

  const afterMatches = [
    ...text.matchAll(
      /(?:(\d+(?:\.\d+)?)\s*hour(?:s)?|(\d+)\s*min(?:ute)?s?)\s*(?:of\s+)?(?:break|refreshment|rest|buffer).*?(?:after|following)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi
    ),
  ];
  for (const m of afterMatches) {
    const dur = m[1]
      ? Math.round(parseFloat(m[1]) * 60)
      : parseInt(m[2] || "60", 10);
    breaks.push({
      durationMin: dur,
      after: m[3].trim().toUpperCase(),
    });
  }

  return breaks;
}

export function computeAvailabilityWindows(
  constraints: string[],
  originalBlocker: string,
  dailyHours: string
): TimeWindow[] {
  const text = collectText(constraints, originalBlocker);
  const blocked = extractBlockedRanges(text);
  const breaks = extractBreaks(text);
  const windows: TimeWindow[] = [];

  const hoursMatch = dailyHours.match(/(\d+(?:\.\d+)?)/);
  const dailyMin = hoursMatch ? Math.round(parseFloat(hoursMatch[1]) * 60) : 120;

  for (const { start, end } of blocked) {
    const s = parseTimeToMinutes(start);
    const e = parseTimeToMinutes(end);
    if (s >= 0 && e > s) {
      windows.push({
        startMin: s,
        endMin: e,
        label: `${start} – ${end}`,
        type: "blocked",
      });
    }
  }

  for (const br of breaks) {
    if (br.before) {
      const anchor = parseTimeToMinutes(br.before);
      if (anchor >= 0) {
        windows.push({
          startMin: anchor - br.durationMin,
          endMin: anchor,
          label: `${minutesToLabel(anchor - br.durationMin)} – ${br.before} (break)`,
          type: "break",
        });
      }
    }
    if (br.after) {
      const anchor = parseTimeToMinutes(br.after);
      if (anchor >= 0) {
        windows.push({
          startMin: anchor,
          endMin: anchor + br.durationMin,
          label: `${br.after} – ${minutesToLabel(anchor + br.durationMin)} (break)`,
          type: "break",
        });
      }
    }
  }

  const noWork = windows.filter((w) => w.type !== "work");
  const block = blocked[0];
  if (block) {
    const blockStart = parseTimeToMinutes(block.start);
    const blockEnd = parseTimeToMinutes(block.end);

    const morningBreak = breaks.find((b) => b.before);
    const eveningBreak = breaks.find((b) => b.after);

    let morningWorkEnd = blockStart;
    if (morningBreak?.before) {
      morningWorkEnd = parseTimeToMinutes(morningBreak.before) - morningBreak.durationMin;
    }

    if (morningWorkEnd > 360) {
      windows.push({
        startMin: morningWorkEnd - dailyMin,
        endMin: morningWorkEnd,
        label: `${minutesToLabel(morningWorkEnd - dailyMin)} – ${minutesToLabel(morningWorkEnd)} (morning work)`,
        type: "work",
      });
    }

    let eveningWorkStart = blockEnd;
    if (eveningBreak?.after) {
      eveningWorkStart = parseTimeToMinutes(eveningBreak.after) + eveningBreak.durationMin;
    }

    if (eveningWorkStart < 22 * 60) {
      windows.push({
        startMin: eveningWorkStart,
        endMin: eveningWorkStart + dailyMin,
        label: `${minutesToLabel(eveningWorkStart)} – ${minutesToLabel(eveningWorkStart + dailyMin)} (evening work)`,
        type: "work",
      });
    }
  }

  return windows;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function validatePlanSchedule(
  markdown: string,
  constraints: string[],
  originalBlocker: string,
  dailyHours: string = "2 hours"
): string[] {
  const windows = computeAvailabilityWindows(constraints, originalBlocker, dailyHours);
  const noWorkWindows = windows.filter((w) => w.type === "blocked" || w.type === "break");
  const workWindows = windows.filter((w) => w.type === "work");

  if (noWorkWindows.length === 0) return [];

  const violations: string[] = [];
  const scheduleSection = markdown.split(/##\s*Schedule/i)[1]?.split(/##/)[0] || "";
  const timeRangeRegex =
    /(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/gi;

  let match;
  while ((match = timeRangeRegex.exec(scheduleSection)) !== null) {
    const start = parseTimeToMinutes(match[1]);
    const end = parseTimeToMinutes(match[2]);
    if (start < 0 || end < 0) continue;

    const line = match[0];

    for (const nw of noWorkWindows) {
      if (rangesOverlap(start, end, nw.startMin, nw.endMin)) {
        violations.push(
          `INVALID slot "${line}" overlaps ${nw.type} window ${nw.label}`
        );
      }
    }

    if (workWindows.length > 0) {
      const inAllowedWork = workWindows.some((w) =>
        start >= w.startMin && end <= w.endMin
      );
      if (!inAllowedWork) {
        violations.push(
          `INVALID slot "${line}" is outside allowed work windows: ${workWindows.map((w) => w.label).join("; ")}`
        );
      }
    }
  }

  return violations;
}

export function buildAvailabilityRules(
  constraints: string[],
  originalBlocker: string,
  dailyHours: string
): string {
  const windows = computeAvailabilityWindows(constraints, originalBlocker, dailyHours);
  const blocked = windows.filter((w) => w.type === "blocked");
  const breaks = windows.filter((w) => w.type === "break");
  const work = windows.filter((w) => w.type === "work");

  const hoursMatch = dailyHours.match(/(\d+(?:\.\d+)?)/);
  const hours = hoursMatch ? hoursMatch[1] : dailyHours;

  if (blocked.length === 0 && breaks.length === 0) {
    return `Daily work budget: ${hours} hours. No blocked hours detected.`;
  }

  const lines: string[] = [
    "STRICT SCHEDULING RULES — violating these makes the plan INVALID:",
    "",
  ];

  for (const w of blocked) {
    lines.push(`⛔ OFFICE/BLOCKED (zero work): ${w.label}`);
  }
  for (const w of breaks) {
    lines.push(`☕ BREAK (zero work): ${w.label}`);
  }
  lines.push("");

  if (work.length > 0) {
    lines.push("✅ SCHEDULE TASKS ONLY IN THESE EXACT WINDOWS:");
    for (const w of work) {
      lines.push(`   → ${w.label}`);
    }
  } else {
    lines.push("✅ WORK ONLY outside all blocked and break windows above.");
  }

  lines.push("");
  lines.push(`Daily work budget: ${hours} hours — split across allowed windows only.`);
  lines.push("");
  lines.push("FORBIDDEN (will be rejected):");
  for (const w of [...blocked, ...breaks]) {
    lines.push(`   ❌ Any task during ${w.label}`);
  }
  if (breaks.length > 0) {
    lines.push(`   ❌ Scheduling at break start time (e.g. work at 7:30 PM when break is 7:30–8:30 PM)`);
  }

  return lines.join("\n");
}
