"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Camera, History, ChevronRight, Activity, Calendar, ShieldCheck, HeartPulse } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const gradeColors = ["#34d399", "#fbbf24", "#fb923c", "#f87171", "#a78bfa"];
const gradeLabels = ["No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR"];

function GradeRing({ grade, confidence }: { grade: number; confidence: number }) {
  const color = gradeColors[grade] || "#6366f1";
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (confidence / 100) * circ;

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="100" height="100" className="progress-ring">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--vision-surface-3)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color }}>{confidence}%</div>
        <div style={{ fontSize: "10px", color: "var(--vision-text-faint)" }}>Grade {grade}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [latestScan, setLatestScan] = useState<any>(null);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: p }, { data: scans }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("scans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      setProfile(p);
      if (scans && scans.length > 0) {
        setLatestScan(scans[0]);
        setScanCount(scans.length);
      }
      setLoading(false);
    };
    load();
  }, []);

  const firstName = profile?.name?.split(" ")[0] || "User";
  const timeOfDay = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div>
      {/* Greeting Header */}
      <div className="animate-fade-up" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "12px", color: "var(--vision-text-muted)", marginBottom: "4px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{timeOfDay} 👋</div>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 800 }}>
            Hello, <span className="text-gradient">{firstName}</span>
          </h1>
        </div>
        <Link href="/scan" className="btn btn-primary hide-on-mobile">
          <Camera size={16} /> New Capture
        </Link>
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>

          {/* Status Overview Card */}
          <div className="glass animate-fade-up delay-100" style={{ padding: "24px", background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.04) 100%)", position: "relative", overflow: "hidden" }}>
            <div className="orb" style={{ width: "200px", height: "200px", background: "rgba(99,102,241,0.15)", top: "-50px", right: "-50px" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--vision-surface-3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck size={20} color="var(--vision-primary)" />
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Clinical Overview</h2>
                <p style={{ fontSize: "12px", color: "var(--vision-text-muted)" }}>Your latest AI diagnostic results</p>
              </div>
            </div>

            {loading ? (
              <div className="shimmer" style={{ height: "100px" }} />
            ) : latestScan ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.03)" }}>
                <GradeRing grade={latestScan.grade} confidence={latestScan.confidence} />
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <div className="grade-badge" style={{ "--grade-color": gradeColors[latestScan.grade] } as any}>
                      Grade {latestScan.grade}: {gradeLabels[latestScan.grade]}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--vision-text-faint)" }}>
                      {new Date(latestScan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--vision-text-muted)", lineHeight: 1.6, marginBottom: "12px" }}>
                    {latestScan.description}
                  </p>
                  <Link href={`/result/${latestScan.scan_uuid}`} style={{ fontSize: "13px", fontWeight: 600, color: "var(--vision-primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    View detailed report <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ padding: "28px", textAlign: "center", background: "rgba(0,0,0,0.2)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                <Eye size={28} color="var(--vision-text-faint)" style={{ marginBottom: "10px" }} />
                <p style={{ fontSize: "13px", color: "var(--vision-text-muted)", marginBottom: "14px" }}>No diagnostic data yet. Take your first scan to begin.</p>
                <Link href="/scan" className="btn btn-primary btn-sm">Start Retinal Scan</Link>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px" }}>
            <div className="glass animate-fade-up delay-200" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99,102,241,0.1)", color: "var(--vision-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <History size={18} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--vision-green)", background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: "100px" }}>Active</span>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, marginBottom: "4px" }}>{scanCount}</div>
              <div style={{ fontSize: "12px", color: "var(--vision-text-muted)" }}>Total Scans</div>
            </div>

            <div className="glass animate-fade-up delay-300" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(34,211,238,0.1)", color: "var(--vision-cyan)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HeartPulse size={18} />
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, marginBottom: "4px" }}>Stable</div>
              <div style={{ fontSize: "12px", color: "var(--vision-text-muted)" }}>Health Trend</div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>

          {/* Action Panel */}
          <div className="glass animate-fade-up delay-400" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--vision-text-faint)" }}>Actions</h3>

            <Link href="/scan" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "var(--vision-surface-2)", borderRadius: "12px", border: "1px solid var(--vision-border)", marginBottom: "10px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--vision-primary)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--vision-border)"}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                <Camera size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--vision-text)" }}>New Capture</div>
                <div style={{ fontSize: "11px", color: "var(--vision-text-muted)" }}>8-frame sequence</div>
              </div>
              <ChevronRight size={16} color="var(--vision-text-faint)" style={{ marginLeft: "auto", flexShrink: 0 }} />
            </Link>

            <Link href="/history" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "var(--vision-surface-2)", borderRadius: "12px", border: "1px solid var(--vision-border)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--vision-border-glow)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--vision-border)"}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--vision-text)", flexShrink: 0 }}>
                <Calendar size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--vision-text)" }}>View History</div>
                <div style={{ fontSize: "11px", color: "var(--vision-text-muted)" }}>Past reports</div>
              </div>
              <ChevronRight size={16} color="var(--vision-text-faint)" style={{ marginLeft: "auto", flexShrink: 0 }} />
            </Link>
          </div>

          {/* DR Reference Panel */}
          <div className="glass animate-fade-up delay-500" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Activity size={16} color="var(--vision-primary)" />
              <h3 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--vision-text-faint)" }}>
                DR Grading Scale
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {gradeLabels.map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: i !== 4 ? "10px" : "0", borderBottom: i !== 4 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: gradeColors[i], boxShadow: `0 0 8px ${gradeColors[i]}60`, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--vision-text)" }}>Grade {i}: {label}</div>
                    <div style={{ fontSize: "10px", color: "var(--vision-text-muted)", marginTop: "2px" }}>
                      {i === 0 && "No microvascular abnormalities."}
                      {i === 1 && "Microaneurysms only."}
                      {i === 2 && "More than microaneurysms, less than severe."}
                      {i === 3 && "Severe NPDR — many blocked vessels."}
                      {i === 4 && "PDR — neovascularization present."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
