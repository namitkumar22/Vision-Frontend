import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Vision",
  description: "How Vision handles, stores, and protects your retinal health data.",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100dvh", padding: "40px 24px", maxWidth: "700px", margin: "0 auto" }}>
      <Link href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: "28px", paddingLeft: 0 }}>
        <ChevronLeft size={16} /> Back
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--vision-primary-dim)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={22} color="var(--vision-primary)" />
        </div>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800 }}>Privacy Policy</h1>
          <p style={{ fontSize: "12px", color: "var(--vision-text-faint)" }}>Last updated: April 2026</p>
        </div>
      </div>

      <div className="glass" style={{ padding: "32px", lineHeight: 1.8 }}>
        {[
          {
            icon: <Eye size={18} />,
            title: "Data We Collect",
            content: "We collect your name, phone number, age, gender, and retinal images you upload. Images are stored securely in Supabase Storage with unique identifiers. We do not sell your data to any third party.",
          },
          {
            icon: <Lock size={18} />,
            title: "How We Use Your Data",
            content: "Your retinal images are used solely to generate diabetic retinopathy predictions using our AI model. Images are processed temporarily and stored with your consent. Scan history is accessible only to you.",
          },
          {
            icon: <Shield size={18} />,
            title: "Data Security",
            content: "All data is encrypted in transit (TLS) and at rest. We use Supabase Row Level Security (RLS) ensuring each user can only access their own records. We follow industry best practices for healthcare data.",
          },
          {
            icon: <Shield size={18} />,
            title: "Your Rights",
            content: "You have the right to request deletion of your account and all associated data at any time. Contact us at privacy@vision.health. We comply with applicable data protection regulations.",
          },
          {
            icon: <Eye size={18} />,
            title: "Disclaimer",
            content: "Vision is an AI-assisted screening tool and is NOT a substitute for professional medical advice. Always consult a qualified ophthalmologist for diagnosis and treatment decisions.",
          },
        ].map(({ icon, title, content }, i) => (
          <div key={i} style={{ marginBottom: i < 4 ? "28px" : 0, paddingBottom: i < 4 ? "28px" : 0, borderBottom: i < 4 ? "1px solid var(--vision-border)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", color: "var(--vision-primary)" }}>
              {icon}
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--vision-text)" }}>{title}</h3>
            </div>
            <p style={{ fontSize: "14px", color: "var(--vision-text-muted)", lineHeight: 1.8 }}>{content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
