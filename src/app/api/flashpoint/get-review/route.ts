import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const conceptId = req.nextUrl.searchParams.get("conceptId");

    if (!userId || !conceptId) {
      return NextResponse.json(
        { error: "Missing userId or conceptId" },
        { status: 400 }
      );
    }

    // Fetch tracking data
    const { data: tracking, error: trackingError } = await supabase
      .from("concept_review_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("concept_id", conceptId)
      .single();

    if (trackingError) {
      console.error("Tracking fetch error:", trackingError);
      return NextResponse.json(
        { error: "Concept not found" },
        { status: 404 }
      );
    }

    // Fetch concept details for content
    const { data: concept, error: conceptError } = await supabase
      .from("concepts")
      .select("*")
      .eq("id", conceptId)
      .single();

    if (conceptError) {
      console.error("Concept fetch error:", conceptError);
      return NextResponse.json(
        { error: "Failed to fetch concept details" },
        { status: 500 }
      );
    }

    const reviewPhase = tracking.review_phase;
    let content: any = {};

    // Generate phase-specific content based on review_phase
    // This is placeholder - you'd fetch or generate the actual scenarios
    if (reviewPhase === "phase-1") {
      content = {
        crisis_scenario: concept.crisis_scenario_phase1 || "Economic crisis scenario for recognition training.",
        options: [
          { id: "a", label: "Option A: Action 1" },
          { id: "b", label: "Option B: Action 2 (Correct)" },
          { id: "c", label: "Option C: Action 3" },
        ],
      };
    } else if (reviewPhase === "phase-2") {
      content = {
        crisis_scenario: concept.crisis_scenario_phase2 || "Economic crisis scenario for application training.",
        guidance_text: concept.flawed_proposal_phase2 || "Minister proposes stimulus distribution.",
      };
    } else {
      content = {
        crisis_scenario: concept.crisis_scenario_phase3 || "Economic crisis with missing critical variable.",
        missing_variable: concept.missing_variable_hint_phase3 || "What is the current employment rate?",
      };
    }

    return NextResponse.json(
      {
        review_phase: reviewPhase,
        content,
        concept_title: concept.title,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
