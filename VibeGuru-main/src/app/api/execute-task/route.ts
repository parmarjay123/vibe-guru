import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Lazy initialize Gemini client to ensure it doesn't crash if key is missing on startup
let aiClient: any = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const { taskName, masterGoal, quadrant, timeEstimate } = await req.json();

    if (!taskName) {
      return NextResponse.json({ error: "taskName is required" }, { status: 400 });
    }

    const ai = getAiClient();
    
    const prompt = `You are VibeGuru, the high-agency productivity mastermind. The user is swamped and wants you to write a high-value STARTING ASSET, outline, or code boilerplate to directly EXECUTE the following sub-task.

MASTER GOAL: "${masterGoal || "General Task"}"
SUB-TASK NAME: "${taskName}"
QUADRANT: ${quadrant || "Q2"}
TIME ESTIMATE: ${timeEstimate || "1-2 hours"}

## INSTRUCTIONS:
- Generate actionable starting assets. If it's a coding task, write clean code snippets. If it's writing or studying, write a detailed executive structure, email draft, or concrete outlines.
- Keep explanations and filler remarks to an absolute minimum. Output direct, highly polished starting material that the user can copy-paste and immediately run or customize.
- Format with clean Markdown headers and code blocks where applicable. Keep the whole response under 350 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const resultText = response.text || "Failed to generate execution assets.";
    return NextResponse.json({ result: resultText });
  } catch (err: any) {
    console.error("Execute task error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal execution generation error" },
      { status: 500 }
    );
  }
}
