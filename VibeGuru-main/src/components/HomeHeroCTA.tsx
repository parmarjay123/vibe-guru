"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { InteractiveDemo } from "@/components/InteractiveDemo";

export function HomeHeroCTA() {
  const { user, loading } = useAuth();
  const [demoOpen, setDemoOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-12 w-64 mx-auto bg-zinc-200 dark:bg-zinc-850 rounded-xl animate-pulse" />
    );
  }

  if (user) {
    return (
      <>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:mr-2 font-medium">
            Welcome back, {user.displayName?.split(" ")[0] || "there"}!
          </p>
          <Link
            href="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => setDemoOpen(true)}
            className="border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-550 text-zinc-700 dark:text-zinc-350 px-8 py-3 rounded-xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/40 font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            Interactive Demo ⚡
          </button>
        </div>
        <InteractiveDemo isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          href="/dashboard"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 text-center w-full sm:w-auto"
        >
          Start Planning
        </Link>
        <button
          onClick={() => setDemoOpen(true)}
          className="border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-550 text-zinc-700 dark:text-zinc-350 px-8 py-3 rounded-xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/40 font-semibold flex items-center justify-center gap-2 cursor-pointer text-center w-full sm:w-auto"
        >
          Interactive Demo ⚡
        </button>
        <Link
          href="/login"
          className="border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-550 text-zinc-700 dark:text-zinc-350 px-8 py-3 rounded-xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-center w-full sm:w-auto"
        >
          Sign in with Google
        </Link>
      </div>
      <InteractiveDemo isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}

