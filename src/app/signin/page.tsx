"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: "var(--p-white)", 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      padding: "24px"
    }}>
      
      {/* Brand Header */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", textDecoration: "none" }}>
          <span className="nav-logo-accent" />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 400, color: "var(--t-primary)", letterSpacing: "-0.5px" }}>
            ARCÉ
          </span>
        </Link>
      </div>

      <div className="folio-card" style={{ 
        width: "100%", 
        maxWidth: "400px", 
        padding: "40px 32px",
        animation: "slideUp 0.4s ease-out" 
      }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "8px", textAlign: "center" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "14px", color: "var(--t-secondary)", textAlign: "center", marginBottom: "32px" }}>
          Sign in to pick up where you left off.
        </p>

        {error && (
          <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "var(--error-bg)", color: "var(--error)", borderRadius: "8px", fontSize: "14px", textAlign: "center", border: "1px solid var(--error-border)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--t-deep)", marginBottom: "8px" }}>
              Email address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="folio-input"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--t-deep)" }}>
                Password
              </label>
              <a href="#" style={{ fontSize: "12px", color: "var(--snap)", fontWeight: 600, textDecoration: "none" }}>
                Forgot password?
              </a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="folio-input"
              style={{ width: "100%" }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ 
              width: "100%", 
              marginTop: "8px",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
          
        </form>
      </div>

      <p style={{ marginTop: "32px", fontSize: "14px", color: "var(--t-secondary)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "var(--snap)", fontWeight: 600, textDecoration: "none" }}>
          Sign up
        </Link>
      </p>

    </div>
  );
}
