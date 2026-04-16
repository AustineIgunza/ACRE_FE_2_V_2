import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

interface LearningAnalytics {
  recentActivity: {
    timestamp: string;
    conceptId: string;
    conceptName: string;
    score: number;
    phase: number;
  }[];
  timelineItems: {
    dueDate: string;
    conceptId: string;
    conceptName: string;
    urgency: "critical" | "high" | "medium" | "low";
    daysUntilDue: number;
  }[];
  summary: {
    totalReviewsThisWeek: number;
    averageScore: number;
    masteredCount: number;
    needsReviewCount: number;
    trend: "improving" | "stable" | "declining";
  };
}

// Mock agentic AI insights generation
function generateAIInsights(analytics: LearningAnalytics): string {
  const { recentActivity, timelineItems, summary } = analytics;
  
  let insight = "";
  
  if (summary.trend === "improving") {
    insight += `🎯 You're making excellent progress! Your average score has been ${summary.averageScore}%. `;
  } else if (summary.trend === "declining") {
    insight += `⚠️ Your scores have been declining recently. Consider reviewing foundational concepts. `;
  } else {
    insight += `📊 Your learning is steady with an average score of ${summary.averageScore}%. `;
  }
  
  if (summary.masteredCount > 0) {
    insight += `You've mastered ${summary.masteredCount} concepts recently. `;
  }
  
  const criticalItems = timelineItems.filter(item => item.urgency === "critical");
  if (criticalItems.length > 0) {
    insight += `You have ${criticalItems.length} critical review${criticalItems.length > 1 ? 's' : ''} due soon. `;
  }
  
  if (recentActivity.length > 0) {
    const lastActivity = recentActivity[0];
    insight += `Your most recent work was on ${lastActivity.conceptName} (${lastActivity.score}% accuracy).`;
  }
  
  return insight;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Fetch recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentData, error: recentError } = await supabase
      .from("user_progress")
      .select("concept_id, current_interval, last_reviewed, current_ease, reviews_count")
      .eq("user_id", userId)
      .gte("last_reviewed", sevenDaysAgo.toISOString())
      .order("last_reviewed", { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    // Fetch timeline items (concepts due soon)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: timelineData, error: timelineError } = await supabase
      .from("user_progress")
      .select("concept_id, next_due_timestamp, current_interval")
      .eq("user_id", userId)
      .lte("next_due_timestamp", tomorrow.toISOString())
      .order("next_due_timestamp", { ascending: true })
      .limit(5);

    if (timelineError) throw timelineError;

    // Transform to analytics format
    const recentActivity = (recentData || []).map((item: any, idx: number) => ({
      timestamp: new Date().toISOString(),
      conceptId: item.concept_id,
      conceptName: `Concept ${item.concept_id}`,
      score: Math.round(Math.random() * 40 + 60), // Mock score
      phase: Math.ceil((item.reviews_count || 1) / 3),
    }));

    const now = new Date();
    const timelineItems = (timelineData || []).map((item: any) => {
      const dueDate = new Date(item.next_due_timestamp);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let urgency: "critical" | "high" | "medium" | "low" = "low";
      if (daysUntilDue <= 0) urgency = "critical";
      else if (daysUntilDue <= 1) urgency = "high";
      else if (daysUntilDue <= 3) urgency = "medium";

      return {
        dueDate: dueDate.toISOString(),
        conceptId: item.concept_id,
        conceptName: `Concept ${item.concept_id}`,
        urgency,
        daysUntilDue,
      };
    });

    // Calculate summary
    const summary = {
      totalReviewsThisWeek: recentActivity.length,
      averageScore: recentActivity.length > 0
        ? Math.round(
            recentActivity.reduce((sum: number, a: any) => sum + a.score, 0) /
              recentActivity.length
          )
        : 0,
      masteredCount: recentActivity.filter((a: any) => a.score >= 80).length,
      needsReviewCount: timelineItems.filter(
        (t) => t.urgency === "critical" || t.urgency === "high"
      ).length,
      trend: (
        recentActivity.length > 2 &&
        recentActivity[0].score > recentActivity[recentActivity.length - 1].score
          ? "improving"
          : recentActivity.length > 0
          ? "stable"
          : "declining"
      ) as "improving" | "stable" | "declining",
    };

    const analytics: LearningAnalytics = {
      recentActivity,
      timelineItems,
      summary,
    };

    const aiInsight = generateAIInsights(analytics);

    return NextResponse.json({
      success: true,
      analytics,
      aiInsight,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate analytics",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "AI Insights Analytics API",
    usage: "POST with { userId }",
  });
}
