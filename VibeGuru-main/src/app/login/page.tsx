"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";

export default function LoginPage() {
  const {
    user,
    loading: authLoading,
    firebaseReady,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
  } = useAuth();
  
  const router = useRouter();

  // Tab state: "signin" or "signup"
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Status states
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Sign in with Google failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    
    if (activeTab === "signup" && !name.trim()) {
      setError("Please provide your name to register.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab === "signup") {
        await signUpWithEmail(email.trim(), password, name.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message.includes("auth/email-already-in-use")) {
          setError("This email address is already in use.");
        } else if (err.message.includes("auth/invalid-credential")) {
          setError("Invalid email or password. Please try again.");
        } else if (err.message.includes("auth/weak-password")) {
          setError("Password is too weak.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected authentication error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar showAuth={false} />

      <main className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="glow-card rounded-2xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-1 text-zinc-900 dark:text-white">
            Welcome to VibeGuru
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm text-center mb-6">
            Organize, prioritize, and supercharge your deadlines.
          </p>

          {!firebaseReady ? (
            <div className="text-left bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Firebase not configured
              </p>
              <p className="text-zinc-600 dark:text-amber-300/80 mb-3">
                Copy <code className="bg-zinc-100 dark:bg-zinc-950 px-1 rounded text-rose-500">.env.example</code> to{" "}
                <code className="bg-zinc-100 dark:bg-zinc-950 px-1 rounded text-rose-500">.env.local</code> and add your
                Firebase credentials.
              </p>
              <Link
                href="/dashboard"
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Continue without sign-in →
              </Link>
            </div>
          ) : authLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              <p className="text-xs text-zinc-500 font-medium">Checking session...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signin");
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === "signin"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === "signup"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Box */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4.5 w-4.5 text-zinc-400" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-zinc-400" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-zinc-400" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : activeTab === "signup" ? (
                    "Create Account"
                  ) : (
                    "Sign In with Password"
                  )}
                </button>
              </form>

              {/* Separator Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                <span className="flex-shrink mx-4 text-zinc-450 dark:text-zinc-500 text-xs uppercase font-bold tracking-wider">
                  or
                </span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(activeTab === "signin" ? "signup" : "signin");
                    setError(null);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  {activeTab === "signin"
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          )}

          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-6 uppercase tracking-widest font-semibold">
            Secured & Powered by Firebase Authentication
          </p>
        </div>
      </main>
    </div>
  );
}
