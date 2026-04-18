"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useArceStore } from "@/store/arceStore";
import { supabase } from "@/lib/supabaseClient";
import { toast, ToastContainer } from "@/components/UI/Toast";
import RippleButton from "@/components/UI/RippleButton";

const spring      = { type: "spring" as const, stiffness: 500, damping: 42 };
const smoothSpring = { type: "spring" as const, stiffness: 300, damping: 30 };

// ── Section card wrapper ──────────────────────────────────────────────────────
function Section({ title, description, children, index = 0 }: {
  title: string; description: string; children: React.ReactNode; index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...smoothSpring, delay: index * 0.08 }}
      style={{
        backgroundColor: "var(--p-sheet)",
        border: "1px solid var(--p-border)",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid var(--p-border)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--t-primary)", margin: 0 }}>{title}</h3>
        <p style={{ fontSize: "13px", color: "var(--t-muted)", margin: "4px 0 0" }}>{description}</p>
      </div>
      <div style={{ padding: "22px 28px" }}>{children}</div>
    </motion.div>
  );
}

// ── Styled input ──────────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, hint }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "1.2px",
        color: focused ? "var(--snap)" : "var(--t-muted)",
        marginBottom: "7px",
        transition: "color 200ms ease",
      }}>
        {label}
      </label>
      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        animate={{
          borderColor: focused ? "var(--snap)" : "var(--p-border)",
          boxShadow: focused ? "0 0 0 3px rgba(255,92,53,0.12)" : "none",
          y: focused ? -1 : 0,
        }}
        transition={{ duration: 0.18 }}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: "10px",
          border: "1.5px solid var(--p-border)",
          backgroundColor: "var(--p-surface)",
          color: "var(--t-primary)", fontSize: "14px",
          outline: "none", boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />
      {hint && (
        <p style={{ fontSize: "11px", color: "var(--t-muted)", marginTop: "5px" }}>{hint}</p>
      )}
    </div>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveBtn({ onClick, loading, label = "Save Changes" }: {
  onClick: () => void; loading: boolean; label?: string;
}) {
  return (
    <RippleButton
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "11px 24px", borderRadius: "10px",
        backgroundColor: "var(--snap)", color: "#fff",
        fontWeight: 700, fontSize: "14px",
        border: "none",
        boxShadow: loading ? "none" : "0 4px 16px rgba(255,92,53,0.35)",
        minWidth: "140px",
      }}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="spin"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              style={{
                width: "14px", height: "14px", borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff",
              }}
            />
            Saving…
          </motion.div>
        ) : (
          <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </RippleButton>
  );
}

// ── Main profile page ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, authInitialized, initAuth } = useArceStore();
  const router = useRouter();

  // Avatar
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarDragging, setAvatarDragging] = useState(false);

  // Name
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Email
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => { initAuth(); }, [initAuth]);
  useEffect(() => {
    if (authInitialized && !user) router.push("/signin");
  }, [authInitialized, user, router]);

  useEffect(() => {
    if (user) {
      setName((user.user_metadata?.full_name as string) || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const handleAvatarSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", "Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", "Max 5 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setAvatarDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleAvatarSelect(file);
  };

  const saveAvatar = async () => {
    if (!avatarFile || !user) return;
    setSavingAvatar(true);
    try {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;

      const { error: updateErr } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateErr) throw updateErr;

      toast.success("Avatar updated", "Your profile photo has been saved.");
      setAvatarFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      toast.error("Upload failed", msg);
    } finally {
      setSavingAvatar(false);
    }
  };

  // ── Name ─────────────────────────────────────────────────────────────────
  const saveName = async () => {
    if (!name.trim()) { toast.error("Name required", "Please enter a display name."); return; }
    setSavingName(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      if (error) throw error;
      toast.success("Name updated", "Your display name has been saved.");
    } catch (err: unknown) {
      toast.error("Update failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setSavingName(false);
    }
  };

  // ── Email ─────────────────────────────────────────────────────────────────
  const saveEmail = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Invalid email", "Please enter a valid email address.");
      return;
    }
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;
      toast.info("Confirmation sent", "Check both inboxes to confirm the email change.");
    } catch (err: unknown) {
      toast.error("Update failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setSavingEmail(false);
    }
  };

  // ── Password ─────────────────────────────────────────────────────────────
  const savePassword = async () => {
    if (newPw.length < 8) {
      toast.error("Too short", "Password must be at least 8 characters."); return;
    }
    if (newPw !== confirmPw) {
      toast.error("Mismatch", "New passwords do not match."); return;
    }
    setSavingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      toast.success("Password changed", "Your password has been updated.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      toast.error("Update failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setSavingPw(false);
    }
  };

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid var(--p-border)", borderTopColor: "var(--snap)" }}
        />
      </div>
    );
  }

  const avatarUrl = avatarPreview || (user.user_metadata?.avatar_url as string) || null;
  const displayName = name || user.email?.split("@")[0] || "User";
  const pwStrength = newPw.length === 0 ? 0 : newPw.length < 8 ? 1 : newPw.length < 12 ? 2 : 3;
  const pwColors = ["", "#ef4444", "#f59e0b", "#16a34a"];
  const pwLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh" }}>
      <Navbar />
      <ToastContainer />

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={smoothSpring}
          style={{ marginBottom: "36px" }}
        >
          <span style={{
            fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "3px", color: "var(--t-muted)", display: "block", marginBottom: "8px",
          }}>
            ACCOUNT
          </span>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.8px", color: "var(--t-primary)", margin: 0 }}>
            Profile Settings
          </h1>
          <p style={{ fontSize: "15px", color: "var(--t-secondary)", marginTop: "8px" }}>
            Manage your identity, security, and preferences.
          </p>
        </motion.div>

        {/* ── AVATAR ─────────────────────────────────────────────────────── */}
        <Section title="Profile Photo" description="Click or drag-and-drop to upload a new photo. Max 5 MB." index={0}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Avatar circle */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setAvatarDragging(true); }}
              onDragLeave={() => setAvatarDragging(false)}
              onDrop={handleFileDrop}
              style={{
                width: "88px", height: "88px", borderRadius: "50%", overflow: "hidden",
                backgroundColor: avatarUrl ? "transparent" : "var(--snap)",
                border: `2.5px dashed ${avatarDragging ? "var(--snap)" : avatarUrl ? "transparent" : "var(--p-border)"}`,
                cursor: "pointer", flexShrink: 0, position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 200ms ease",
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#fff", fontSize: "32px", fontWeight: 700 }}>
                  {displayName[0].toUpperCase()}
                </span>
              )}
              {/* Hover overlay */}
              <motion.div
                initial={false}
                whileHover={{ opacity: 1 }}
                style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0, transition: "opacity 200ms ease",
                  fontSize: "22px",
                }}
              >
                📷
              </motion.div>
            </motion.div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarSelect(f); }}
            />

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "13px", color: "var(--t-secondary)", lineHeight: 1.6, marginBottom: "12px" }}>
                {avatarFile ? `Selected: ${avatarFile.name}` : "JPG, PNG, GIF or WebP up to 5 MB"}
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <RippleButton
                  onClick={() => fileRef.current?.click()}
                  style={{
                    padding: "9px 18px", borderRadius: "9px",
                    border: "1px solid var(--p-border)",
                    backgroundColor: "var(--p-surface)",
                    color: "var(--t-mid)", fontSize: "13px", fontWeight: 600,
                  }}
                >
                  Choose File
                </RippleButton>
                {avatarFile && (
                  <SaveBtn onClick={saveAvatar} loading={savingAvatar} label="Upload Photo" />
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* ── DISPLAY NAME ───────────────────────────────────────────────── */}
        <Section title="Display Name" description="This is the name shown across your ARCÉ profile." index={1}>
          <Field
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="Your name"
          />
          <SaveBtn onClick={saveName} loading={savingName} />
        </Section>

        {/* ── EMAIL ──────────────────────────────────────────────────────── */}
        <Section title="Email Address" description="Changing your email will send a confirmation to both addresses." index={2}>
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            hint="You'll need to confirm the change from both your old and new email."
          />
          <SaveBtn onClick={saveEmail} loading={savingEmail} label="Update Email" />
        </Section>

        {/* ── PASSWORD ───────────────────────────────────────────────────── */}
        <Section title="Change Password" description="Choose a strong password with at least 8 characters." index={3}>
          <Field
            label="New Password"
            type={showPw ? "text" : "password"}
            value={newPw}
            onChange={setNewPw}
            placeholder="New password"
          />

          {/* Strength bar */}
          <AnimatePresence>
            {newPw.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: "14px", overflow: "hidden" }}
              >
                <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                  {[1, 2, 3].map((lvl) => (
                    <motion.div
                      key={lvl}
                      animate={{ backgroundColor: pwStrength >= lvl ? pwColors[pwStrength] : "var(--p-border)" }}
                      transition={{ duration: 0.3 }}
                      style={{ flex: 1, height: "4px", borderRadius: "2px" }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: pwColors[pwStrength] }}>
                  {pwLabels[pwStrength]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Field
            label="Confirm New Password"
            type={showPw ? "text" : "password"}
            value={confirmPw}
            onChange={setConfirmPw}
            placeholder="Confirm password"
            hint={confirmPw && newPw !== confirmPw ? "⚠ Passwords don't match" : undefined}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "4px" }}>
            <SaveBtn onClick={savePassword} loading={savingPw} label="Change Password" />
            <button
              onClick={() => setShowPw((v) => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "12px", color: "var(--t-muted)", fontWeight: 600,
                padding: "4px 0",
                transition: "color 180ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--snap)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t-muted)")}
            >
              {showPw ? "Hide" : "Show"} password
            </button>
          </div>
        </Section>

        {/* ── DANGER ZONE ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.32 }}
          style={{
            padding: "20px 24px",
            borderRadius: "14px",
            border: "1px solid var(--error-border)",
            backgroundColor: "var(--error-bg)",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--error)", margin: "0 0 6px" }}>Danger Zone</h3>
          <p style={{ fontSize: "12px", color: "var(--t-muted)", margin: "0 0 14px" }}>
            Deleting your account is irreversible. All your progress, nodes, and review history will be permanently removed.
          </p>
          <RippleButton
            style={{
              padding: "9px 18px", borderRadius: "9px",
              border: "1px solid var(--error-border)",
              backgroundColor: "transparent",
              color: "var(--error)", fontSize: "13px", fontWeight: 700,
            }}
            rippleColor="rgba(239,68,68,0.2)"
            onClick={() => toast.error("Not yet available", "Account deletion is coming soon.")}
          >
            Delete Account
          </RippleButton>
        </motion.div>
      </main>
    </div>
  );
}
