"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Eye, AlertTriangle, CheckCircle, Info, BarChart2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const gradeColors = ["#10b981", "#f59e0b", "#f97316", "#ef4444", "#8b5cf6"];
const gradeLabels = ["No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR"];
const gradeIcons = [CheckCircle, Info, AlertTriangle, AlertTriangle, AlertTriangle];
const gradeAdvice = [
  "Great news! No signs of diabetic retinopathy detected. Continue regular annual checkups.",
  "Early stage DR detected. Maintain good blood sugar control. Follow up in 6–12 months.",
  "Moderate DR. Consult your ophthalmologist soon. Tight glycemic control is critical.",
  "Severe DR. Urgent ophthalmology referral recommended. Risk of vision loss is high.",
  "Proliferative DR — advanced stage. Immediate specialist consultation required. Do not delay.",
];

function ConfidenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ fontSize: "13px", color: "var(--vision-text-muted)" }}>{label}</span>
        <span style={{ fontSize: "13px", fontWeight: 600, color }}>{value}%</span>
      </div>
      <div style={{ height: "6px", background: "var(--vision-surface-3)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

export default function ResultPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("scans")
        .select("*")
        .eq("scan_uuid", uuid)
        .single();

      setScan(data);
      setLoading(false);
    };
    load();
  }, [uuid]);

  if (loading) {
    return (
      <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
        <div className="shimmer" style={{ height: "200px", marginBottom: "16px" }} />
        <div className="shimmer" style={{ height: "120px" }} />
      </div>
    );
  }

  if (!scan) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "var(--vision-text-muted)" }}>Result not found.</p>
        <Link href="/history" className="btn btn-primary btn-sm" style={{ marginTop: "12px" }}>Back to History</Link>
      </div>
    );
  }

  const color = gradeColors[scan.grade] ?? "#6366f1";
  const label = gradeLabels[scan.grade] ?? "Unknown";
  const advice = gradeAdvice[scan.grade] ?? "";
  const GradeIcon = gradeIcons[scan.grade] ?? Info;
  const allProbs: Record<string, number> = scan.all_probabilities ?? {};
  const circumference = 2 * Math.PI * 52;

  return (
    <div style={{ padding: "24px 20px", maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back */}
      <button
        onClick={() => router.push("/history")}
        className="btn btn-ghost btn-sm"
        style={{ alignSelf: "flex-start", paddingLeft: 0 }}
      >
        <ChevronLeft size={16} /> Back
      </button>

      {/* Main Result Card */}
      <div
        className="glass animate-scale-in"
        style={{
          padding: "36px 28px",
          textAlign: "center",
          background: `linear-gradient(135deg, ${color}15 0%, rgba(13,17,23,0.9) 100%)`,
          borderColor: `${color}40`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="orb" style={{ width: "200px", height: "200px", background: `${color}10`, top: "-50px", right: "-50px" }} />

        {/* Ring */}
        <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 20px" }}>
          <svg width="120" height="120" className="progress-ring">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--vision-surface-3)" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="52"
              fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (scan.confidence / 100) * circumference}
              strokeLinecap="round"
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color }}>{scan.confidence}%</div>
            <div style={{ fontSize: "10px", color: "var(--vision-text-faint)" }}>confidence</div>
          </div>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "var(--radius-full)", background: `${color}20`, border: `1px solid ${color}40`, marginBottom: "12px" }}>
          <GradeIcon size={14} color={color} />
          <span style={{ fontSize: "13px", fontWeight: 700, color }}>Grade {scan.grade}</span>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 900, color, marginBottom: "10px" }}>{label}</h1>
        <p style={{ fontSize: "14px", color: "var(--vision-text-muted)", lineHeight: 1.7 }}>{scan.description}</p>

        {scan.images_analyzed && (
          <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--vision-text-faint)" }}>
            Analyzed {scan.images_analyzed} images · Sharpness score: {scan.best_image_score}
          </div>
        )}
      </div>

      {/* Advice */}
      <div
        className="glass animate-fade-up delay-100"
        style={{
          opacity: 0,
          padding: "20px",
          background: `${color}08`,
          borderColor: `${color}25`,
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <Eye size={18} color={color} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>Clinical Advice</div>
          <p style={{ fontSize: "13px", color: "var(--vision-text-muted)", lineHeight: 1.7 }}>{advice}</p>
        </div>
      </div>

      {/* All Probabilities */}
      {Object.keys(allProbs).length > 0 && (
        <div className="glass animate-fade-up delay-200" style={{ opacity: 0, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <BarChart2 size={16} color="var(--vision-primary)" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--vision-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Grade Probabilities
            </span>
          </div>
          {Object.entries(allProbs).map(([label, val], i) => (
            <ConfidenceBar key={label} label={label} value={val as number} color={gradeColors[i] ?? "#6366f1"} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="animate-fade-up delay-300" style={{ opacity: 0, display: "flex", gap: "10px" }}>
        <Link href="/scan" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
          <Eye size={16} /> New Scan
        </Link>
        <Link href="/history" className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
          History
        </Link>
      </div>
    </div>
  );
}
