"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArceStore } from "@/store/arceStore";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Learn",      href: "/learn",     icon: "⚡" },
  { label: "Heatmaps",   href: "/heatmap",   icon: "🗺️" },
  { label: "Dashboard",  href: "/dashboard", icon: "🏠" },
];

const spring = { type: "spring" as const, stiffness: 500, damping: 40 };
const smoothSpring = { type: "spring" as const, stiffness: 300, damping: 30 };

export default function Navbar() {
  const { user, logout } = useArceStore();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Frosted glass on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    window.location.href = "/";
  };

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const displayName = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "User";
  const initial = displayName[0].toUpperCase();

  return (
    <motion.nav
      role="navigation"
      className={scrolled ? "nav-glass" : ""}
      animate={{ backgroundColor: scrolled ? "rgba(250,250,248,0)" : "var(--p-white)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--p-border)",
        padding: "12px 24px",
        position: "sticky", top: 0, zIndex: 50,
        transition: "box-shadow 300ms cubic-bezier(0.25,0.46,0.45,0.94)",
      }}
    >
      {/* Logo + Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <Link href="/learn" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.08, rotate: 3 }} whileTap={{ scale: 0.95 }} transition={spring}>
            <span className="nav-logo-accent" />
          </motion.div>
          <motion.span
            whileHover={{ color: "var(--snap)" }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 400, color: "var(--t-primary)", letterSpacing: "-0.5px" }}
          >
            ARCÉ
          </motion.span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ y: -2, backgroundColor: isActive ? undefined : "rgba(255,92,53,0.08)" }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", borderRadius: "10px",
                    fontSize: "14px", fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--snap)" : "var(--t-secondary)",
                    backgroundColor: isActive ? "var(--snap-tint)" : "transparent",
                    position: "relative",
                  }}
                >
                  <motion.span
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={spring}
                    style={{ fontSize: "14px" }}
                  >
                    {item.icon}
                  </motion.span>
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: Profile dropdown */}
      <div ref={profileRef} style={{ position: "relative" }}>
        <motion.button
          onClick={() => setProfileOpen((v) => !v)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={spring}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "6px 12px 6px 6px", borderRadius: "40px",
            background: "none", border: "1px solid var(--p-border)",
            cursor: "pointer",
            backgroundColor: profileOpen ? "var(--snap-tint)" : "var(--p-surface)",
            borderColor: profileOpen ? "var(--snap-border)" : "var(--p-border)",
            transition: "background-color 200ms ease, border-color 200ms ease",
          }}
        >
          {/* Avatar */}
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%", overflow: "hidden",
            backgroundColor: "var(--snap)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>{initial}</span>
            )}
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--t-deep)" }}>
            {displayName}
          </span>
          <motion.span
            animate={{ rotate: profileOpen ? 180 : 0 }}
            transition={spring}
            style={{ fontSize: "10px", color: "var(--t-muted)", lineHeight: 1 }}
          >
            ▾
          </motion.span>
        </motion.button>

        {/* Dropdown */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -6 }}
              transition={{ type: "spring", stiffness: 480, damping: 36 }}
              style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: "240px", borderRadius: "16px",
                backgroundColor: "var(--p-white)",
                border: "1px solid var(--p-border)",
                boxShadow: "0 16px 48px rgba(22,20,16,0.14), 0 4px 16px rgba(22,20,16,0.08)",
                overflow: "hidden", zIndex: 100,
                transformOrigin: "top right",
              }}
            >
              {/* User info header */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--p-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%", overflow: "hidden",
                    backgroundColor: "var(--snap)", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>{initial}</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--t-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--t-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: "6px" }}>
                {[
                  { label: "Profile Settings", icon: "👤", href: "/profile" },
                  { label: "Dashboard",        icon: "🏠", href: "/dashboard" },
                  { label: "Heatmaps",         icon: "🗺️", href: "/heatmap" },
                ].map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, ...smoothSpring }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setProfileOpen(false)}
                      style={{ textDecoration: "none" }}
                    >
                      <motion.div
                        whileHover={{ backgroundColor: "var(--p-frost)", x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        transition={spring}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "9px 12px", borderRadius: "10px",
                          fontSize: "13px", fontWeight: 500, color: "var(--t-mid)",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: "15px" }}>{item.icon}</span>
                        {item.label}
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}

                <div style={{ height: "1px", backgroundColor: "var(--p-border)", margin: "6px 0" }} />

                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12, ...smoothSpring }}
                >
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ backgroundColor: "var(--error-bg)", x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={spring}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 12px", borderRadius: "10px",
                      fontSize: "13px", fontWeight: 500, color: "var(--error)",
                      cursor: "pointer", width: "100%", background: "none", border: "none",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>↩</span>
                    Sign Out
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
