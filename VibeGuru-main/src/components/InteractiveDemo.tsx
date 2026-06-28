"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, Play, Pause, ArrowRight, ArrowLeft, RotateCcw, 
  Sparkles, Brain, Grid, Calendar, FileText, MessageSquare, 
  CheckCircle2, Clock, Check, AlertCircle, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step {
  id: number;
  title: string;
  icon: any;
  desc: string;
  actionTitle: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "1. Input & Decompose",
    icon: Brain,
    desc: "Input your chaotic real-life task. VibeGuru breaks it down into clear, highly-focused sub-tasks restricted to under 2 hours each to prevent burnout.",
    actionTitle: "Decomposing task..."
  },
  {
    id: 2,
    title: "2. Eisenhower Matrix",
    icon: Grid,
    desc: "Sub-tasks are automatically sorted into the four Eisenhower quadrants to prioritize what actually matters and weed out busywork.",
    actionTitle: "Sorting into quadrants..."
  },
  {
    id: 3,
    title: "3. Time Block Scheduler",
    icon: Calendar,
    desc: "VibeGuru looks at your calendar availability and slots each prioritized task into a concrete, realistic day-by-day deep work block.",
    actionTitle: "Scheduling time blocks..."
  },
  {
    id: 4,
    title: "4. AI Headstart Outline",
    icon: FileText,
    desc: "Start with an editable slide draft, presentation outline, or code skeleton generated for your tasks. No more starting from a blank page.",
    actionTitle: "Drafting content outlines..."
  },
  {
    id: 5,
    title: "5. Smart Re-planning Chat",
    icon: MessageSquare,
    desc: "Life happens. Just chat with VibeGuru. Tell it about new meetings or delays, and watch it automatically re-index and shift your calendar blocks in real-time.",
    actionTitle: "Recalculating calendar blocks..."
  }
];

interface InteractiveDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InteractiveDemo({ isOpen, onClose }: InteractiveDemoProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Animation/Simulation variables
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([]);
  const [showRescheduled, setShowRescheduled] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fullPrompt = "I have a big marketing presentation due Friday but am swamped with meetings.";
  const fullChatPrompt = "Wait, my Thursday afternoon review got moved to Friday morning! Can we adjust?";

  // Restart steps on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsPlaying(true);
      resetAnimations();
    }
  }, [isOpen]);

  // Handle autoplay loop
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Set stage timers based on steps to give enough time to view
    const delay = currentStep === 1 ? 9500 : currentStep === 5 ? 12000 : 7000;

    timerRef.current = setTimeout(() => {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Loop back to start
        setCurrentStep(1);
        resetAnimations();
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStep, isPlaying, isOpen]);

  // Typing simulator for Step 1 & Step 5
  useEffect(() => {
    if (currentStep === 1) {
      setTypedText("");
      setIsTyping(true);
      let idx = 0;
      const t = setInterval(() => {
        if (idx < fullPrompt.length) {
          setTypedText(prev => prev + fullPrompt.charAt(idx));
          idx++;
        } else {
          setIsTyping(false);
          clearInterval(t);
        }
      }, 50);
      return () => clearInterval(t);
    } else if (currentStep === 5) {
      setChatInput("");
      setChatMessages([]);
      setShowRescheduled(false);
      
      // Stage 1: Type user message
      let idx = 0;
      const userTypeTimer = setInterval(() => {
        if (idx < fullChatPrompt.length) {
          setChatInput(prev => prev + fullChatPrompt.charAt(idx));
          idx++;
        } else {
          clearInterval(userTypeTimer);
          // Stage 2: Send user message, show thinking
          setTimeout(() => {
            setChatMessages([{ role: 'user', text: fullChatPrompt }]);
            setChatInput("");
            
            // Stage 3: Guru response
            setTimeout(() => {
              setChatMessages(prev => [
                ...prev,
                { 
                  role: 'assistant', 
                  text: "🔄 Adjusting schedule! No worries. Moving Friday morning's speak prep to Thursday night, and pushing Peer Review to Friday morning. Your calendar is clean!" 
                }
              ]);
              setShowRescheduled(true);
            }, 1800);
          }, 800);
        }
      }, 40);

      return () => {
        clearInterval(userTypeTimer);
      };
    }
  }, [currentStep]);

  const resetAnimations = () => {
    setTypedText("");
    setChatInput("");
    setChatMessages([]);
    setShowRescheduled(false);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(1);
      resetAnimations();
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      setCurrentStep(5);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-zinc-50 dark:bg-zinc-950 w-full max-w-5xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-white dark:bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-zinc-900 dark:text-white text-base">VibeGuru Walkthrough Demo</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Interactive live simulation of the core planning engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outer Split Layout */}
        <div className="grid md:grid-cols-12 min-h-[500px]">
          {/* Left Column: Description & Stepper */}
          <div className="md:col-span-4 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between bg-white/40 dark:bg-zinc-900/20">
            <div className="space-y-6">
              {/* Stepper progress dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(s.id);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentStep === s.id 
                        ? "w-8 bg-indigo-600 dark:bg-indigo-500" 
                        : "w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                    }`}
                    title={s.title}
                  />
                ))}
              </div>

              {/* Current Step Description Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      {(() => {
                        const Icon = STEPS[currentStep - 1].icon;
                        return <Icon className="w-5 h-5" />;
                      })()}
                    </div>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Scenario {currentStep} of 5
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {STEPS[currentStep - 1].title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                    {STEPS[currentStep - 1].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stepper Navigation Actions */}
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                  title={isPlaying ? "Pause Autoplay" : "Start Autoplay"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(1);
                    resetAnimations();
                  }}
                  className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="Restart Simulation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-500/10"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Stage Sandbox */}
          <div className="md:col-span-8 p-6 bg-zinc-100/60 dark:bg-zinc-950/40 flex items-center justify-center relative min-h-[420px]">
            {/* Ambient Background Glow Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:24px_24px] opacity-35" />

            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden min-h-[380px] flex flex-col">
              {/* Simulated Window Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono ml-2">vibeguru-engine-sim.exe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xxs font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE SIMULATION
                  </span>
                </div>
              </div>

              {/* Simulation Workspace Panel */}
              <div className="p-5 flex-1 flex flex-col overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {/* Step 1 Simulation: Task Decomposition */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 flex-1 flex flex-col"
                    >
                      <div className="space-y-3.5 text-left bg-zinc-50/50 dark:bg-zinc-950/30 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-850">
                        {/* Task Field */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                            What is the task?
                          </label>
                          <div className="relative">
                            <textarea
                              disabled
                              rows={2}
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono resize-none focus:outline-none"
                              value={typedText}
                            />
                            {isTyping && (
                              <span className="absolute left-[3px] top-[18px] w-1.5 h-3.5 bg-indigo-500 animate-pulse" style={{ transform: `translateX(${Math.min(typedText.length * 6.2, 380)}px)` }} />
                            )}
                          </div>
                        </div>

                        {/* Deadline & Daily Hours row */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                              When is the deadline?
                            </label>
                            <input
                              disabled
                              type="date"
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono focus:outline-none"
                              value="2026-07-03"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                Daily available: <span className="text-indigo-600 dark:text-indigo-400 font-bold">3h</span>
                              </label>
                            </div>
                            <div className="space-y-1.5">
                              <input
                                disabled
                                type="range"
                                min="1"
                                max="24"
                                className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-not-allowed accent-indigo-600"
                                value="3"
                              />
                              <div className="w-full bg-zinc-200 dark:bg-zinc-850 rounded-full h-1 overflow-hidden">
                                <div 
                                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full"
                                  style={{ width: `${(3 / 24) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Decomposition Action Result */}
                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">AI Decomposition</span>
                          {isTyping && (
                            <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" /> Wait for typing...
                            </span>
                          )}
                          {!isTyping && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-bounce" /> Decomposed into 4 Action Steps
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {!isTyping ? (
                            <>
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs text-zinc-700 dark:text-zinc-300 shadow-sm"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-bold text-zinc-900 dark:text-white">Step 1: Collect product metrics & audience data</span>
                                  <div className="text-xxs text-zinc-500 mt-0.5 flex items-center gap-2">
                                    <span>⌛ Duration: 1.5 Hours</span>
                                    <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1 py-0.2 rounded font-bold">URGENT</span>
                                  </div>
                                </div>
                              </motion.div>

                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs text-zinc-700 dark:text-zinc-300 shadow-sm"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-bold text-zinc-900 dark:text-white">Step 2: Design core slides & speakers outline</span>
                                  <div className="text-xxs text-zinc-500 mt-0.5 flex items-center gap-2">
                                    <span>⌛ Duration: 2 Hours</span>
                                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1 py-0.2 rounded font-bold">IMPORTANT</span>
                                  </div>
                                </div>
                              </motion.div>

                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0 }}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs text-zinc-700 dark:text-zinc-300 shadow-sm"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-bold text-zinc-900 dark:text-white">Step 3: Share slides draft for peer review & feedback</span>
                                  <div className="text-xxs text-zinc-500 mt-0.5 flex items-center gap-2">
                                    <span>⌛ Duration: 1 Hour</span>
                                    <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded font-bold">CO-WORK</span>
                                  </div>
                                </div>
                              </motion.div>
                            </>
                          ) : (
                            <div className="h-28 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-950/10">
                              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                                <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" /> Generating decomposition sub-tasks...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 Simulation: Eisenhower Matrix Quadrants */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 flex-1 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Eisenhower Prioritization</span>
                        <span className="text-xxs font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40">Sorted</span>
                      </div>

                      {/* 2x2 Interactive Grid */}
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        {/* Q1: Urgent & Important */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/10 dark:bg-indigo-950/10 rounded-xl p-3 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-700 transition-colors"
                        >
                          <div>
                            <span className="text-xxs font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider block mb-1">Q1: DO IMMEDIATELY</span>
                            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight block">Collect growth analytics & market metrics</span>
                          </div>
                          <span className="text-[10px] text-indigo-500 font-mono mt-2 block">⚡ 1.5h · Urgent</span>
                        </motion.div>

                        {/* Q2: Important, Not Urgent */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/10 dark:bg-emerald-950/10 rounded-xl p-3 flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-700 transition-colors"
                        >
                          <div>
                            <span className="text-xxs font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider block mb-1">Q2: SCHEDULE FOCUS</span>
                            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight block">Draft presentation slides & speakers guide</span>
                          </div>
                          <span className="text-[10px] text-emerald-500 font-mono mt-2 block">📅 2h · Deep Work</span>
                        </motion.div>

                        {/* Q3: Urgent, Not Important */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="border border-amber-200 dark:border-amber-900/40 bg-amber-50/10 dark:bg-amber-950/10 rounded-xl p-3 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-700 transition-colors"
                        >
                          <div>
                            <span className="text-xxs font-extrabold text-amber-600 dark:text-amber-400 tracking-wider block mb-1">Q3: STREAMLINE / CO-WORK</span>
                            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight block">Submit slides for peer feedback loop</span>
                          </div>
                          <span className="text-[10px] text-amber-500 font-mono mt-2 block">👥 1h · Delegate / Align</span>
                        </motion.div>

                        {/* Q4: Neither */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl p-3 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-750 transition-colors"
                        >
                          <div>
                            <span className="text-xxs font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider block mb-1">Q4: ELIMINATE / DELAY</span>
                            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 leading-tight block">Format older legacy slide archives</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono mt-2 block">🗑️ Skip or postpone</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 Simulation: Day-by-Day Calendar Block Scheduler */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 flex-1 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Dynamic Schedule (Smart Blocks)</span>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" /> Local constraints respected
                        </span>
                      </div>

                      {/* Day Grid Block simulation */}
                      <div className="space-y-3 flex-1">
                        {/* Day 1 */}
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="border-l-4 border-indigo-500 bg-white dark:bg-zinc-950 p-2.5 rounded-r-xl border border-y-zinc-200 dark:border-y-zinc-800 border-r-zinc-200 dark:border-r-zinc-800 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">Wednesday Deep Work</span>
                            <span className="text-xxs text-zinc-400 font-mono">2:00 PM - 3:30 PM</span>
                          </div>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">🔍 Task Decompose Q1: Analytics & Metrics</p>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Fits between morning alignment & board review.
                          </span>
                        </motion.div>

                        {/* Day 2 */}
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="border-l-4 border-emerald-500 bg-white dark:bg-zinc-950 p-2.5 rounded-r-xl border border-y-zinc-200 dark:border-y-zinc-800 border-r-zinc-200 dark:border-r-zinc-800 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase font-bold">Thursday Deep Focus</span>
                            <span className="text-xxs text-zinc-400 font-mono">10:00 AM - 12:00 PM</span>
                          </div>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">🎨 Task Decompose Q2: Slide Draft & speakers notes</p>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Dedicated quiet block before lunch.
                          </span>
                        </motion.div>

                        {/* Day 3 */}
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="border-l-4 border-amber-500 bg-white dark:bg-zinc-950 p-2.5 rounded-r-xl border border-y-zinc-200 dark:border-y-zinc-800 border-r-zinc-200 dark:border-r-zinc-800 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase font-bold">Thursday Afternoon Review</span>
                            <span className="text-xxs text-zinc-400 font-mono">3:00 PM - 4:00 PM</span>
                          </div>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">👥 Task Decompose Q3: Send out drafts for reviews</p>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Direct submission to team Slack.
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4 Simulation: AI Headstart Outline Draft */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 flex-1 flex flex-col justify-between overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">AI Generated Headstart Outlines</span>
                        <span className="text-xxs font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500" /> READY-TO-EDIT
                        </span>
                      </div>

                      {/* Content outline document block */}
                      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-700 dark:text-zinc-300 overflow-y-auto space-y-3 max-h-[250px] shadow-inner text-left">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <h4 className="text-zinc-900 dark:text-white font-bold border-b border-zinc-200 dark:border-zinc-850 pb-1 mb-2">📊 VibeGuru Marketing Slide Deck Skeleton</h4>
                          <p className="text-indigo-600 dark:text-indigo-400 text-xxs font-bold uppercase tracking-wider mb-2">Generated Outline Draft</p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="space-y-1"
                        >
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">Slide 1: Executive Intro & Key Metric Growth</p>
                          <p className="text-zinc-500 dark:text-zinc-400 pl-4 text-xxs leading-relaxed">
                            • Purpose: Show 18% Quarter-over-Quarter retention lift.<br />
                            • Talking points: Focus on high-value segment growth vs churn.
                          </p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                          className="space-y-1"
                        >
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">Slide 2: Visualizing Customer Segment Cohorts</p>
                          <p className="text-zinc-500 dark:text-zinc-400 pl-4 text-xxs leading-relaxed">
                            • Purpose: Segment active cohorts using dynamic graphs.<br />
                            • Pro-Tip: Embed clean line chart of user lifecycle values.
                          </p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 }}
                          className="space-y-1"
                        >
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">Slide 3: Delivery Plan & Speaking Roadmap</p>
                          <p className="text-zinc-500 dark:text-zinc-400 pl-4 text-xxs leading-relaxed">
                            • Purpose: Summarize Q3 milestones and marketing calendar.
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5 Simulation: Smart Re-planning Chat & Block shifting */}
                  {currentStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 flex-1 flex flex-col justify-between overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Dynamic Re-planning Engine</span>
                        <span className="text-xxs font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-indigo-500" /> Scenario Shift
                        </span>
                      </div>

                      {/* Chat Simulator */}
                      <div className="space-y-2.5 flex-1 flex flex-col justify-end bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 p-3.5 rounded-xl min-h-[120px] max-h-[180px] overflow-y-auto">
                        <div className="space-y-2">
                          {chatMessages.map((msg, mIdx) => (
                            <div 
                              key={mIdx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                                msg.role === 'user' 
                                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none' 
                                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-tl-none shadow-sm'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>

                        {chatInput && (
                          <div className="flex justify-end">
                            <div className="bg-indigo-600 text-white font-medium p-2.5 rounded-xl rounded-tr-none max-w-[85%] text-xs font-mono">
                              {chatInput}
                              <span className="w-1 h-3 bg-white inline-block animate-pulse ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Moving block visual timeline */}
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-white dark:bg-zinc-900 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Updated Schedule Shifts</span>
                          {showRescheduled && (
                            <span className="text-xxs text-emerald-500 dark:text-emerald-400 font-extrabold flex items-center gap-1.5 animate-bounce">
                              <Check className="w-3 h-3" /> SHIFT COMPLETE
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xxs">
                          <div className="border border-zinc-200 dark:border-zinc-800 rounded p-1.5 text-left bg-zinc-50 dark:bg-zinc-950 opacity-60">
                            <p className="font-bold text-zinc-400">Thursday Morning</p>
                            <p className="text-zinc-400">❌ [Original Block Moved]</p>
                          </div>
                          
                          <AnimatePresence mode="wait">
                            {!showRescheduled ? (
                              <motion.div 
                                key="pending"
                                className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded p-1.5 text-left bg-zinc-50/20 dark:bg-zinc-950/10 flex items-center justify-center min-h-[38px]"
                              >
                                <span className="text-zinc-400 font-mono animate-pulse">Awaiting Shift...</span>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="shifted"
                                initial={{ scale: 0.9, y: 10, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                className="border-l-4 border-indigo-500 border border-y-indigo-100 dark:border-y-indigo-950 border-r-indigo-100 dark:border-r-indigo-950 rounded p-1.5 text-left bg-indigo-50/10 dark:bg-indigo-950/10"
                              >
                                <p className="font-bold text-indigo-600 dark:text-indigo-400">Friday Morning 🆕</p>
                                <p className="font-bold text-zinc-900 dark:text-white truncate">👥 Review with peers slot</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Simulation bottom details footer bar */}
              <div className="px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-left text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between font-medium">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Action: {STEPS[currentStep - 1].actionTitle}</span>
                <span className="font-mono text-xxs text-zinc-400 dark:text-zinc-500">Step {currentStep}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel: Interactive call to actions */}
        <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            Ready to try VibeGuru with your actual real-life deadlines?
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Close Demo
            </button>
            <button 
              onClick={() => {
                onClose();
                // We're ready, let's navigate to the dashboard
                window.location.href = "/dashboard";
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-500/10"
            >
              Try It Live 🚀
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
