"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Sparkles, LogOut, Sun, Moon, Palette, Check, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, ThemeType } from "@/contexts/ThemeContext";

type NavbarProps = {
  showAuth?: boolean;
};

const THEMES: Array<{ id: ThemeType; name: string; primary: string; accent: string }> = [
  { id: "indigo", name: "Indigo Cosmic", primary: "bg-indigo-500", accent: "bg-cyan-400" },
  { id: "orange", name: "Sunset Aura", primary: "bg-orange-500", accent: "bg-pink-500" },
  { id: "emerald", name: "Emerald Forest", primary: "bg-emerald-500", accent: "bg-cyan-400" },
  { id: "purple", name: "Cyber Purple", primary: "bg-purple-500", accent: "bg-rose-500" },
  { id: "amber", name: "Amber Gold", primary: "bg-amber-500", accent: "bg-blue-500" },
];

export function Navbar({ showAuth = true }: NavbarProps) {
  const { user, loading, signOut } = useAuth();
  const { theme, setTheme, isDark, setIsDark } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const logoHref = user ? "/dashboard" : "/";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Brand Identity / Logo */}
        <Link href={logoHref} className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/10 transition-all duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-zinc-100 dark:bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
          </div>
          <span className="font-extrabold tracking-tight text-lg text-zinc-900 dark:text-white">
            Vibe<span className="text-indigo-600 dark:text-indigo-400">Guru</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* THEME SELECTOR & MODE SWITCHER CONTROLS */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
            {/* Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 h-8 w-8 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Theme Picker Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 px-2 py-1.5 h-8 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer text-xs font-semibold"
                title="Select Color Theme"
              >
                <Palette className="w-4 h-4 text-indigo-400" />
                <span className="hidden md:inline capitalize">{theme}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Select Theme
                  </div>
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer ${
                        theme === t.id
                          ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/10"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Theme dot indicator */}
                        <div className="flex gap-0.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${t.primary}`} />
                          <div className={`w-2.5 h-2.5 rounded-full ${t.accent}`} />
                        </div>
                        <span>{t.name}</span>
                      </div>
                      {theme === t.id && <Check className="w-4 h-4 text-indigo-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showAuth && !loading && (
            <nav className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline text-sm font-medium">
                    {user.displayName || user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800/80 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?signup=true"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          )}

        </div>

      </div>
    </header>
  );
}
