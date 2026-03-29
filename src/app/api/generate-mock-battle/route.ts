import { NextRequest, NextResponse } from "next/server";
import { getMockQuizEncounters } from "@/lib/mockQuizzes";

/**
 * Mock battle scenarios endpoint
 * Used when the real backend API is unavailable or quota is exceeded
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title } = body;

    // Create a mock boss battle with quiz questions
    const encounters = getMockQuizEncounters();

    // Randomize the order
    const shuffledEncounters = [...encounters].sort(() => Math.random() - 0.5);

    const response = {
      battle_state: {
        boss: {
          boss_name: `Quiz: ${title || "Knowledge Test"}`,
          intro_narrative: `Answer questions to test your knowledge on this topic.`,
          encounters: shuffledEncounters,
        },
        current_encounter_index: 0,
        player_hp: 100,
        max_player_hp: 100,
        boss_hp: shuffledEncounters.length * 20,
        max_boss_hp: shuffledEncounters.length * 20,
        is_victory: false,
        is_defeat: false,
        battle_log: [],
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Mock Battle API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate mock battle scenarios" },
      { status: 500 }
    );
  }
}
