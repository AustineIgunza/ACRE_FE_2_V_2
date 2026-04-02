"use client";

import Link from "next/link";
import { useState } from "react";
import { useArceStore } from "@/store/arceStore";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Learn", href: "/learn", icon: "⚡" },
  { label: "Heatmap", href: "/heatmap", icon: "🗺️" },
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
];

export default function Navbar() {
  const { user, logout } = useArceStore();
  const pathname = usePathname();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (!user) return null;

  return (
    <nav
      role="navigation"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--p-border)",
        padding: "12px 24px",
        backgroundColor: "var(--p-white)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo + Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", transition: "transform 0.2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          <span className="nav-logo-accent" />
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "20px",
              fontWeight: 400,
              color: "var(--t-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            ARCÉ
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const isHovered = hoveredNav === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredNav(item.href)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 500,
                  color: isHovered && !isActive ? "var(--snap)" : isActive ? "var(--snap)" : "var(--t-secondary)",
                  backgroundColor: isHovered && !isActive ? "rgba(255, 92, 53, 0.08)" : isActive ? "var(--snap-tint)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                  boxShadow: isHovered && !isActive ? "0 4px 12px rgba(255, 92, 53, 0.1)" : "none",
                }}
              >
                <span style={{ fontSize: "14px", transition: "transform 0.2s ease", transform: isHovered ? "scale(1.15)" : "scale(1)" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User section */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 12px",
            borderRadius: "8px",
            backgroundColor: "var(--p-surface)",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255, 92, 53, 0.05)";
            (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--p-surface)";
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "var(--snap)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--t-deep)" }}>
            {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "13px",
            background: "none",
            color: "var(--t-secondary)",
            border: "1px solid var(--p-border)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255, 92, 53, 0.1)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--snap)";
            (e.currentTarget as HTMLElement).style.color = "var(--snap)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--p-border)";
            (e.currentTarget as HTMLElement).style.color = "var(--t-secondary)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
