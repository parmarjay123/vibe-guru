import { NextRequest, NextResponse } from "next/server";
import { chatWithGuru } from "@/lib/gemini";
import { PlanSessionContext } from "@/lib/session-context";
import { apiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, today, session } = body as {
      message: string;
      today?: string;
      session: PlanSessionContext;
    };

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (!session?.task) {
      return NextResponse.json(
        { error: "Session context is required." },
        { status: 400 }
      );
    }

    const reply = await chatWithGuru(message, session, today);
    return NextResponse.json({ reply });
  } catch (error) {
    return apiError(error, "Chat error");
  }
}
