"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Send, MessageCircle, AlertCircle } from "lucide-react";
import { PlanViewer } from "@/components/PlanViewer";
import { VoiceInputButton } from "./VoiceInputButton";

type ReplanPanelProps = {
  onReplan: (data: {
    scheduleChange: string;
    completedItems: string;
    skippedItems: string;
    newBlocker: string;
  }) => Promise<void>;
  loading?: boolean;
};

export function ReplanPanel({ onReplan, loading = false }: ReplanPanelProps) {
  const [scheduleChange, setScheduleChange] = useState("");
  const [completed, setCompleted] = useState("");
  const [skipped, setSkipped] = useState("");
  const [blocker, setBlocker] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Plans changed? Replan remaining tasks
      </button>
    );
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 bg-white dark:bg-zinc-900/50 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Replan My Schedule</h3>
      
      <div className="relative">
        <input
          placeholder="What do you want to change in the schedule?"
          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-3 pr-10 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={scheduleChange}
          onChange={(e) => setScheduleChange(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
          <VoiceInputButton
            onTranscript={(text) => setScheduleChange((s) => (s ? `${s} ${text}` : text))}
            compact={true}
            className="p-1 h-7 w-7 bg-transparent border-none hover:bg-zinc-200 dark:hover:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          />
        </div>
      </div>

      <div className="relative">
        <input
          placeholder="What did you complete?"
          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-3 pr-10 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={completed}
          onChange={(e) => setCompleted(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
          <VoiceInputButton
            onTranscript={(text) => setCompleted((s) => (s ? `${s} ${text}` : text))}
            compact={true}
            className="p-1 h-7 w-7 bg-transparent border-none hover:bg-zinc-200 dark:hover:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          />
        </div>
      </div>

      <div className="relative">
        <input
          placeholder="What did you skip or get stuck on?"
          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-3 pr-10 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={skipped}
          onChange={(e) => setSkipped(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
          <VoiceInputButton
            onTranscript={(text) => setSkipped((s) => (s ? `${s} ${text}` : text))}
            compact={true}
            className="p-1 h-7 w-7 bg-transparent border-none hover:bg-zinc-200 dark:hover:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          />
        </div>
      </div>

      <div className="relative">
        <input
          placeholder="Any new blocker?"
          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-3 pr-10 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={blocker}
          onChange={(e) => setBlocker(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
          <VoiceInputButton
            onTranscript={(text) => setBlocker((s) => (s ? `${s} ${text}` : text))}
            compact={true}
            className="p-1 h-7 w-7 bg-transparent border-none hover:bg-zinc-200 dark:hover:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          />
        </div>
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={() =>
          onReplan({
            scheduleChange,
            completedItems: completed,
            skippedItems: skipped,
            newBlocker: blocker,
          })
        }
        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        Update Plan
      </button>
    </div>
  );
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

type ChatPanelProps = {
  onSend: (message: string) => Promise<void>;
  messages: ChatMessage[];
  loading?: boolean;
};

export function ChatPanel({ onSend, messages, loading = false }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const hasMessages = messages.length > 0 || loading;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm">
      <div
        className={`px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 ${
          hasMessages ? "border-b border-zinc-200 dark:border-zinc-800" : ""
        }`}
      >
        <MessageCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        Ask VibeGuru
      </div>

      {hasMessages && (
        <div className="max-h-80 overflow-y-auto p-3 space-y-3">
          {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-xl rounded-br-sm bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 px-3 py-2 text-sm text-indigo-700 dark:text-indigo-100">
                {m.content}
              </div>
            </div>
          ) : m.isError ? (
            <div key={i} className="flex justify-start">
              <div className="max-w-[95%] flex items-start gap-2 rounded-xl rounded-bl-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-700/40 px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-100/90">{m.content}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[95%] w-full rounded-xl rounded-bl-sm bg-zinc-50/50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 px-3 py-3">
                <PlanViewer markdown={m.content} compact />
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm px-1">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        )}
        </div>
      )}

      <div
        className={`flex items-end bg-zinc-50/30 dark:bg-zinc-950/50 ${
          hasMessages ? "border-t border-zinc-200 dark:border-zinc-850" : ""
        }`}
      >
        <textarea
          rows={2}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-none min-h-[4.5rem]"
          placeholder='I only have 30 minutes today — what should I do?'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              if (!input.trim() || loading) return;
              const msg = input.trim();
              setInput("");
              onSend(msg);
            }
          }}
          disabled={loading}
        />
        <div className="flex items-center gap-2 px-3 py-2 self-end">
          <VoiceInputButton
            onTranscript={(text) => setInput((s) => (s ? `${s} ${text}` : text))}
            className="p-1.5 h-8 w-8 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
          />
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={async () => {
              if (!input.trim() || loading) return;
              const msg = input.trim();
              setInput("");
              await onSend(msg);
            }}
            className="p-1.5 h-8 w-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
            title="Send (Ctrl+Enter)"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
