"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/authClient";

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
      const { error: signInError } = await signIn.email({
        email,
        password,
      });
      if (signInError) throw new Error(signInError.message || "Sign in failed");
      
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : "http://localhost:3001/dashboard",
      });
    } catch (err: any) {
      setError(err.message || "Google sign in failed");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--p-white)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", textDecoration: "none" }}>
          <span className="nav-logo-accent" />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 400, color: "var(--t-primary)", letterSpacing: "-0.5px" }}>
            ARCÉ
          </span>
        </Link>
      </div>

      <div className="folio-card" style={{ width: "100%", maxWidth: "400px", padding: "40px 32px", animation: "slideUp 0.4s ease-out" }}>
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

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="btn-outline"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            backgroundColor: "white",
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>

        <div style={{ textAlign: "center", color: "var(--t-secondary)", fontSize: "12px", margin: "8px 0 20px" }}>OR</div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--t-deep)", marginBottom: "8px" }}>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" className="folio-input" style={{ width: "100%" }} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--t-deep)" }}>Password</label>
              <a href="#" style={{ fontSize: "12px", color: "var(--snap)", fontWeight: 600, textDecoration: "none" }}>Forgot password?</a>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="folio-input" style={{ width: "100%" }} />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%", marginTop: "8px", opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: "32px", fontSize: "14px", color: "var(--t-secondary)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "var(--snap)", fontWeight: 600, textDecoration: "none" }}>Sign up</Link>
      </p>

    </div>
  );
}
