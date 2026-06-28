const RETRYABLE_CODES = ["503", "429", "500", "502", "504", "UNAVAILABLE", "RESOURCE_EXHAUSTED"];

export function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return RETRYABLE_CODES.some((code) => msg.includes(code));
}

/** Never expose raw API errors to end users. */
export function toUserFriendlyError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  if (
    msg.includes("503") ||
    msg.includes("high demand") ||
    msg.includes("UNAVAILABLE")
  ) {
    return "VibeGuru is busy right now. Please wait a moment and try again.";
  }

  if (msg.includes("429") || msg.includes("quota") || msg.includes("RATE_LIMIT")) {
    return "Too many requests right now. Please try again in a minute.";
  }

  if (msg.includes("404") && msg.includes("model")) {
    return "AI service is updating. Please try again shortly.";
  }

  if (msg.includes("API key") || msg.includes("GEMINI_API_KEY") || msg.includes("401")) {
    return "Service is temporarily unavailable. Please try again later.";
  }

  if (msg.includes("network") || msg.includes("fetch") || msg.includes("ECONNRESET")) {
    return "Connection issue. Check your internet and try again.";
  }

  return "Something went wrong. Please try again.";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
