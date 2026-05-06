"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Calendar, Shield, LogOut, ChevronRight, Eye, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      setLoading(false);
    };
    load();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div style={{ padding: "24px 20px", maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: "64px" }} />)}
      </div>
    );
  }

  const initials = (profile?.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: "24px 20px", maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Avatar */}
      <div className="glass animate-fade-up" style={{ opacity: 0, padding: "28px 24px", display: "flex", alignItems: "center", gap: "18px", background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(6,182,212,0.06) 100%)", borderColor: "rgba(99,102,241,0.25)" }}>
        <div style={{
          width: "68px",
          height: "68px",
          borderRadius: "50%",
          background: "var(--grad-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontWeight: 800,
          color: "white",
          flexShrink: 0,
          boxShadow: "0 0 30px rgba(99,102,241,0.4)",
        }}>
          {initials}
        </div>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800 }}>{profile?.name || "User"}</h1>
          <div style={{ fontSize: "13px", color: "var(--vision-text-muted)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Mail size={12} /> {profile?.email || "—"}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="glass animate-fade-up delay-100" style={{ opacity: 0, padding: "4px 0" }}>
        {[
          { icon: <User size={16} />, label: "Full Name", value: profile?.name || "—" },
          { icon: <Mail size={16} />, label: "Email", value: profile?.email || "—" },
          { icon: <Calendar size={16} />, label: "Age", value: profile?.age ? `${profile.age} years` : "—" },
          { icon: <Eye size={16} />, label: "Gender", value: profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "—" },
          { icon: <Calendar size={16} />, label: "Diabetic Since", value: profile?.diabetic_since ? `${profile.diabetic_since}` : "—" },
        ].map(({ icon, label, value }, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px 20px",
            borderBottom: i < 4 ? "1px solid var(--vision-border)" : "none",
          }}>
            <span style={{ color: "var(--vision-text-faint)", flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: "11px", color: "var(--vision-text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              <div style={{ fontSize: "15px", fontWeight: 500, marginTop: "2px" }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="glass animate-fade-up delay-200" style={{ opacity: 0, padding: "4px 0" }}>
        {[
          { href: "/privacy", icon: <Lock size={16} />, label: "Privacy Policy" },
          { href: "/about", icon: <Shield size={16} />, label: "Data Security" },
        ].map(({ href, icon, label }, i) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "16px 20px",
              borderBottom: i === 0 ? "1px solid var(--vision-border)" : "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ color: "var(--vision-primary)" }}>{icon}</span>
              <span style={{ fontSize: "15px", fontWeight: 500, flex: 1 }}>{label}</span>
              <ChevronRight size={16} color="var(--vision-text-faint)" />
            </div>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        className="btn btn-ghost animate-fade-up delay-300"
        onClick={logout}
        style={{
          width: "100%",
          color: "#ef4444",
          borderColor: "rgba(239,68,68,0.2)",
          opacity: 0,
        }}
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
