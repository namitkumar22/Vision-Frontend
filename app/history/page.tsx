"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ChevronRight, Eye, TrendingUp, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const gradeColors = ["#10b981", "#f59e0b", "#f97316", "#ef4444", "#8b5cf6"];
const gradeLabels = ["No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HistoryPage() {
  const supabase = createClient();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setScans(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: "24px 20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800 }}>Scan History</h1>
        <p style={{ color: "var(--vision-text-muted)", fontSize: "14px", marginTop: "6px" }}>
          {loading ? "Loading..." : `${scans.length} scan${scans.length !== 1 ? "s" : ""} recorded`}
        </p>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: "88px" }} />)}
        </div>
      )}

      {!loading && scans.length === 0 && (
        <div className="glass" style={{ padding: "52px 24px", textAlign: "center" }}>
          <Clock size={40} color="var(--vision-text-faint)" style={{ marginBottom: "12px" }} />
          <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>No scans yet</h3>
          <p style={{ fontSize: "13px", color: "var(--vision-text-muted)", marginBottom: "20px" }}>
            Your scan results will appear here after your first analysis.
          </p>
          <Link href="/scan" className="btn btn-primary btn-sm">
            <Eye size={14} /> Take First Scan
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {scans.map((scan, i) => {
          const color = gradeColors[scan.grade] ?? "#6366f1";
          const label = gradeLabels[scan.grade] ?? "Unknown";

          return (
            <Link key={scan.scan_uuid} href={`/result/${scan.scan_uuid}`} style={{ textDecoration: "none" }}>
              <div
                className="glass animate-fade-up"
                style={{
                  animationDelay: `${i * 60}ms`,
                  opacity: 0,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  cursor: "pointer",
                  transition: "transform 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                  (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--vision-border)";
                }}
              >
                {/* Grade Dot */}
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: `${color}18`,
                  border: `1px solid ${color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: "16px", fontWeight: 800, color }}>{scan.grade}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "var(--vision-text-faint)", marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={11} />
                    {formatDate(scan.created_at)}
                    <span style={{ color: "var(--vision-surface-3)" }}>·</span>
                    <TrendingUp size={11} />
                    {scan.confidence}% confidence
                  </div>
                </div>

                <ChevronRight size={16} color="var(--vision-text-faint)" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
