import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODELS } from "./gemini-config";
import { isRetryableError, sleep } from "./gemini-errors";
import { validatePlanSchedule } from "./availability";
import { getAllConstraints } from "./session-context";
import {
  VIBEGURU_SYSTEM_INSTRUCTION,
  buildReplanPrompt,
  buildUserPrompt,
  buildChatPrompt,
  PlanSessionContext,
} from "./prompts";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

async function generateText(prompt: string): Promise<string> {
  const genAI = getGenAI();
  let lastError: unknown;

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: VIBEGURU_SYSTEM_INSTRUCTION,
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text) throw new Error("Empty response");
        return text;
      } catch (error) {
        lastError = error;
        console.error(`Gemini [${modelName}] attempt ${attempt + 1}:`, error);

        if (isRetryableError(error) && attempt === 0) {
          await sleep(1500);
          continue;
        }
        if (isRetryableError(error)) break;
        throw error;
      }
    }
  }

  throw lastError ?? new Error("All models failed");
}

type ValidationCtx = {
  constraints: string[];
  originalBlocker: string;
  dailyHours: string;
};

async function generateWithScheduleValidation(
  prompt: string,
  ctx: ValidationCtx
): Promise<string> {
  let text = await generateText(prompt);
  const constraints = getAllConstraints(ctx.originalBlocker, ctx.constraints);

  const violations = validatePlanSchedule(
    text,
    constraints,
    ctx.originalBlocker,
    ctx.dailyHours
  );
  if (violations.length === 0) return text;

  console.warn("Schedule validation failed, retrying:", violations);

  const fixPrompt = `${prompt}

YOUR PREVIOUS SCHEDULE HAD ERRORS — FIX ALL OF THESE:
${violations.map((v) => `- ${v}`).join("\n")}

Regenerate the full plan. Schedule section MUST use ONLY the allowed work windows from COMPUTED AVAILABILITY.`;

  text = await generateText(fixPrompt);
  return text;
}

export type PlanInput = {
  task: string;
  deadline: string;
  dailyHours: string;
  blocker: string;
  extraContext?: string;
};

export type ReplanInput = {
  completedItems: string;
  skippedItems: string;
  scheduleChange: string;
  newBlocker: string;
  session: PlanSessionContext;
};

export async function generatePlan(
  input: PlanInput,
  todayIso?: string
): Promise<string> {
  const prompt = buildUserPrompt(input, todayIso);
  return generateWithScheduleValidation(prompt, {
    constraints: input.blocker ? [input.blocker] : [],
    originalBlocker: input.blocker,
    dailyHours: input.dailyHours,
  });
}

export async function generateReplan(
  input: ReplanInput,
  todayIso?: string
): Promise<string> {
  const prompt = buildReplanPrompt(input, todayIso);
  return generateWithScheduleValidation(prompt, {
    constraints: input.session.constraints,
    originalBlocker: input.session.originalBlocker,
    dailyHours: input.session.dailyHours,
  });
}

export async function chatWithGuru(
  message: string,
  session: PlanSessionContext,
  todayIso?: string
): Promise<string> {
  const prompt = buildChatPrompt(message, session, todayIso);
  const text = await generateWithScheduleValidation(prompt, {
    constraints: session.constraints,
    originalBlocker: session.originalBlocker,
    dailyHours: session.dailyHours,
  });
  return text;
}
