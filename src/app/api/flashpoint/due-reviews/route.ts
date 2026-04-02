import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Query Supabase for due reviews
    const { data, error } = await supabase
      .from("concept_review_tracking")
      .select("*")
      .eq("user_id", userId)
      .lte("next_due_timestamp", Math.floor(Date.now() / 1000));

    if (error) {
      // If table doesn't exist, return empty list (this is normal for first-time setup)
      if (error.code === 'PGRST205') {
        console.log("concept_review_tracking table not yet created");
        return NextResponse.json({ due_reviews: [] }, { status: 200 });
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch due reviews", due_reviews: [] },
        { status: 200 } // Return 200 with empty array instead of error
      );
    }

    // Map data to FlashpointDashboardItem format
    const dueReviews = (data || []).map((item: any) => {
      const now = Math.floor(Date.now() / 1000);
      const daysUntilReview = Math.max(0, Math.ceil((item.next_due_timestamp - now) / 86400));
      
      // Determine urgency based on days until review
      let urgency = "low";
      if (daysUntilReview === 0) urgency = "critical";
      else if (daysUntilReview <= 2) urgency = "high";
      else if (daysUntilReview <= 7) urgency = "medium";

      return {
        conceptId: item.concept_id,
        title: item.concept_title || "Unnamed Concept",
        current_interval: item.current_interval,
        next_due_timestamp: item.next_due_timestamp,
        review_phase: item.review_phase,
        daysUntilReview,
        urgency,
      };
    });

    // Sort by urgency and daysUntilReview
    const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    dueReviews.sort((a, b) => {
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return a.daysUntilReview - b.daysUntilReview;
    });

    return NextResponse.json({ due_reviews: dueReviews }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error", due_reviews: [] },
      { status: 200 } // Return 200 with empty array
    );
  }
}
