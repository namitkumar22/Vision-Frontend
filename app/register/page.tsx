"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Mail, User, Calendar, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    diabeticSince: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.age) {
      setError("Please fill in all required fields (Name, Email, Age).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (parseInt(form.age) < 1 || parseInt(form.age) > 120) {
      setError("Please enter a valid age between 1 and 120.");
      return;
    }

    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: { shouldCreateUser: true },
      });

      if (otpError) throw otpError;

      // Store form data temporarily in sessionStorage for post-OTP profile creation
      sessionStorage.setItem("vision_register_form", JSON.stringify(form));
      setStep("otp");
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("rate") || msg.includes("too many")) {
        setError("Too many attempts. Please wait a minute and try again.");
      } else if (msg.includes("already") || msg.includes("exists")) {
        setError("This email is already registered. Please sign in instead.");
      } else if (msg.includes("network") || msg.includes("fetch")) {
        setError("Connection error. Please check your internet and try again.");
      } else if (msg.includes("invalid")) {
        setError("This email address doesn't appear to be valid. Please double-check it.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Bg orbs */}
      <div className="orb" style={{ width: "500px", height: "500px", background: "rgba(99,102,241,0.1)", top: "-100px", left: "-100px" }} />
      <div className="orb" style={{ width: "400px", height: "400px", background: "rgba(6,182,212,0.08)", bottom: "-80px", right: "-80px" }} />

      <div className="glass animate-scale-in" style={{ width: "100%", maxWidth: "420px", padding: "40px 32px", position: "relative" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Eye size={18} color="white" />
          </div>
          <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "18px" }}>Vision</span>
        </div>

        {step === "details" && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Create Account</h1>
            <p style={{ color: "var(--vision-text-muted)", fontSize: "14px", marginBottom: "28px" }}>
              Register to start your retinal screening journey with Vision.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name */}
              <div>
                <label className="input-label">Full Name *</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--vision-text-faint)" }} />
                  <input className="input" style={{ paddingLeft: "40px" }} type="text" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="input-label">Email Address *</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--vision-text-faint)" }} />
                  <input
                    className="input"
                    style={{ paddingLeft: "40px" }}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="input-label">Age *</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--vision-text-faint)" }} />
                  <input className="input" style={{ paddingLeft: "40px" }} type="number" name="age" placeholder="Your age" value={form.age} onChange={handleChange} required min={1} max={120} />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="input-label">Gender</label>
                <select className="input" name="gender" value={form.gender} onChange={handleChange} style={{ cursor: "pointer" }}>
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Diabetic since */}
              <div>
                <label className="input-label">Diabetic since (year)</label>
                <input className="input" type="number" name="diabeticSince" placeholder="e.g. 2020" value={form.diabeticSince} onChange={handleChange} min={1900} max={2026} />
              </div>

              {error && (
                <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "#ef4444" }}>
                  {error}
                </div>
              )}

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: "8px" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Sending OTP..." : "Continue"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--vision-text-muted)" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--vision-primary)", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
            </p>
          </>
        )}

        {step === "otp" && <OtpStep email={form.email} onBack={() => setStep("details")} />}
      </div>
    </div>
  );
}

/* ── OTP Verification step ─────────────────────────── */
function OtpStep({ email, onBack }: { email: string; onBack: () => void }) {
  const router = useRouter();
  const supabase = createClient();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus();
  };

  const verify = async () => {
    const token = otp.join("");
    if (token.length < 6) { setError("Please enter the complete 6-digit code."); return; }

    setLoading(true);
    setError("");
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (verifyError) throw verifyError;

      // Create profile in Supabase
      const saved = sessionStorage.getItem("vision_register_form");
      if (saved && data.user) {
        const fd = JSON.parse(saved);
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name: fd.name,
          email: fd.email,
          age: parseInt(fd.age),
          gender: fd.gender || null,
          diabetic_since: fd.diabeticSince ? parseInt(fd.diabeticSince) : null,
        });
        sessionStorage.removeItem("vision_register_form");
      }

      router.replace("/dashboard");
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("expired") || msg.includes("invalid")) {
        setError("This code is incorrect or has expired. Please request a new one.");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: "20px", paddingLeft: "0" }}>
        <ChevronLeft size={16} /> Back
      </button>
      <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Verify Email</h1>
      <p style={{ color: "var(--vision-text-muted)", fontSize: "14px", marginBottom: "28px" }}>
        Enter the 6-digit code sent to <strong style={{ color: "var(--vision-text)" }}>{email}</strong>
      </p>

      {/* OTP boxes */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", justifyContent: "center" }}>
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            style={{
              width: "48px",
              height: "56px",
              textAlign: "center",
              fontSize: "22px",
              fontWeight: 700,
              background: "var(--vision-surface-2)",
              border: `2px solid ${digit ? "var(--vision-primary)" : "var(--vision-border)"}`,
              borderRadius: "12px",
              color: "var(--vision-text)",
              outline: "none",
              transition: "border-color 0.2s",
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "#ef4444", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <button className="btn btn-primary" style={{ width: "100%" }} onClick={verify} disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>
    </div>
  );
}
