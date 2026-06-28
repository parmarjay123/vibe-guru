"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserHabits,
  saveHabit,
  updateHabitInDb,
  deleteHabitInDb,
  HabitRecord,
} from "@/lib/firestore";
import {
  Plus,
  Trash2,
  Flame,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  Sparkles,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function HabitTracker() {
  const { user, firebaseReady } = useAuth();
  const [habits, setHabits] = useState<HabitRecord[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Get today's local date string YYYY-MM-DD
  const getTodayStr = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Get yesterday's local date string YYYY-MM-DD
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

  // Streak Calculation Utility
  const calculateStreak = (dates: string[]): number => {
    if (!dates || dates.length === 0) return 0;
    
    // Sort reverse chronological
    const uniqueDates = Array.from(new Set(dates));
    const sorted = [...uniqueDates].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const todayStr = getTodayStr();
    const yesterdayStr = getYesterdayStr();

    // If neither today nor yesterday is completed, the streak is broken
    if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) {
      return 0;
    }

    let currentStreak = 0;
    const checkDate = new Date();

    // If today is not completed, start counting from yesterday
    if (!sorted.includes(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Traverse backward as long as dates are consecutive
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (sorted.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  };

  useEffect(() => {
    const fetchHabits = async () => {
      if (user && firebaseReady) {
        setLoading(true);
        try {
          const fetched = await getUserHabits(user.uid);
          setHabits(fetched);
        } catch (err) {
          console.error("Failed to load habits from Firestore, trying localStorage:", err);
          loadLocalHabits();
        } finally {
          setLoading(false);
        }
      } else {
        loadLocalHabits();
      }
    };

    fetchHabits();
  }, [user, firebaseReady]);

  const loadLocalHabits = () => {
    try {
      const local = localStorage.getItem("vibeguru_local_habits");
      if (local) {
        setHabits(JSON.parse(local));
      } else {
        // Initial setup for default habits to guide user
        const defaults: HabitRecord[] = [
          {
            id: "default-1",
            userId: user?.uid || "guest",
            name: "Morning Focus Priority Selection",
            streak: 0,
            completedDates: [],
          },
          {
            id: "default-2",
            userId: user?.uid || "guest",
            name: "Clear High-Exposure (Q1) Tasks",
            streak: 0,
            completedDates: [],
          },
          {
            id: "default-3",
            userId: user?.uid || "guest",
            name: "VibeGuru 5-min Routine Review",
            streak: 0,
            completedDates: [],
          },
        ];
        setHabits(defaults);
        localStorage.setItem("vibeguru_local_habits", JSON.stringify(defaults));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveLocalHabits = (updated: HabitRecord[]) => {
    try {
      setHabits(updated);
      localStorage.setItem("vibeguru_local_habits", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    setSubmitting(true);
    const newHabitObj = {
      userId: user?.uid || "guest",
      name: newHabitName.trim(),
      streak: 0,
      completedDates: [],
    };

    if (user && firebaseReady) {
      try {
        const id = await saveHabit(newHabitObj);
        setHabits((prev) => [...prev, { id, ...newHabitObj }]);
        setNewHabitName("");
        setMessage("Habit added!");
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        console.error("Cloud save failed, adding locally:", err);
        const localId = `local-${Date.now()}`;
        const updated = [...habits, { id: localId, ...newHabitObj }];
        saveLocalHabits(updated);
        setNewHabitName("");
      } finally {
        setSubmitting(false);
      }
    } else {
      const localId = `local-${Date.now()}`;
      const updated = [...habits, { id: localId, ...newHabitObj }];
      saveLocalHabits(updated);
      setNewHabitName("");
      setSubmitting(false);
    }
  };

  const handleToggleHabit = async (habit: HabitRecord) => {
    const todayStr = getTodayStr();
    const isCompletedToday = habit.completedDates.includes(todayStr);

    let updatedDates = [...habit.completedDates];
    if (isCompletedToday) {
      updatedDates = updatedDates.filter((d) => d !== todayStr);
    } else {
      updatedDates.push(todayStr);
    }

    const newStreak = calculateStreak(updatedDates);
    const updatedHabit = {
      ...habit,
      completedDates: updatedDates,
      streak: newStreak,
    };

    // Optimistic UI state
    setHabits((prev) =>
      prev.map((h) => (h.id === habit.id ? updatedHabit : h))
    );

    if (user && firebaseReady && habit.id && !habit.id.startsWith("local") && !habit.id.startsWith("default")) {
      try {
        await updateHabitInDb(habit.id, {
          completedDates: updatedDates,
          streak: newStreak,
        });
      } catch (err) {
        console.error("Failed to update habit on database:", err);
      }
    } else {
      const updatedList = habits.map((h) => (h.id === habit.id ? updatedHabit : h));
      saveLocalHabits(updatedList);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!id) return;

    setHabits((prev) => prev.filter((h) => h.id !== id));

    if (user && firebaseReady && !id.startsWith("local") && !id.startsWith("default")) {
      try {
        await deleteHabitInDb(id);
      } catch (err) {
        console.error("Failed to delete habit from database:", err);
      }
    } else {
      const updatedList = habits.filter((h) => h.id !== id);
      saveLocalHabits(updatedList);
    }
  };

  return (
    <div className="glow-card rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Daily Goals & Habits
          </h2>
        </div>
        {habits.length > 0 && (
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-200/55 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>
              {Math.max(...habits.map((h) => h.streak), 0)} Day Streak
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
        Build high-leverage routines. Maintain daily streaks by checking off tasks to reduce procrastination.
      </p>

      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      ) : habits.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl mb-4">
          <Sparkles className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
          <p className="text-xs text-zinc-500 dark:text-zinc-500 font-semibold">
            No habits added yet
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 mb-4">
          <AnimatePresence initial={false}>
            {habits.map((habit) => {
              const isCompleted = habit.completedDates.includes(getTodayStr());
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCompleted
                      ? "bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/40"
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-150 dark:border-zinc-800/60"
                  }`}
                >
                  <button
                    onClick={() => handleToggleHabit(habit)}
                    className="flex items-center gap-3 text-left flex-1 cursor-pointer group"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-semibold transition-all line-clamp-2 leading-tight ${
                        isCompleted
                          ? "text-zinc-500 line-through dark:text-zinc-500"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {habit.name}
                    </span>
                  </button>

                  <div className="flex items-center gap-2.5 ml-2.5">
                    {habit.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {habit.streak}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteHabit(habit.id!)}
                      className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Habit Form */}
      <form onSubmit={handleAddHabit} className="flex gap-2">
        <input
          type="text"
          placeholder="New daily routine..."
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          disabled={submitting}
          className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1.5 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-zinc-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-3 bg-indigo-600 hover:bg-indigo-500 !text-white rounded-xl transition-all font-semibold flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-50 text-xs"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin !text-white" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
