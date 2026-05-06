"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, LayoutDashboard, History, User, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/scan", icon: Eye, label: "New Scan" },
  { href: "/history", icon: History, label: "History" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--vision-bg)", overflowX: "hidden" }}>
      
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px", padding: "0 8px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Eye size={18} color="white" />
          </div>
          <span style={{ fontFamily: "Space Grotesk", fontWeight: 800, fontSize: "20px" }}>Vision</span>
          <span style={{ fontSize: "10px", fontWeight: 700, background: "var(--grad-accent)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.1em", marginLeft: "2px" }}>PRO</span>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--vision-text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", paddingLeft: "8px" }}>Menu</div>
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={`desktop-nav-item ${pathname === href ? "active" : ""}`}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        
        <div style={{ paddingTop: "20px", borderTop: "1px solid var(--vision-border)" }}>
          <button onClick={handleLogout} className="desktop-nav-item" style={{ color: "var(--vision-text-muted)", background: "none", border: "none", cursor: "pointer", width: "100%" }}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="mobile-header" style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(3,7,18,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--vision-border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Eye size={15} color="white" />
          </div>
          <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "16px" }}>Vision</span>
        </div>

        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--vision-text-muted)" }}>
          {navItems.find((n) => pathname === n.href)?.label || ""}
        </span>

        <Link href="/profile">
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "var(--vision-primary-dim)",
            border: "2px solid var(--vision-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <User size={16} color="var(--vision-primary)" />
          </div>
        </Link>
      </header>

      {/* Page Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`nav-item ${pathname === href ? "active" : ""}`}>
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
