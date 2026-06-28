"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Clock,
  Volume2,
  VolumeX,
  AlertTriangle,
  Play,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { parsePlanSections, stripMarkdown } from "@/lib/parse-plan";

type RemindersWidgetProps = {
  task: string;
  deadline: string;
  markdown: string;
};

export function RemindersWidget({ task, deadline, markdown }: RemindersWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("low");
  const [speaking, setSpeaking] = useState(false);
  const [progressData, setProgressData] = useState({
    total: 0,
    completed: 0,
    nextTask: "",
  });

  // Parse sections to count tasks & check completed states
  useEffect(() => {
    if (!markdown) return;
    const sections = parsePlanSections(markdown);
    const tasksSection = sections.find((s) =>
      ["your tasks", "tasks", "task list", "todo list"].includes(
        s.title.toLowerCase().trim()
      )
    );

    if (tasksSection) {
      const taskLines = tasksSection.lines.filter(
        (l) => stripMarkdown(l).trim() !== ""
      );
      const totalCount = taskLines.length;

      // Check localStorage for checked states for this plan
      let completedCount = 0;
      let firstUncompleted = "";

      try {
        const saved = localStorage.getItem(
          `vibeguru_completed_${markdown.slice(0, 80)}`
        );
        const checkedMap: Record<string, boolean> = saved ? JSON.parse(saved) : {};

        taskLines.forEach((line) => {
          const cleanText = stripMarkdown(line);
          if (checkedMap[cleanText]) {
            completedCount++;
          } else if (!firstUncompleted) {
            firstUncompleted = cleanText.replace(/^\d+\.\s*/, "").replace(/^[-*]\s*/, "");
          }
        });
      } catch (err) {
        console.error(err);
      }

      setProgressData({
        total: totalCount,
        completed: completedCount,
        nextTask: firstUncompleted || "All tasks completed!",
      });
    }
  }, [markdown]);

  // Calculate time remaining and urgency state
  useEffect(() => {
    if (!deadline) return;

    const updateTimer = () => {
      // Clean up deadline string if it's relative or parse as date
      const deadlineDate = new Date(deadline);
      const now = new Date();

      if (isNaN(deadlineDate.getTime())) {
        // Fallback for informal deadlines (e.g., "Tonight", "Tomorrow morning")
        const dlLower = deadline.toLowerCase();
        if (dlLower.includes("tonight") || dlLower.includes("today")) {
          setUrgency("critical");
          setTimeLeft("due by tonight");
        } else if (dlLower.includes("tomorrow")) {
          setUrgency("high");
          setTimeLeft("due tomorrow");
        } else {
          setUrgency("medium");
          setTimeLeft(`due: ${deadline}`);
        }
        return;
      }

      const diffMs = deadlineDate.getTime() - now.getTime();
      if (diffMs <= 0) {
        setUrgency("critical");
        setTimeLeft("Deadline passed!");
        return;
      }

      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = Math.floor(diffHours % 24);
      const remainingMins = Math.floor((diffMs / (1000 * 60)) % 60);

      if (diffHours < 12) {
        setUrgency("critical");
      } else if (diffHours < 24) {
        setUrgency("high");
      } else if (diffHours < 72) {
        setUrgency("medium");
      } else {
        setUrgency("low");
      }

      let timeStr = "";
      if (diffDays > 0) {
        timeStr += `${diffDays}d ${remainingHours}h`;
      } else if (remainingHours > 0) {
        timeStr += `${remainingHours}h ${remainingMins}m`;
      } else {
        timeStr += `${remainingMins}m`;
      }
      setTimeLeft(timeStr);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // update every minute
    return () => clearInterval(interval);
  }, [deadline]);

  // Browser Text-To-Speech (Voice-Enabled Assistant)
  const speakMotivation = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    let speakText = `This is your Vibe Guru alert. For your project, ${task}, you have ${timeLeft} left. `;
    if (progressData.total > 0) {
      if (progressData.completed === progressData.total) {
        speakText += "Outstanding! All your tasks are completed. You've completely crushed this deadline!";
      } else {
        const remaining = progressData.total - progressData.completed;
        speakText += `You have completed ${progressData.completed} of ${progressData.total} milestones. ${remaining} sub-tasks are still outstanding. `;
        if (progressData.nextTask) {
          speakText += `Your next high-priority focus must be: ${progressData.nextTask}. Stay sharp, block out distractions, and take action right now.`;
        }
      }
    } else {
      speakText += "Focus on the execution plan, review your tips, and clear any initial blockers now. You've got this.";
    }

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 1.05; // slightly faster for high-agency/strategic urgency
    utterance.pitch = 0.95; // deeper, authoritative executive tone

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getUrgencyClasses = () => {
    switch (urgency) {
      case "critical":
        return {
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-900/40",
          text: "text-red-700 dark:text-red-400",
          badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 animate-pulse",
          glow: "ring-2 ring-red-400/30",
        };
      case "high":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          border: "border-amber-200 dark:border-amber-900/40",
          text: "text-amber-700 dark:text-amber-400",
          badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
          glow: "ring-1.5 ring-amber-400/20",
        };
      case "medium":
        return {
          bg: "bg-indigo-50/50 dark:bg-indigo-950/10",
          border: "border-indigo-150 dark:border-indigo-900/30",
          text: "text-indigo-700 dark:text-indigo-400",
          badge: "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400",
          glow: "",
        };
      default:
        return {
          bg: "bg-emerald-50/50 dark:bg-emerald-950/10",
          border: "border-emerald-200 dark:border-emerald-900/20",
          text: "text-emerald-700 dark:text-emerald-400",
          badge: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
          glow: "",
        };
    }
  };

  const style = getUrgencyClasses();

  return (
    <div className={`rounded-2xl p-5 border shadow-sm transition-all duration-300 ${style.bg} ${style.border} ${style.glow}`}>
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Bell className={`w-5 h-5 ${style.text}`} />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            VibeGuru Pulse Alert
          </h3>
        </div>
        <button
          onClick={speakMotivation}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            speaking
              ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200"
              : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50"
          }`}
          title="Voice Assistance - Let VibeGuru speak your status & priority updates"
        >
          {speaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              Stop Voice
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              Listen Alert
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {/* Urgent Countdown */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Time Remaining
            </span>
          </div>
          <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg ${style.badge}`}>
            {timeLeft}
          </span>
        </div>

        {/* Action Status Block */}
        {progressData.total > 0 && (
          <div className="bg-white dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/40 text-xs space-y-2">
            <div className="flex justify-between items-center text-zinc-500 font-semibold">
              <span>Task Execution Metrics</span>
              <span className="font-bold text-zinc-850 dark:text-zinc-300">
                {progressData.completed}/{progressData.total}
              </span>
            </div>

            {/* Custom mini progress bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{
                  width: `${(progressData.completed / progressData.total) * 100}%`,
                }}
              />
            </div>

            {/* Immediate Priority Focus reminder */}
            {progressData.completed < progressData.total ? (
              <div className="pt-1 flex gap-1.5 items-start">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-zinc-650 dark:text-zinc-300 leading-normal">
                  <span className="font-bold">Next Priority:</span> {progressData.nextTask}
                </p>
              </div>
            ) : (
              <div className="pt-1 flex gap-1.5 items-center text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>All plan sub-tasks completed!</span>
              </div>
            )}
          </div>
        )}

        {/* Motivational recommendation reminder */}
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
          💡 Pro-tip: Do not let cold-start friction win. Execute the first step to unlock momentum.
        </p>
      </div>
    </div>
  );
}
