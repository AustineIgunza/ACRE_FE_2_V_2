"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useArceStore } from "@/store/arceStore";
import { useThermalStore } from "@/store/thermalStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const { user, authInitialized, initAuth, fetchProgress, userProgress, progressDetails } = useArceStore();
  const { units, fetchThermalLibrary } = useThermalStore();
  const router = useRouter();

  useEffect(() => {
    initAuth();
    fetchThermalLibrary();
  }, [initAuth, fetchThermalLibrary]);

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/signin");
    } else if (authInitialized && user) {
      fetchProgress();
      fetchThermalLibrary();
    }
  }, [user, authInitialized, router, fetchProgress, fetchThermalLibrary]);

  // Refresh progress when page becomes visible (returning from battle/heatmap)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authInitialized && user) {
        fetchProgress();
        fetchThermalLibrary();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [authInitialized, user, fetchProgress, fetchThermalLibrary]);

  // Compute live stats from both thermal nodes and DB data
  const stats = useMemo(() => {
    // Get all nodes from thermal units
    const allThermalNodes = units.flatMap(u => u.nodes.map(n => ({
      ...n,
      unitName: u.name,
      unitId: u.id
    })));

    // Get nodes from DB
    const dbNodes = progressDetails;
    
    // Merge: prioritize thermal data if available, fall back to DB
    const uniqueDbNodes = dbNodes.filter(db => !allThermalNodes.some(t => t.id === db.nodeId));
    
    const mergedNodes = [
      ...allThermalNodes,
      ...uniqueDbNodes
    ];

    const totalConcepts = mergedNodes.length;
    const masteredCount = allThermalNodes.filter(n => n.status === 'ignition').length + 
                         uniqueDbNodes.filter(n => n.isIgnited).length;
    const averageHeat = totalConcepts > 0
      ? Math.round((
          allThermalNodes.reduce((sum, n) => sum + n.heat, 0) +
          uniqueDbNodes.reduce((sum, n) => sum + n.heatScore, 0)
        ) / totalConcepts)
      : 0;
    
    const recentNodes = [
      ...allThermalNodes.map(n => ({
        nodeId: n.id,
        title: n.title,
        heatScore: n.heat,
        lastAttempt: typeof n.lastAttempt === 'string' 
          ? n.lastAttempt 
          : n.lastAttempt instanceof Date 
            ? n.lastAttempt.toISOString()
            : new Date().toISOString(),
        isIgnited: n.status === 'ignition'
      })),
      ...uniqueDbNodes.map(db => ({ ...db, title: db.nodeId }))
    ]
      .sort((a, b) => new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime())
      .slice(0, 5);
      
    const decayedNodes = allThermalNodes.filter(n => {
      if (n.status !== 'ignition') return false;
      const lastAttemptTime = n.lastAttempt instanceof Date 
        ? n.lastAttempt.getTime()
        : typeof n.lastAttempt === 'string'
          ? new Date(n.lastAttempt).getTime()
          : 0;
      const hoursSinceAttempt = (Date.now() - lastAttemptTime) / (1000 * 60 * 60);
      return hoursSinceAttempt > 48;
    }).map(n => ({
      nodeId: n.id,
      title: n.title,
      lastAttempt: typeof n.lastAttempt === 'string'
        ? n.lastAttempt
        : n.lastAttempt instanceof Date
          ? n.lastAttempt.toISOString()
          : new Date().toISOString(),
      heatScore: n.heat
    }));

    return { totalConcepts, masteredCount, averageHeat, recentNodes, decayedNodes };
  }, [units, progressDetails]);

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--p-surface)" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid var(--p-border)", borderTopColor: "var(--snap)",
          animation: "spin 0.6s linear infinite"
        }} />
      </div>
    );
  }

  const getHeatColor = (heat: number) => {
    if (heat >= 100) return "var(--snap)";
    if (heat >= 60) return "var(--warning)";
    if (heat >= 25) return "var(--info)";
    return "var(--p-border)";
  };

  const getHeatLabel = (heat: number) => {
    if (heat >= 100) return "Mastered";
    if (heat >= 60) return "Iterated (Hot)";
    if (heat >= 25) return "Learning (Warm)";
    return "Untested Logic";
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <Navbar />

      <main role="main" style={{ padding: "48px 24px 80px", maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "40px", animation: "slideUp 0.4s ease-out" }}>
          <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>
            DASHBOARD
          </span>
          <h1 style={{ fontSize: "36px", letterSpacing: "-1px", color: "var(--t-primary)", marginBottom: "8px" }}>
            Welcome back, {user.name?.split(" ")[0] || user.email?.split("@")[0] || "Student"}.
          </h1>
          <p style={{ fontSize: "17px", color: "var(--t-secondary)" }}>
            Your learning progress at a glance.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px", animation: "slideUp 0.5s ease-out" }}>
          <div className="folio-card" style={{ padding: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--snap)", lineHeight: 1 }}>
              {stats.totalConcepts}
            </div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", margin: "8px 0 0 0" }}>
              Concepts Tracked
            </p>
          </div>
          <div className="folio-card" style={{ padding: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--success)", lineHeight: 1 }}>
              {stats.masteredCount}
            </div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", margin: "8px 0 0 0" }}>
              Fully Mastered
            </p>
          </div>
          <div className="folio-card" style={{ padding: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--xp)", lineHeight: 1 }}>
              {stats.averageHeat}%
            </div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", margin: "8px 0 0 0" }}>
              Avg. Heat Score
            </p>
          </div>
        </div>

        {stats.totalConcepts > 0 && (
          <div style={{ marginBottom: "40px", animation: "slideUp 0.6s ease-out", display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div className="folio-card" style={{ flex: "1 1 calc(100% - 300px)", minWidth: "300px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "4px" }}>My Heatmap: Knowledge Portfolio</h3>
              <p style={{ fontSize: "14px", color: "var(--t-secondary)", marginBottom: "20px" }}>A 5x5 thermal visualization of your tracked concepts.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(30px, 1fr))", gap: "8px", maxWidth: "300px" }}>
                {Array.from({ length: 25 }).map((_, i) => {
                  const node = progressDetails[i];
                  const heat = node ? node.heatScore : 0;
                  return (
                    <div 
                      key={i} 
                      title={node ? `${node.nodeId}: ${heat}%` : "Empty Slot"}
                      style={{
                        aspectRatio: "1",
                        borderRadius: "6px",
                        backgroundColor: getHeatColor(heat),
                        boxShadow: heat >= 100 ? "0 0 10px rgba(200,48,16,0.5)" : "none",
                        border: heat === 0 ? "1px solid var(--p-border)" : "none",
                        transition: "all 0.3s ease"
                      }}
                    />
                  );
                })}
              </div>
            </div>
            
            <div className="folio-card" style={{ flex: "1 1 260px", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center" }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(3, 18px)", 
                gap: "4px", 
                marginBottom: "20px",
                padding: "16px",
                background: "var(--t-deep)",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)"
              }}>
                {Array.from({ length: 9 }).map((_, i) => {
                  const n = progressDetails[i];
                  return <div key={i} style={{ width: "18px", height: "18px", borderRadius: "4px", backgroundColor: getHeatColor(n ? n.heatScore : 0) }} />
                })}
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--t-deep)", marginBottom: "8px", textTransform: "uppercase" }}>
                "{user.name?.split(" ")[0] || user.email?.split("@")[0] || "USER"}'S MASTERY: {stats.averageHeat}% HEAT"
              </h4>
            </div>
          </div>
        )}

        {stats.decayedNodes.length > 0 && (
          <div style={{ marginBottom: "40px", animation: "slideUp 0.6s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--error)" }}>❄️ Frosted Over (Concept Decay)</h3>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-muted)", textTransform: "uppercase" }}>Requires Re-Ignition</span>
            </div>
            <div className="folio-card" style={{ padding: "0", overflow: "hidden", border: "1.5px solid var(--error)" }}>
              {stats.decayedNodes.map((node, i) => (
                <div
                  key={`${node.nodeId}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    borderBottom: i < stats.decayedNodes.length - 1 ? "1px solid var(--p-border)" : "none",
                    backgroundColor: "rgba(255, 59, 48, 0.05)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      backgroundColor: "var(--error)",
                      flexShrink: 0,
                      boxShadow: "0 0 8px var(--error)"
                    }} />
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-deep)" }}>
                        {node.title
                          ? node.title
                          : node.nodeId
                              .replace(/^(node|scenario|concept)[-_]?/i, "")
                              .replace(/[-_]/g, " ")
                              .replace(/\b\w/g, c => c.toUpperCase())
                              || `Concept ${node.nodeId}`}
                      </span>
                      <span style={{
                        marginLeft: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--error)",
                        textTransform: "uppercase",
                      }}>
                        Stability Lost
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "12px", color: "var(--t-muted)", textAlign: "right", marginRight: "16px" }}>
                      Last seen {timeAgo(node.lastAttempt)}
                    </span>
                    <Link href="/learn">
                      <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px", background: "var(--error)" }}>
                        Quick-Fire Recon
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.recentNodes.length > 0 && (
          <div style={{ marginBottom: "40px", animation: "slideUp 0.7s ease-out" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "16px" }}>Recent Activity</h3>
            <div className="folio-card" style={{ padding: "0", overflow: "hidden" }}>
              {stats.recentNodes.map((node, i) => (
                <div
                  key={`${node.nodeId}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    borderBottom: i < stats.recentNodes.length - 1 ? "1px solid var(--p-border)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      backgroundColor: getHeatColor(node.heatScore),
                      flexShrink: 0,
                    }} />
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-deep)" }}>
                        {node.title
                          ? node.title
                          : node.nodeId
                              .replace(/^(node|scenario|concept)[-_]?/i, "")
                              .replace(/[-_]/g, " ")
                              .replace(/\b\w/g, c => c.toUpperCase())
                              || `Concept ${node.nodeId}`}
                      </span>
                      <span style={{
                        marginLeft: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: getHeatColor(node.heatScore),
                        textTransform: "uppercase",
                      }}>
                        {getHeatLabel(node.heatScore)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "48px", height: "6px", borderRadius: "3px", backgroundColor: "var(--p-border)", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(node.heatScore, 100)}%`, height: "100%", borderRadius: "3px", backgroundColor: getHeatColor(node.heatScore), transition: "width 0.3s" }} />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--t-deep)", width: "36px", textAlign: "right" }}>
                        {node.heatScore}%
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--t-muted)", width: "60px", textAlign: "right" }}>
                      {timeAgo(node.lastAttempt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.totalConcepts === 0 && (
          <div className="folio-card" style={{ padding: "48px", textAlign: "center", marginBottom: "40px", animation: "slideUp 0.6s ease-out" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "8px" }}>No progress yet</h3>
            <p style={{ fontSize: "15px", color: "var(--t-secondary)", marginBottom: "24px" }}>
              Start your first learning session to begin tracking your mastery across concepts.
            </p>
            <Link href="/learn">
              <button className="btn-primary" style={{ padding: "12px 28px", fontSize: "15px" }}>
                Start First Session
              </button>
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", animation: "slideUp 0.8s ease-out" }}>
          
          <Link href="/learn" style={{ textDecoration: "none" }}>
            <div className="folio-card" style={{ padding: "32px", height: "100%", display: "flex", flexDirection: "column", transition: "all 0.2s", cursor: "pointer" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--snap-tint)", color: "var(--snap)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "20px" }}>
                ⚡
              </div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--t-deep)" }}>Learning Session</h3>
              <p style={{ color: "var(--t-mid)", lineHeight: 1.6, flexGrow: 1, fontSize: "14px" }}>
                Provide study material and test your understanding with AI-powered crisis scenarios.
              </p>
            </div>
          </Link>

          <Link href="/heatmap" style={{ textDecoration: "none" }}>
            <div className="folio-card" style={{ padding: "32px", height: "100%", display: "flex", flexDirection: "column", transition: "all 0.2s", cursor: "pointer" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--success-bg)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "20px" }}>
                🗺️
              </div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--t-deep)" }}>Heatmap Display</h3>
              <p style={{ color: "var(--t-mid)", lineHeight: 1.6, flexGrow: 1, fontSize: "14px" }}>
                Visualize your mastery progress across all concepts with heat scores and ignition status.
              </p>
            </div>
          </Link>

          <Link href="/battle" style={{ textDecoration: "none" }}>
            <div className="folio-card" style={{ padding: "32px", height: "100%", display: "flex", flexDirection: "column", transition: "all 0.2s", cursor: "pointer" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--warning-bg)", color: "var(--xp)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "20px" }}>
                ⚔️
              </div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--t-deep)" }}>Battle Arena</h3>
              <p style={{ color: "var(--t-mid)", lineHeight: 1.6, flexGrow: 1, fontSize: "14px" }}>
                Confront a boss that tests your knowledge in an intense multi-round encounter.
              </p>
            </div>
          </Link>

        </div>

      </main>
    </div>
  );
}
