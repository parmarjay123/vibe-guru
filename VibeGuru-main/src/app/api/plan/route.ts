import { NextRequest, NextResponse } from "next/server";
import { generatePlan } from "@/lib/gemini";
import { apiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task, deadline, dailyHours, blocker, extraContext, today } = body;

    if (!task || !deadline || !dailyHours) {
      return NextResponse.json(
        { error: "Task, deadline, and daily hours are required." },
        { status: 400 }
      );
    }

    const planMarkdown = await generatePlan(
      {
        task,
        deadline,
        dailyHours,
        blocker: blocker || "None specified",
        extraContext,
      },
      today
    );

    return NextResponse.json({ planMarkdown });
  } catch (error) {
    return apiError(error, "Plan generation error");
  }
}
