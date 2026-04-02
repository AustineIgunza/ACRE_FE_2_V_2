import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { calculateSM2 } from "@/utils/sm2Algorithm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, conceptId, quality, userResponse, reviewPhase } = body;

    if (!userId || !conceptId || quality === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch current tracking data
    const { data: trackingData, error: fetchError } = await supabase
      .from("concept_review_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("concept_id", conceptId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch tracking data" },
        { status: 500 }
      );
    }

    const now = Math.floor(Date.now() / 1000);

    if (!trackingData) {
      // First review - initialize tracking with SM-2
      const sm2Result = calculateSM2(0, 2.5, quality);

      const { error: insertError } = await supabase
        .from("concept_review_tracking")
        .insert({
          user_id: userId,
          concept_id: conceptId,
          last_reviewed_timestamp: now,
          current_interval: sm2Result.newInterval,
          ease_multiplier: sm2Result.newEaseFactor,
          next_due_timestamp: now + sm2Result.newInterval * 86400,
          review_phase: sm2Result.nextPhase,
          quality_of_response: quality,
          total_reviews: 1,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to create tracking record" },
          { status: 500 }
        );
      }

      // Log review session
      await supabase.from("flashpoint_review_sessions").insert({
        user_id: userId,
        concept_id: conceptId,
        review_phase: reviewPhase,
        user_response: userResponse,
        is_correct: quality >= 3,
        quality_score: quality,
        timestamp: now,
      });

      return NextResponse.json(
        {
          success: true,
          message: "First review submitted successfully",
          newInterval: sm2Result.newInterval,
          nextPhase: sm2Result.nextPhase,
          nextReviewDate: new Date((now + sm2Result.newInterval * 86400) * 1000).toISOString(),
        },
        { status: 200 }
      );
    }

    // Calculate new interval using SM-2
    const sm2Result = calculateSM2(
      trackingData.current_interval,
      trackingData.ease_multiplier,
      quality
    );

    const nextDueTimestamp = now + sm2Result.newInterval * 86400;

    // Update tracking record
    const { error: updateError } = await supabase
      .from("concept_review_tracking")
      .update({
        last_reviewed_timestamp: now,
        current_interval: sm2Result.newInterval,
        ease_multiplier: sm2Result.newEaseFactor,
        next_due_timestamp: nextDueTimestamp,
        review_phase: sm2Result.nextPhase,
        quality_of_response: quality,
        total_reviews: trackingData.total_reviews + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("concept_id", conceptId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update tracking record" },
        { status: 500 }
      );
    }

    // Log review session
    await supabase.from("flashpoint_review_sessions").insert({
      user_id: userId,
      concept_id: conceptId,
      review_phase: reviewPhase,
      user_response: userResponse,
      is_correct: quality >= 3,
      quality_score: quality,
      timestamp: now,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted and tracked successfully",
        newInterval: sm2Result.newInterval,
        nextPhase: sm2Result.nextPhase,
        nextReviewDate: new Date(nextDueTimestamp * 1000).toISOString(),
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
