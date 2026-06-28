"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { VoiceInputButton } from "./VoiceInputButton";

type PlanFormData = {
  task: string;
  deadline: string;
  dailyHours: string;
  blocker: string;
};

type PlanFormProps = {
  onSubmit: (data: PlanFormData) => Promise<void>;
  loading?: boolean;
};

export function PlanForm({ onSubmit, loading = false }: PlanFormProps) {
  const [form, setForm] = useState<PlanFormData>({
    task: "",
    deadline: "",
    dailyHours: "2",
    blocker: "",
  });

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const isFormEmpty = !form.task.trim() && !form.deadline && !form.blocker.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          What is the task?
        </label>
        <div className="relative">
          <textarea
            required
            rows={3}
            placeholder="e.g. Marketing presentation due Friday morning, 15 slides with competitor analysis"
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-3 pr-10 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.task}
            onChange={(e) => setForm({ ...form, task: e.target.value })}
          />
          <div className="absolute right-2 top-2 z-10">
            <VoiceInputButton
              onTranscript={(text) => setForm((f) => ({ ...f, task: f.task ? `${f.task} ${text}` : text }))}
              compact={true}
              className="p-1 h-7 w-7 bg-transparent border-none hover:bg-zinc-200 dark:hover:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            When is the deadline?
          </label>
          <input
            required
            type="date"
            min={getTodayString()}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Daily available time: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{form.dailyHours || "2"} hours</span>
            </label>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">Max 24h</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={form.dailyHours || "2"}
              onChange={(e) => setForm({ ...form, dailyHours: e.target.value })}
            />
            <div className="w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-150 rounded-full"
                style={{ width: `${(Number(form.dailyHours || 2) / 24) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 px-1 font-mono">
              <span>1 hr</span>
              <span>6 hrs</span>
              <span>12 hrs</span>
              <span>18 hrs</span>
              <span>24 hrs</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Biggest blocker
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Back-to-back meetings Mon–Wed, easily distracted"
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-3 pr-10 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.blocker}
            onChange={(e) => setForm({ ...form, blocker: e.target.value })}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            <VoiceInputButton
              onTranscript={(text) => setForm((f) => ({ ...f, blocker: f.blocker ? `${f.blocker} ${text}` : text }))}
              compact={true}
              className="p-1 h-7 w-7 bg-transparent border-none hover:bg-zinc-200 dark:hover:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || isFormEmpty}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed !text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            VibeGuru is planning...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Generate My Action Plan
          </>
        )}
      </button>
    </form>
  );
}

export type { PlanFormData };
