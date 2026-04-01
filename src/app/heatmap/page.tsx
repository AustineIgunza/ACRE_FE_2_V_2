"use client";

import { useEffect } from "react";
import { useArceStore } from "@/store/arceStore";
import { useThermalStore } from "@/store/thermalStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ThermalHeatmap from "@/components/ThermalHeatmap";

export default function HeatmapPage() {
  const { user, authInitialized, initAuth } = useArceStore();
  const { fetchThermalLibrary } = useThermalStore();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/signin");
    }
  }, [user, authInitialized, router]);

  // Reload thermal data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchThermalLibrary();
      }
    };

    // Also load immediately when page mounts
    fetchThermalLibrary();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchThermalLibrary]);

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0c" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#ff5c35",
          animation: "spin 0.6s linear infinite"
        }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0a0a0c", minHeight: "100vh", color: "#f0f2ec" }}>
      <Navbar />

      <main role="main" style={{ padding: "48px 24px 80px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Heatmap Header */}
        <div style={{ marginBottom: "40px", animation: "slideUp 0.4s ease-out" }}>
          <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block", color: "rgba(255,255,255,0.4)" }}>
            MASTERY TRACKING
          </span>
          <h1 style={{ fontSize: "36px", letterSpacing: "-1px", color: "#fff", marginBottom: "8px" }}>
            Thermal Heatmap
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.6)" }}>
            Visualize your learning progress across all concepts through thermal states.
          </p>
        </div>

        <ThermalHeatmap />
      </main>
    </div>
  );
}
