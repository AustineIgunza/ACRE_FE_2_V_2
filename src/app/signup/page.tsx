"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      if (signUpError) throw signUpError;
      
      setSuccess("Account created successfully! Please check your inbox for a verification email before signing in.");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
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
          Create your account
        </h1>
        <p style={{ fontSize: "14px", color: "var(--t-secondary)", textAlign: "center", marginBottom: "32px" }}>
          Start converting passive learning into mastery today.
        </p>

        {error && (
          <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "var(--error-bg)", color: "var(--error)", borderRadius: "8px", fontSize: "14px", textAlign: "center", border: "1px solid var(--error-border)" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "var(--success-bg)", color: "var(--success)", borderRadius: "8px", fontSize: "14px", textAlign: "center", border: "1px solid var(--success-border)" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--t-deep)", marginBottom: "8px" }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" className="folio-input" style={{ width: "100%" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--t-deep)", marginBottom: "8px" }}>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" className="folio-input" style={{ width: "100%" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--t-deep)", marginBottom: "8px" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="folio-input" style={{ width: "100%" }} />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: "100%", marginTop: "8px", opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: "32px", fontSize: "14px", color: "var(--t-secondary)" }}>
        Already have an account?{" "}
        <Link href="/signin" style={{ color: "var(--snap)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
      </p>

    </div>
  );
}
