"use client";

import { useState, useEffect } from "react";
import { Mic, AlertCircle, X } from "lucide-react";

type VoiceInputButtonProps = {
  onTranscript: (text: string) => void;
  className?: string;
  compact?: boolean;
};

export function VoiceInputButton({ onTranscript, className = "", compact = false }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
    }
  }, []);

  // Clear error message after 6 seconds automatically
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  if (!supported) return null;

  const startListening = () => {
    setErrorMsg(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      if (resultText) {
        onTranscript(resultText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      
      if (event.error === "aborted") {
        // Speech recognition was aborted - don't show annoying errors
        return;
      }

      if (event.error === "not-allowed") {
        setErrorMsg("Microphone access denied. If you are using the preview frame, click 'Open in new tab' at the top right to grant permissions.");
      } else if (event.error === "no-speech") {
        setErrorMsg("No speech detected. Try speaking closer to your microphone.");
      } else {
        setErrorMsg(`Voice assistant error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition", err);
      setErrorMsg("Failed to start voice listener. Try clicking again.");
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={startListening}
        className={`flex items-center justify-center p-2 rounded-lg transition-all ${
          isListening
            ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
            : "bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        } ${className}`}
        title={isListening ? "Listening... Speak now" : "Dictate text via voice"}
      >
        {isListening ? (
          <span className="flex items-center gap-1 text-xs">
            <Mic className="w-4 h-4 text-red-500 animate-bounce" />
            {!compact && <span className="hidden sm:inline font-medium">Listening...</span>}
          </span>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Graceful Speech Recognition Inline Toast */}
      {errorMsg && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-64 p-3 bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 rounded-xl shadow-xl border border-zinc-700 text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-250">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-zinc-200">Voice Assistant Hint</p>
            <p className="text-zinc-400 mt-0.5 leading-relaxed">{errorMsg}</p>
          </div>
          <button 
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-zinc-400 hover:text-white shrink-0 cursor-pointer p-0.5 rounded hover:bg-zinc-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
