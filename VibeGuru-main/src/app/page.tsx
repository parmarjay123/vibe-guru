import {
  Brain,
  Calendar,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { HomeHeroCTA } from "@/components/HomeHeroCTA";

const features = [
  {
    icon: Brain,
    title: "Decompose",
    desc: "Breaks big tasks into 3–5 sub-tasks under 2 hours each.",
  },
  {
    icon: Zap,
    title: "Prioritize",
    desc: "Ranks work using the Eisenhower Matrix — urgent vs important.",
  },
  {
    icon: Calendar,
    title: "Schedule",
    desc: "Builds a day-by-day plan using your actual available hours.",
  },
  {
    icon: CheckCircle2,
    title: "Headstart",
    desc: "Drafts outlines, emails, or research so you never start from zero.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-zinc-900 dark:text-white leading-[1.15]">
            Your deadline is messy.
            <br />
            <span className="gradient-text">VibeGuru makes it doable.</span>
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            An AI Chief of Staff that decomposes tasks, prioritizes with the
            Eisenhower Matrix, schedules deep work, and gives you a ready-to-use
            headstart — not just another reminder.
          </p>

          <HomeHeroCTA />
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12 text-zinc-900 dark:text-white tracking-tight">
            How VibeGuru Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div 
                key={f.title} 
                className="glow-card rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700/80"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beautiful Example Scenario Section (Focused Element) */}
        <section className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 py-20 transition-all duration-300">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold mb-6 text-zinc-900 dark:text-white tracking-tight">Example Scenario</h2>
            <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 text-left shadow-sm dark:shadow-none transition-all duration-300 hover:shadow-md dark:hover:border-zinc-700/80">
              <div className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl leading-none">
                  &ldquo;
                </span>
                <div>
                  <blockquote className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base font-medium italic leading-relaxed">
                    I have a marketing presentation due Friday morning, but I&apos;m swamped with meetings all week.
                  </blockquote>
                  <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      VibeGuru: Decomposes tasks &amp; builds an editable schedule + outline in seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
        Built by Padm Parmar · Powered by Google AI Studio
      </footer>
    </div>
  );
}
