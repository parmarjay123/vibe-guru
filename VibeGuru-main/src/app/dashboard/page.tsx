"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  Plus,
  Sparkles,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { PlanForm, PlanFormData } from "@/components/PlanForm";
import { PlanViewer } from "@/components/PlanViewer";
import { ReplanPanel, ChatPanel } from "@/components/ReplanPanel";
import { HabitTracker } from "@/components/HabitTracker";
import { RemindersWidget } from "@/components/RemindersWidget";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { savePlan, getUserPlans, updatePlanInDb, PlanRecord } from "@/lib/firestore";
import { getClientTodayIso } from "@/lib/date-context";
import { toUserFriendlyError } from "@/lib/gemini-errors";
import {
  mergeConstraint,
  PlanSessionContext,
  getAllConstraints,
} from "@/lib/session-context";

function isLikelyConstraint(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "unavailable",
    "available",
    "office",
    "break",
    "between",
    " am",
    " pm",
    "hour",
    "cannot",
    "can't",
    "busy",
    "meeting",
    "refreshment",
    "not free",
  ].some((k) => lower.includes(k));
}

function buildSession(
  planMeta: PlanFormData,
  constraintsHistory: string[],
  planMarkdown: string | null,
  chatMessages: { role: "user" | "assistant"; content: string; isError?: boolean }[]
): PlanSessionContext {
  return {
    task: planMeta.task,
    deadline: planMeta.deadline,
    dailyHours: planMeta.dailyHours,
    originalBlocker: planMeta.blocker,
    constraints: getAllConstraints(planMeta.blocker, constraintsHistory),
    currentPlan: planMarkdown ?? undefined,
    chatHistory: chatMessages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, content: m.content })),
  };
}

export default function DashboardPage() {
  const { user, loading: authLoading, firebaseReady, signOut } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [planMarkdown, setPlanMarkdown] = useState<string | null>(null);
  const [planMeta, setPlanMeta] = useState<PlanFormData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string; isError?: boolean }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [constraintsHistory, setConstraintsHistory] = useState<string[]>([]);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && firebaseReady) {
      setLoadingPlans(true);
      getUserPlans(user.uid)
        .then(setPlans)
        .catch(console.error)
        .finally(() => setLoadingPlans(false));
    }
  }, [user, firebaseReady]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs text-zinc-500 font-medium">Checking authentication...</p>
      </div>
    );
  }

  const handleGenerate = async (data: PlanFormData) => {
    setGenerating(true);
    setPlanMeta(data);
    setSaveWarning(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, today: getClientTodayIso() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate plan");

      setPlanMarkdown(json.planMarkdown);
      setShowForm(false);
      setChatMessages([]);
      setConstraintsHistory(
        data.blocker?.trim() ? [data.blocker.trim()] : []
      );

      if (user && firebaseReady) {
        try {
          const id = await savePlan({
            userId: user.uid,
            task: data.task,
            deadline: data.deadline,
            dailyHours: data.dailyHours,
            blocker: data.blocker,
            planMarkdown: json.planMarkdown,
            status: "active",
          });
          setActivePlan(id);
          const updated = await getUserPlans(user.uid);
          setPlans(updated);
        } catch (saveErr) {
          console.error("Firestore save failed:", saveErr);
          setSaveWarning(
            "Plan ready! Couldn't save to cloud — deploy Firestore rules: firebase deploy --only firestore:rules"
          );
        }
      }
    } catch (err) {
      alert(toUserFriendlyError(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleReplan = async (data: {
    scheduleChange: string;
    completedItems: string;
    skippedItems: string;
    newBlocker: string;
  }) => {
    if (!planMeta) return;
    setReplanning(true);

    let updatedConstraints = getAllConstraints(
      planMeta.blocker,
      constraintsHistory
    );
    if (data.scheduleChange?.trim()) {
      updatedConstraints = mergeConstraint(
        updatedConstraints,
        data.scheduleChange.trim()
      );
    }
    if (data.newBlocker?.trim()) {
      updatedConstraints = mergeConstraint(
        updatedConstraints,
        data.newBlocker.trim()
      );
    }

    if (
      data.scheduleChange?.trim() ||
      data.newBlocker?.trim()
    ) {
      setConstraintsHistory(updatedConstraints);
    }

    try {
      const res = await fetch("/api/replan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleChange: data.scheduleChange,
          completedItems: data.completedItems,
          skippedItems: data.skippedItems,
          newBlocker: data.newBlocker,
          today: getClientTodayIso(),
          session: buildSession(
            planMeta,
            updatedConstraints,
            planMarkdown,
            chatMessages
          ),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Replan failed");
      setPlanMarkdown(json.planMarkdown);

      const mergedBlocker = updatedConstraints.join(" | ");
      setPlanMeta((prev) =>
        prev ? { ...prev, blocker: mergedBlocker } : prev
      );

      if (user && firebaseReady && activePlan) {
        try {
          await updatePlanInDb(activePlan, {
            planMarkdown: json.planMarkdown,
            blocker: mergedBlocker,
            status: "replanned",
          });
          const updated = await getUserPlans(user.uid);
          setPlans(updated);
        } catch (saveErr) {
          console.error("Replan save failed:", saveErr);
          setSaveWarning(
            "Plan updated! Couldn't save to cloud — check Firestore rules."
          );
        }
      }
    } catch (err) {
      alert(toUserFriendlyError(err));
    } finally {
      setReplanning(false);
    }
  };

  const handleChat = async (message: string) => {
    if (!planMeta) return;

    const userMsg = { role: "user" as const, content: message };
    const historyWithUser = [...chatMessages, userMsg];

    if (isLikelyConstraint(message)) {
      setConstraintsHistory((prev) => mergeConstraint(prev, message));
    }

    setChatLoading(true);
    setChatMessages((prev) => [...prev, userMsg]);

    const constraintsForRequest = isLikelyConstraint(message)
      ? mergeConstraint(
          getAllConstraints(planMeta.blocker, constraintsHistory),
          message
        )
      : getAllConstraints(planMeta.blocker, constraintsHistory);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          today: getClientTodayIso(),
          session: buildSession(
            planMeta,
            constraintsForRequest,
            planMarkdown,
            historyWithUser
          ),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Chat failed");

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: json.reply },
      ]);

      if (
        json.reply.includes("## DO THIS FIRST") ||
        json.reply.includes("## Your Tasks")
      ) {
        setPlanMarkdown(json.reply);
        if (user && firebaseReady && activePlan) {
          try {
            await updatePlanInDb(activePlan, {
              planMarkdown: json.reply,
              status: "replanned",
            });
            const updated = await getUserPlans(user.uid);
            setPlans(updated);
          } catch (saveErr) {
            console.error("Chat plan save failed:", saveErr);
          }
        }
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: toUserFriendlyError(err),
          isError: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const loadSavedPlan = (plan: PlanRecord) => {
    setPlanMarkdown(plan.planMarkdown);
    setPlanMeta({
      task: plan.task,
      deadline: plan.deadline,
      dailyHours: plan.dailyHours,
      blocker: plan.blocker,
    });
    setActivePlan(plan.id || null);
    setShowForm(false);
    setChatMessages([]);
    setConstraintsHistory(
      plan.blocker?.trim() ? [plan.blocker.trim()] : []
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {planMeta && planMarkdown && (
              <RemindersWidget
                task={planMeta.task}
                deadline={planMeta.deadline}
                markdown={planMarkdown}
              />
            )}

            <button
              onClick={() => {
                setShowForm(true);
                setPlanMarkdown(null);
                setPlanMeta(null);
                setConstraintsHistory([]);
                setChatMessages([]);
              }}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 !text-white py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Action Plan
            </button>

            <button
              onClick={() => setDemoOpen(true)}
              className="w-full flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-800 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Interactive Demo ⚡
            </button>

            <HabitTracker />

            {user && firebaseReady && (
              <div className="glow-card rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-300 mb-3">
                  Saved Plans
                </h2>
                {loadingPlans ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mx-auto" />
                ) : plans.length === 0 ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">No saved plans yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {plans.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => loadSavedPlan(p)}
                          className={`w-full text-left text-sm p-2.5 rounded-xl transition-colors cursor-pointer ${
                            activePlan === p.id
                              ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-200 border-l-4 border-indigo-500 pl-2"
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          <span className="line-clamp-2 font-semibold">{p.task}</span>
                          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                            <Clock className="w-3 h-3" />
                            {p.deadline}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!user && (
              <div className="glow-card rounded-xl p-4 text-sm border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm text-zinc-600 dark:text-zinc-400">
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                  Sign in with Google
                </Link>{" "}
                to save plans to Firebase Firestore.
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {showForm || !planMarkdown ? (
              <div className="glow-card rounded-2xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm">
                <h1 className="text-xl font-bold mb-1 text-zinc-900 dark:text-white">Create Action Plan</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  Tell VibeGuru about your deadline — it will decompose, prioritize,
                  schedule, and give you a headstart.
                </p>
                <PlanForm onSubmit={handleGenerate} loading={generating} />
              </div>
            ) : (
              <div className="space-y-4">
                {saveWarning && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                    {saveWarning}
                  </div>
                )}
                <div className="glow-card rounded-2xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm">
                  <h1 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">Your Action Plan</h1>
                  {planMarkdown && <PlanViewer markdown={planMarkdown} />}
                </div>

                <ReplanPanel onReplan={handleReplan} loading={replanning} />
                <ChatPanel
                  messages={chatMessages}
                  onSend={handleChat}
                  loading={chatLoading}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <InteractiveDemo isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
