import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Get user units with their topics and concepts
    const { data: units } = await supabase
      .from("user_units")
      .select("*")
      .eq("user_id", userId);

    const { data: topics } = await supabase
      .from("user_topics")
      .select("*")
      .eq("user_id", userId);

    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    // Build hierarchical structure: Unit -> Topics -> Concepts
    const unitsWithTopics = (units || []).map((unit: any) => {
      const unitTopics = (topics || [])
        .filter((t: any) => t.unit_id === unit.id)
        .map((topic: any) => {
          const topicConcepts = (progress || [])
            .filter((p: any) => p.node_id?.includes(topic.id))
            .map((p: any) => ({
              nodeId: p.node_id,
              thermalState: p.thermal_state,
              heatScore: p.heat_score,
              attempts: p.attempt_count,
              lastUpdated: p.updated_at,
            }));
          
          const topicMastered = topicConcepts.filter((c: any) => c.thermalState === "ignition").length;
          const topicTotal = topicConcepts.length;
          
          return {
            id: topic.id,
            title: topic.title,
            sourceUrl: topic.source_url,
            sourceType: topic.source_type,
            contentLength: topic.content_length,
            nodeCount: topic.node_count,
            concepts: topicConcepts,
            masteryPercentage: topicTotal > 0 ? Math.round((topicMastered / topicTotal) * 100) : 0,
            totalConcepts: topicTotal,
            masteredConcepts: topicMastered,
          };
        });

      const unitMastered = unitTopics.reduce((sum: number, t: any) => sum + t.masteredConcepts, 0);
      const unitTotal = unitTopics.reduce((sum: number, t: any) => sum + t.totalConcepts, 0);

      return {
        id: unit.id,
        title: unit.title,
        topics: unitTopics,
        masteryPercentage: unitTotal > 0 ? Math.round((unitMastered / unitTotal) * 100) : 0,
        totalConcepts: unitTotal,
        masteredConcepts: unitMastered,
      };
    });

    // Calculate statistics
    const totalNodes = progress?.length || 0;
    const masteredNodes = progress?.filter((p: any) => p.thermal_state === "ignition").length || 0;
    const warningNodes = progress?.filter((p: any) => p.thermal_state === "warning").length || 0;
    const frostNodes = progress?.filter((p: any) => p.thermal_state === "frost").length || 0;
    const untackedNodes = totalNodes - masteredNodes - warningNodes - frostNodes;

    // Get recently reviewed (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyReviewed = progress?.filter((p: any) => {
      const updated = new Date(p.updated_at);
      return updated > sevenDaysAgo;
    }).length || 0;

    // Get nodes that need urgent attention (frost or warning, not updated in 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const urgentNodes = progress?.filter((p: any) => {
      const updated = new Date(p.updated_at);
      return (p.thermal_state === "frost" || p.thermal_state === "warning") && updated < threeDaysAgo;
    }) || [];

    // Get most reviewed (highest attempt count)
    const mostReviewed = progress
      ?.sort((a: any, b: any) => (b.attempt_count || 0) - (a.attempt_count || 0))
      .slice(0, 5) || [];

    // Calculate mastery percentage
    const masteryPercentage = totalNodes > 0 ? Math.round((masteredNodes / totalNodes) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalNodes,
        masteredNodes,
        warningNodes,
        frostNodes,
        untackedNodes,
        masteryPercentage,
        recentlyReviewed,
        urgentCount: urgentNodes.length,
      },
      hierarchy: {
        units: unitsWithTopics,
        totalUnits: unitsWithTopics.length,
        totalTopics: unitsWithTopics.reduce((sum: number, u: any) => sum + u.topics.length, 0),
      },
      urgentNodes: urgentNodes.slice(0, 8),
      mostReviewed: mostReviewed.map((p: any) => ({
        nodeId: p.node_id,
        attempts: p.attempt_count,
        thermalState: p.thermal_state,
        lastUpdated: p.updated_at,
        heatScore: p.heat_score,
      })),
      timeline: {
        sevenDays: recentlyReviewed,
        needsReview: frostNodes + warningNodes,
        alreadyMastered: masteredNodes,
        notStarted: untackedNodes,
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

