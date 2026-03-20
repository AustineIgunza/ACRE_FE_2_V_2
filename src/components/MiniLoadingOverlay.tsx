"use client";

export default function MiniLoadingOverlay() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(22, 20, 16, 0.3)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 60,
      animation: "fadeIn 0.2s ease-out",
    }}>
      <div className="folio-card" style={{
        maxWidth: "320px",
        width: "100%",
        padding: "32px",
        textAlign: "center",
        animation: "slideUp 0.3s ease-out",
        margin: "0 24px"
      }}>
        {/* Spinner */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "3px solid var(--p-border)",
            borderTopColor: "var(--snap)",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>

        <h3 style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--t-primary)",
          marginBottom: "8px",
        }}>
          Evaluating logic...
        </h3>
        
        <p style={{
          fontSize: "14px",
          color: "var(--t-secondary)",
          lineHeight: 1.5,
          margin: 0,
        }}>
          Analyzing depth and causality.
        </p>

        {/* Bouncing dots */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "24px"
        }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "var(--snap)",
              animation: `bounce-light 1.2s infinite ${delay}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
