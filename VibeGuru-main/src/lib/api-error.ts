import { NextResponse } from "next/server";
import { toUserFriendlyError } from "@/lib/gemini-errors";

export function apiError(error: unknown, logLabel: string) {
  console.error(`${logLabel}:`, error);
  return NextResponse.json(
    { error: toUserFriendlyError(error) },
    { status: 503 }
  );
}
