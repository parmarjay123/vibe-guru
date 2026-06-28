/** Primary model + fallbacks when busy or unavailable */
export const GEMINI_MODELS = [
  process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
].filter((m, i, arr) => arr.indexOf(m) === i);

export const GEMINI_MODEL = GEMINI_MODELS[0];
