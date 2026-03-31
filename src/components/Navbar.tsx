"use client";

import Link from "next/link";
import { useArceStore } from "@/store/arceStore";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Learn", href: "/learn", icon: "⚡" },
  { label: "Heatmap", href: "/heatmap", icon: "🗺️" },
  { label: "Battle", href: "/battle", icon: "⚔️" },
];

export default function Navbar() {
  const { user, logout } = useArceStore();
  const pathname = usePathname();

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
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
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
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--snap)" : "var(--t-secondary)",
                  backgroundColor: isActive ? "var(--snap-tint)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  cursor: "pointer",
                  transform: "translateY(0)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "var(--snap-tint)";
                    e.currentTarget.style.color = "var(--snap)";
                    e.currentTarget.style.fontWeight = "600";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--t-secondary)";
                    e.currentTarget.style.fontWeight = "500";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
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
            {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--t-deep)" }}>
            {user.name || user.email?.split("@")[0] || "User"}
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
            transition: "all 0.15s ease",
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
