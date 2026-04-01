"use client";

import { useFlashpointStore } from "@/store/flashpointStore";
import Phase1Foundation from "./Phase1Foundation";
import Phase2Application from "./Phase2Application";
import Phase3Blindspot from "./Phase3Blindspot";

export default function FlashpointRenderer() {
  const { currentPhase, flashpointData, isLoading, error, resetFlashpoint } = useFlashpointStore();

  if (isLoading && !flashpointData) {
    return (
      <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", padding: "80px", color: "var(--t-secondary)", textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--p-border)", borderTopColor: "var(--snap)", animation: "spin 0.6s linear infinite", margin: "0 auto 20px" }} />
        Generating dynamic flashpoint...
      </div>
    );
  }

  if (error || !flashpointData) {
    return (
      <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", padding: "80px", color: "var(--snap)", textAlign: "center" }}>
        <h3>Error loading Flashpoint</h3>
        <p style={{ marginTop: "12px" }}>{error}</p>
        <button onClick={resetFlashpoint} className="button-secondary" style={{ marginTop: "24px" }}>Abort Mission</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--p-surface)" }}>
      <div style={{ 
        padding: "16px 24px", 
        borderBottom: "1px solid var(--p-border)", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        backgroundColor: "var(--p-white)" 
      }}>
        <div style={{ fontWeight: 600, color: "var(--t-primary)" }}>Flashpoint Simulation</div>
        <button onClick={resetFlashpoint} style={{ background: "none", border: "none", color: "var(--t-muted)", cursor: "pointer", fontSize: "13px" }}>QUIT DIRECTIVE</button>
      </div>
      
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 24px" }}>
        {currentPhase === 1 && <Phase1Foundation />}
        {currentPhase === 2 && <Phase2Application />}
        {currentPhase === 3 && <Phase3Blindspot />}
      </div>
    </div>
  );
}
