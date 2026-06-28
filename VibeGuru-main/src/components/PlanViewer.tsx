"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  ListChecks,
  Calendar,
  Copy,
  Check,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
  List,
  Grid,
  Download,
  CheckSquare,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  parsePlanSections,
  stripMarkdown,
  getQuadrantColor,
} from "@/lib/parse-plan";

type PlanViewerProps = {
  markdown: string;
  className?: string;
  compact?: boolean;
};

// --- ICS CALENDAR GENERATION ---

function parseScheduleToEvents(lines: string[]) {
  const year = new Date().getFullYear();
  const monthMap: Record<string, number> = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11,
  };

  const events: Array<{ title: string; start: Date; end: Date }> = [];

  for (const line of lines) {
    const clean = stripMarkdown(line).replace(/^[-*]\s*/, "");
    const parts = clean.split("→");
    if (parts.length < 2) continue;

    const dateTimeStr = parts[0].trim();
    const taskName = parts[1].trim();

    const dtParts = dateTimeStr.split("·");
    const datePart = dtParts[0]?.trim();
    const timePart = dtParts[1]?.trim();

    if (!datePart) continue;

    const monthMatch = datePart.toLowerCase().match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)/);
    const dayMatch = datePart.match(/\b\d{1,2}\b/);

    if (!monthMatch || !dayMatch) continue;

    const monthIndex = monthMap[monthMatch[0]];
    const dayNum = parseInt(dayMatch[0], 10);

    let startHour = 9;
    let startMin = 0;
    let endHour = 10;
    let endMin = 0;

    if (timePart) {
      const timeMatch = timePart.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?\s*-\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
      if (timeMatch) {
        let sh = parseInt(timeMatch[1], 10);
        const sm = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const sampm = timeMatch[3]?.toUpperCase();

        let eh = parseInt(timeMatch[4], 10);
        const em = timeMatch[5] ? parseInt(timeMatch[5], 10) : 0;
        const eampm = timeMatch[6]?.toUpperCase() || sampm;

        if (sampm === "PM" && sh < 12) sh += 12;
        if (sampm === "AM" && sh === 12) sh = 0;
        if (eampm === "PM" && eh < 12) eh += 12;
        if (eampm === "AM" && eh === 12) eh = 0;

        startHour = sh;
        startMin = sm;
        endHour = eh;
        endMin = em;
      }
    }

    const startDate = new Date(year, monthIndex, dayNum, startHour, startMin);
    const endDate = new Date(year, monthIndex, dayNum, endHour, endMin);

    events.push({
      title: taskName,
      start: startDate,
      end: endDate,
    });
  }

  return events;
}

export function exportToIcs(scheduleLines: string[]) {
  const events = parseScheduleToEvents(scheduleLines);
  if (events.length === 0) {
    alert("No schedule items could be parsed for calendar export. Add dates/times into your plan!");
    return;
  }

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VibeGuru//Action Plan Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n") + "\r\n";

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formatIcsDate = (date: Date) => {
    return [
      date.getUTCFullYear(),
      pad(date.getUTCMonth() + 1),
      pad(date.getUTCDate()),
      "T",
      pad(date.getUTCHours()),
      pad(date.getUTCMinutes()),
      "00Z",
    ].join("");
  };

  for (const ev of events) {
    const startStr = formatIcsDate(ev.start);
    const endStr = formatIcsDate(ev.end);
    const stampStr = formatIcsDate(new Date());
    const uid = `vibeguru-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@vibeguru.app`;

    icsContent += [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stampStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${ev.title.replace(/[,;]/g, "\\$&")}`,
      "DESCRIPTION:Scheduled via VibeGuru - Your proactive, AI-powered productivity companion.",
      "END:VEVENT",
    ].join("\r\n") + "\r\n";
  }

  icsContent += "END:VCALENDAR";

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "vibeguru-schedule.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- RENDERING COMPONENTS ---

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function DoThisFirstCard({ lines }: { lines: string[] }) {
  const text = lines.map(stripMarkdown).join("\n");
  const firstLine = stripMarkdown(lines[0] || "");
  const rest = lines.slice(1).map(stripMarkdown).join(" ");

  return (
    <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/40 p-4 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
        <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-bounce" />
        Do This First
      </div>
      <p className="text-zinc-900 dark:text-white font-bold text-lg leading-snug">{firstLine}</p>
      {rest && <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">{rest}</p>}
      <div className="mt-3 flex justify-end">
        <CopyButton text={text} />
      </div>
    </div>
  );
}

function TaskList({
  lines,
  checkedTasks,
  onToggle,
  masterGoal = "",
}: {
  lines: string[];
  checkedTasks: Record<string, boolean>;
  onToggle: (text: string) => void;
  masterGoal?: string;
}) {
  const [view, setView] = useState<"list" | "matrix">("list");

  // States for live AI sub-task execution
  const [executionDrafts, setExecutionDrafts] = useState<Record<number, string>>({});
  const [executingTaskId, setExecutingTaskId] = useState<number | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleExecuteTask = async (id: number, name: string, quadrant: string, time: string) => {
    if (expandedTaskId === id) {
      setExpandedTaskId(null);
      return;
    }

    if (executionDrafts[id]) {
      setExpandedTaskId(id);
      return;
    }

    setExecutingTaskId(id);
    try {
      const res = await fetch("/api/execute-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: name,
          masterGoal,
          quadrant,
          timeEstimate: time,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate assets");
      
      setExecutionDrafts((prev) => ({ ...prev, [id]: data.result }));
      setExpandedTaskId(id);
    } catch (err: any) {
      alert(`Could not generate starting assets: ${err.message || err}`);
    } finally {
      setExecutingTaskId(null);
    }
  };

  const handleCopyCode = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Parse lines
  const parsedTasks = lines.map((line, idx) => {
    const clean = stripMarkdown(line);
    const qMatch = clean.match(/·\s*(Q[1-4])/);
    const quadrant = qMatch ? qMatch[1] : "Q2";
    const withoutNum = clean.replace(/^\d+\.\s*/, "");
    
    const parts = withoutNum.split(/[—-]/);
    const name = parts[0]?.trim() || withoutNum;
    const time = parts[1] ? parts[1].split("·")[0]?.trim() : "";

    return {
      id: idx,
      raw: line,
      clean,
      name,
      time,
      quadrant,
      completed: !!checkedTasks[clean],
    };
  });

  if (view === "matrix") {
    const q1 = parsedTasks.filter((t) => t.quadrant === "Q1");
    const q2 = parsedTasks.filter((t) => t.quadrant === "Q2");
    const q3 = parsedTasks.filter((t) => t.quadrant === "Q3");
    const q4 = parsedTasks.filter((t) => t.quadrant === "Q4");

    const renderQuadrant = (title: string, desc: string, tasks: typeof parsedTasks, badgeColor: string) => (
      <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
            {title}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{desc}</span>
        </div>
        
        {tasks.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 italic py-4 text-center">No tasks assigned here</p>
        ) : (
          <div className="space-y-3 flex-1">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex flex-col rounded-xl bg-white dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-900/50 shadow-sm transition-all overflow-hidden"
              >
                <div className="flex items-start gap-2.5 p-2.5">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => onToggle(t.clean)}
                    className="mt-1 h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 pr-1">
                    <p className={`text-xs font-medium leading-tight ${t.completed ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-200"}`}>
                      {t.name}
                    </p>
                    {t.time && <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{t.time}</p>}
                  </div>
                  <button
                    onClick={() => handleExecuteTask(t.id, t.name, t.quadrant, t.time)}
                    disabled={executingTaskId !== null && executingTaskId !== t.id}
                    className={`p-1 rounded transition-colors cursor-pointer flex-shrink-0 ${
                      expandedTaskId === t.id
                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500"
                    }`}
                    title="VibeGuru AI Execution: Click to generate code boilerplates or documents for this milestone"
                  >
                    {executingTaskId === t.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Expanded AI assets */}
                {expandedTaskId === t.id && executionDrafts[t.id] && (
                  <div className="px-3 pb-3 pt-2 bg-indigo-50/20 dark:bg-indigo-950/10 border-t border-zinc-150 dark:border-zinc-800 text-[11px] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">VibeGuru AI Starting Material:</span>
                      <button
                        onClick={() => handleCopyCode(t.id, executionDrafts[t.id])}
                        className="text-[10px] bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-50 cursor-pointer"
                      >
                        {copiedId === t.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre className="p-2 bg-zinc-950/5 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 text-zinc-800 dark:text-zinc-350 max-h-48 rounded overflow-auto font-mono whitespace-pre-wrap leading-relaxed">
                      {executionDrafts[t.id]}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-end gap-1 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 self-end w-fit ml-auto">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
            List View
          </button>
          <button
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-indigo-600 text-white font-medium shadow-sm cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5" />
            Matrix View
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderQuadrant("Q1: Urgent & Important", "Do immediately", q1, "bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500/30")}
          {renderQuadrant("Q2: Not Urgent & Important", "Schedule deep work", q2, "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30")}
          {renderQuadrant("Q3: Urgent & Not Important", "Delegate or streamline", q3, "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30")}
          {renderQuadrant("Q4: Not Urgent & Not Important", "Eliminate or postpone", q4, "bg-zinc-100 dark:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-500/30")}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-1 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 self-end w-fit ml-auto">
        <button
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-indigo-600 text-white font-medium shadow-sm cursor-pointer"
        >
          <List className="w-3.5 h-3.5" />
          List View
        </button>
        <button
          onClick={() => setView("matrix")}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <Grid className="w-3.5 h-3.5" />
          Matrix View
        </button>
      </div>

      <div className="space-y-2.5">
        {parsedTasks.map((t, i) => (
          <div
            key={t.id}
            className="flex flex-col bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-sm dark:shadow-none transition-all overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => onToggle(t.clean)}
                className="h-4.5 w-4.5 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
              />
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className={`text-sm flex-1 leading-snug pr-2 ${t.completed ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-200"}`}>
                {t.name} {t.time && <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5">({t.time})</span>}
              </span>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {t.quadrant && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${getQuadrantColor(t.quadrant)}`}
                  >
                    {t.quadrant}
                  </span>
                )}
                <button
                  onClick={() => handleExecuteTask(t.id, t.name, t.quadrant, t.time)}
                  disabled={executingTaskId !== null && executingTaskId !== t.id}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    expandedTaskId === t.id
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500"
                  }`}
                  title="Auto-Execute Task: Get code starter templates or concrete checklists instantly from VibeGuru"
                >
                  {executingTaskId === t.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Live AI execution code/assets container */}
            {expandedTaskId === t.id && executionDrafts[t.id] && (
              <div className="px-4 pb-4 pt-2.5 bg-indigo-50/20 dark:bg-indigo-950/10 border-t border-zinc-150 dark:border-zinc-850 text-xs space-y-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    VibeGuru AI Starting Material
                  </span>
                  <button
                    onClick={() => handleCopyCode(t.id, executionDrafts[t.id])}
                    className="text-[10px] bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded font-bold hover:bg-zinc-50 cursor-pointer"
                  >
                    {copiedId === t.id ? "Copied Boilerplate!" : "Copy Boilerplate"}
                  </button>
                </div>
                <pre className="p-3 bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed max-h-64">
                  {executionDrafts[t.id]}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleList({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const clean = stripMarkdown(line).replace(/^[-*]\s*/, "");
        const parts = clean.split("→");
        const day = parts[0]?.trim() || clean;
        const task = parts[1]?.trim();

        return (
          <div
            key={i}
            className="flex gap-3 items-start border-l-2 border-cyan-500/50 pl-3 py-1"
          >
            <Calendar className="w-4 h-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{day}</p>
              {task && <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{task}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeadstartBlock({ lines, title }: { lines: string[]; title: string }) {
  const [open, setOpen] = useState(true);
  const text = lines.map(stripMarkdown).join("\n");

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/40 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 gap-2 bg-zinc-50/50 dark:bg-transparent">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center justify-between text-left hover:opacity-80 transition-opacity min-w-0 cursor-pointer"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            {title.includes("Headstart") ? title : "Headstart"}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          )}
        </button>
        <CopyButton text={text} />
      </div>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-1.5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-transparent">
          {lines.map((line, i) => {
            const clean = stripMarkdown(line).replace(/^[-*]\s*/, "");
            if (!clean) return null;
            return (
              <p key={i} className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug flex gap-2">
                <span className="text-emerald-600 dark:text-emerald-500 flex-shrink-0">•</span>
                <span>{clean}</span>
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TipsList({ lines }: { lines: string[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {lines.slice(0, 3).map((line, i) => {
        const clean = stripMarkdown(line).replace(/^[-*]\s*/, "");
        return (
          <div
            key={i}
            className="flex gap-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/20 rounded-lg px-3 py-2 shadow-sm dark:shadow-none"
          >
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">{clean}</p>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
  accent = "text-zinc-500 dark:text-zinc-400",
  rightElement,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  accent?: string;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${accent}`}>
          <Icon className="w-4 h-4" />
          {title}
        </div>
        {rightElement}
      </div>
      {children}
    </div>
  );
}

function AnswerCard({ lines }: { lines: string[] }) {
  const text = lines.map(stripMarkdown).join(" ");
  return (
    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed bg-zinc-50/80 dark:bg-zinc-850/50 rounded-xl px-3.5 py-3 border border-zinc-200 dark:border-zinc-700/50 shadow-sm dark:shadow-none">
      {text}
    </p>
  );
}

export function PlanViewer({ markdown, className = "", compact = false }: PlanViewerProps) {
  const sections = parsePlanSections(markdown);
  const gap = compact ? "space-y-3" : "space-y-5";

  // --- STATE FOR INTERACTIVE CHECKLIST ---
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`vibeguru_completed_${markdown.slice(0, 80)}`);
        if (saved) {
          setCheckedTasks(JSON.parse(saved));
        } else {
          setCheckedTasks({});
        }
      } catch {
        setCheckedTasks({});
      }
    }
  }, [markdown]);

  const toggleTask = (taskText: string) => {
    const updated = { ...checkedTasks, [taskText]: !checkedTasks[taskText] };
    setCheckedTasks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`vibeguru_completed_${markdown.slice(0, 80)}`, JSON.stringify(updated));
    }
  };

  const findSection = (keywords: string[]) =>
    sections.find((s) =>
      keywords.some((k) => s.title.toLowerCase().includes(k.toLowerCase()))
    );

  const answer = findSection(["answer"]);
  const doFirst = findSection(["do this first", "do now", "first"]);
  const overview = findSection(["overview", "summary", "task summary"]);
  const tasks = findSection(["your tasks", "sub-task", "decomposed"]);
  const schedule = findSection(["schedule"]);
  const headstart = sections.find((s) => s.title.toLowerCase().includes("headstart"));
  const tips = findSection(["tips", "quick wins"]);

  const handled = new Set(
    [answer, doFirst, overview, tasks, schedule, headstart, tips].filter(Boolean)
  );

  const otherSections = sections.filter(
    (s) =>
      !handled.has(s) && !s.title.toLowerCase().includes("priority")
  );

  // Calculate statistics for the progress meter
  const taskLines = tasks?.lines || [];
  const totalTasks = taskLines.length;
  const completedCount = taskLines.filter((line) => checkedTasks[stripMarkdown(line)]).length;
  const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className={`${gap} ${className}`}>
      {/* Dynamic Progress Meter */}
      {totalTasks > 0 && !compact && (
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm dark:shadow-none">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-bold text-zinc-850 dark:text-zinc-200">Execution Progress</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {completedCount} of {totalTasks} sub-tasks completed.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto max-w-xs">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{percent}%</span>
            <div className="flex-1 sm:w-32 bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {answer && <AnswerCard lines={answer.lines} />}
      {doFirst && <DoThisFirstCard lines={doFirst.lines} />}

      {overview && (
        <p className="text-zinc-600 dark:text-zinc-400 text-sm border-l-2 border-zinc-300 dark:border-zinc-700 pl-3 leading-relaxed">
          {overview.lines.map(stripMarkdown).join(" ")}
        </p>
      )}

      {tasks && (
        <SectionCard icon={ListChecks} title="Your Tasks" accent="text-indigo-600 dark:text-indigo-400">
          <TaskList
            lines={tasks.lines}
            checkedTasks={checkedTasks}
            onToggle={toggleTask}
            masterGoal={overview ? overview.lines.map(stripMarkdown).join(" ") : ""}
          />
        </SectionCard>
      )}

      {schedule && (
        <SectionCard
          icon={Calendar}
          title="Schedule"
          accent="text-cyan-600 dark:text-cyan-400"
          rightElement={
            <button
              onClick={() => exportToIcs(schedule.lines)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 text-xs rounded-lg border border-cyan-200 dark:border-cyan-800/40 transition-all font-semibold ml-auto cursor-pointer"
              title="Download calendar (.ics) file to import into Google/Apple/Outlook Calendar"
            >
              <Download className="w-3.5 h-3.5" />
              Export (.ics)
            </button>
          }
        >
          <ScheduleList lines={schedule.lines} />
        </SectionCard>
      )}

      {headstart && (
        <HeadstartBlock lines={headstart.lines} title={headstart.title} />
      )}

      {tips && (
        <SectionCard icon={Lightbulb} title="Quick Tips" accent="text-amber-600 dark:text-amber-400">
          <TipsList lines={tips.lines} />
        </SectionCard>
      )}

      {otherSections.map((section) => (
        <SectionCard key={section.title} icon={ListChecks} title={section.title}>
          <div className="space-y-1">
            {section.lines.map((line, i) => (
              <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {stripMarkdown(line)}
              </p>
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
