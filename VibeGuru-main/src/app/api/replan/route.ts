import { NextRequest, NextResponse } from "next/server";
import { generateReplan } from "@/lib/gemini";
import { PlanSessionContext } from "@/lib/session-context";
import { apiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      completedItems,
      skippedItems,
      scheduleChange,
      newBlocker,
      today,
      session,
    } = body as {
      completedItems?: string;
      skippedItems?: string;
      scheduleChange?: string;
      newBlocker?: string;
      today?: string;
      session: PlanSessionContext;
    };

    if (!session?.task || !session?.deadline) {
      return NextResponse.json(
        { error: "Session context with task and deadline is required." },
        { status: 400 }
      );
    }

    const planMarkdown = await generateReplan(
      {
        completedItems: completedItems || "",
        skippedItems: skippedItems || "",
        scheduleChange: scheduleChange || "",
        newBlocker: newBlocker || "",
        session,
      },
      today
    );

    return NextResponse.json({ planMarkdown });
  } catch (error) {
    return apiError(error, "Replan error");
  }
}
