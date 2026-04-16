"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalyticsData {
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
  customSections?: Array<{
    id: string;
    title: string;
    indicator: string;
    color: string;
    items: any[];
  }>;
}

interface DashboardAnalyticsProps {
  userId?: string;
  customSections?: Array<{
    id: string;
    title: string;
    indicator: string;
    color: "purple" | "blue" | "green" | "red" | "amber" | "pink" | "cyan";
    fetchData: (userId: string) => Promise<any[]>;
  }>;
}

export default function DashboardAnalytics({ userId, customSections }: DashboardAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{
    recent: boolean;
    timeline: boolean;
    [key: string]: boolean;
  }>({ recent: false, timeline: false });

  useEffect(() => {
    if (!userId) return;

    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics/ai-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();
        if (data.success) {
          // Load custom sections if provided
          if (customSections && customSections.length > 0) {
            const customData = await Promise.all(
              customSections.map(async (section) => ({
                ...section,
                items: await section.fetchData(userId),
              }))
            );
            data.analytics.customSections = customData;
          }
          setAnalytics(data.analytics);
          setAiInsight(data.aiInsight);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  if (loading || !analytics) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-gray-700/50 rounded-lg mb-4" />
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "from-red-900/60 to-red-900/20 border-red-500/60 shadow-red-500/20";
      case "high":
        return "from-orange-900/60 to-orange-900/20 border-orange-500/60 shadow-orange-500/20";
      case "medium":
        return "from-yellow-900/60 to-yellow-900/20 border-yellow-500/60 shadow-yellow-500/20";
      default:
        return "from-blue-900/60 to-blue-900/20 border-blue-500/60 shadow-blue-500/20";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "🔴 Critical";
      case "high":
        return "🟠 High";
      case "medium":
        return "🟡 Medium";
      default:
        return "🔵 Low";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI INSIGHT BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/60 rounded-lg overflow-hidden"
        style={{
          boxShadow:
            "0 0 20px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.1)",
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.2), transparent 50%)",
            animation: "pulse 3s ease-in-out infinite",
          }}
        />
        <div className="relative z-10 flex items-start gap-4">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="text-lg font-bold text-purple-100 mb-2">
              AI Insights
            </h3>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              {aiInsight}
            </p>
          </div>
        </div>
      </motion.div>

      {/* SUMMARY STATS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Reviews This Week */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-br from-blue-900/40 to-blue-900/10 border border-blue-500/40 rounded-lg cursor-pointer"
          style={{
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-300 uppercase">
              This Week
            </span>
            <span className="text-lg">📅</span>
          </div>
          <div className="text-2xl font-bold text-blue-100">
            {analytics.summary.totalReviewsThisWeek}
          </div>
          <div className="text-xs text-blue-200/70 mt-1">Reviews</div>
        </motion.div>

        {/* Average Score */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-br from-green-900/40 to-green-900/10 border border-green-500/40 rounded-lg cursor-pointer"
          style={{
            boxShadow: "0 0 15px rgba(34, 197, 94, 0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-300 uppercase">
              Avg Score
            </span>
            <span className="text-lg">📈</span>
          </div>
          <div className="text-2xl font-bold text-green-100">
            {analytics.summary.averageScore}%
          </div>
          <div className="text-xs text-green-200/70 mt-1">Accuracy</div>
        </motion.div>

        {/* Mastered */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-br from-red-900/40 to-red-900/10 border border-red-500/40 rounded-lg cursor-pointer"
          style={{
            boxShadow: "0 0 15px rgba(239, 68, 68, 0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-300 uppercase">
              🔥 Mastered
            </span>
            <span className="text-lg">⚡</span>
          </div>
          <div className="text-2xl font-bold text-red-100">
            {analytics.summary.masteredCount}
          </div>
          <div className="text-xs text-red-200/70 mt-1">Concepts</div>
        </motion.div>

        {/* Needs Review */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-br from-amber-900/40 to-amber-900/10 border border-amber-500/40 rounded-lg cursor-pointer"
          style={{
            boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-300 uppercase">
              Needs Review
            </span>
            <span className="text-lg">⚠️</span>
          </div>
          <div className="text-2xl font-bold text-amber-100">
            {analytics.summary.needsReviewCount}
          </div>
          <div className="text-xs text-amber-200/70 mt-1">Due Soon</div>
        </motion.div>
      </motion.div>

      {/* RECENT ACTIVITY - EXPANDABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/60 rounded-lg overflow-hidden"
      >
        <motion.button
          onClick={() =>
            setExpandedSections((prev) => ({
              ...prev,
              recent: !prev.recent,
            }))
          }
          className="w-full p-4 flex items-center justify-between hover:bg-gray-700/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-2 h-2 bg-green-500 rounded-full"
                style={{
                  animation: "pulse 2s ease-in-out infinite",
                  boxShadow: "0 0 10px rgba(34, 197, 94, 0.8)",
                }}
              />
            </div>
            <span className="font-semibold text-gray-100">Recent Activity</span>
            <span className="text-xs bg-green-900/50 text-green-200 px-2 py-1 rounded-full">
              {analytics.recentActivity.length} items
            </span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.recent ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-lg">▼</span>
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {expandedSections.recent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-700/40 max-h-96 overflow-y-auto"
            >
              <div className="p-4 space-y-3">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-600/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-100">
                          {activity.conceptName}
                        </span>
                        <span
                          className={`text-sm font-bold px-2 py-1 rounded ${
                            activity.score >= 80
                              ? "bg-green-900/50 text-green-200"
                              : activity.score >= 60
                              ? "bg-yellow-900/50 text-yellow-200"
                              : "bg-red-900/50 text-red-200"
                          }`}
                        >
                          {activity.score}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Phase {activity.phase}</span>
                        <span>
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No recent activity yet
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* TIMELINE - EXPANDABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/60 rounded-lg overflow-hidden"
      >
        <motion.button
          onClick={() =>
            setExpandedSections((prev) => ({
              ...prev,
              timeline: !prev.timeline,
            }))
          }
          className="w-full p-4 flex items-center justify-between hover:bg-gray-700/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-2 h-2 bg-red-500 rounded-full"
                style={{
                  animation: "pulse 1s ease-in-out infinite",
                  boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)",
                }}
              />
            </div>
            <span className="font-semibold text-gray-100">Timeline & Due</span>
            <span className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded-full">
              {analytics.timelineItems.filter(
                (t) => t.urgency === "critical" || t.urgency === "high"
              ).length || 0}{" "}
              urgent
            </span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.timeline ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-lg">▼</span>
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {expandedSections.timeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-700/40 max-h-96 overflow-y-auto"
            >
              <div className="p-4 space-y-3">
                {analytics.timelineItems.length > 0 ? (
                  analytics.timelineItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-lg hover:scale-105 cursor-pointer transition-transform border bg-gradient-to-r ${getUrgencyColor(
                        item.urgency
                      )}`}
                      style={{
                        boxShadow: `0 0 12px var(--shadow-color)`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-100">
                          {item.conceptName}
                        </span>
                        <span className="text-xs font-semibold text-gray-200">
                          {getUrgencyBadge(item.urgency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span>Due: {item.daysUntilDue} days</span>
                        <span>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No upcoming reviews
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CUSTOM SECTIONS */}
      {analytics?.customSections && analytics.customSections.map((section: any, idx: number) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + idx * 0.1 }}
          className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/60 rounded-lg overflow-hidden"
        >
          <motion.button
            onClick={() =>
              setExpandedSections((prev) => ({
                ...prev,
                [section.id]: !prev[section.id],
              }))
            }
            className="w-full p-4 flex items-center justify-between hover:bg-gray-700/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  animation: "pulse 2s ease-in-out infinite",
                  backgroundColor: section.color,
                  boxShadow: `0 0 10px ${section.color}80`,
                }}
              />
              <span className="font-semibold text-gray-100">{section.title}</span>
              <span className="text-xs bg-gray-700/50 text-gray-200 px-2 py-1 rounded-full">
                {section.items?.length || 0} items
              </span>
            </div>
            <motion.div
              animate={{ rotate: expandedSections[section.id] ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-lg">▼</span>
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections[section.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-700/40 max-h-96 overflow-y-auto"
              >
                <div className="p-4 space-y-3">
                  {section.items && section.items.length > 0 ? (
                    section.items.map((item: any, itemIdx: number) => (
                      <motion.div
                        key={itemIdx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIdx * 0.05 }}
                        className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-600/30"
                      >
                        <div className="text-sm text-gray-100">
                          {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No items
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
