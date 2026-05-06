"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Loader2, ChevronLeft, ArrowRight, Mail, UserPlus, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notRegistered, setNotRegistered] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotRegistered(false);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (otpError) throw otpError;
      setStep("otp");
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (
        msg.includes("signups not allowed") ||
        msg.includes("user not found") ||
        msg.includes("not found") ||
        msg.includes("invalid login") ||
        msg.includes("email not confirmed") ||
        msg.includes("no user")
      ) {
        setNotRegistered(true);
      } else if (msg.includes("rate") || msg.includes("too many")) {
        setError("Too many attempts. Please wait a minute and try again.");
      } else if (msg.includes("network") || msg.includes("fetch")) {
        setError("Connection error. Please check your internet and try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) (document.getElementById(`login-otp-${i + 1}`) as HTMLInputElement)?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      (document.getElementById(`login-otp-${i - 1}`) as HTMLInputElement)?.focus();
  };

  const verify = async () => {
    const token = otp.join("");
    if (token.length < 6) { setError("Enter the 6-digit OTP."); return; }
    setLoading(true);
    setError("");
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (verifyError) throw verifyError;
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" }}>
      <div className="orb" style={{ width: "500px", height: "500px", background: "rgba(99,102,241,0.1)", top: "-100px", right: "-100px" }} />
      <div className="orb" style={{ width: "300px", height: "300px", background: "rgba(6,182,212,0.08)", bottom: "-80px", left: "-80px" }} />

      <div className="glass animate-scale-in" style={{ width: "100%", maxWidth: "400px", padding: "36px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Eye size={18} color="white" />
          </div>
          <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "18px" }}>Vision</span>
        </div>

        {step === "email" ? (
          <>
            <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "6px" }}>Welcome Back</h1>
            <p style={{ color: "var(--vision-text-muted)", fontSize: "13px", marginBottom: "24px" }}>
              Sign in with your registered email to continue.
            </p>

            {/* Account Not Found Banner */}
            {notRegistered && (
              <div style={{
                padding: "16px",
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.35)",
                borderRadius: "14px",
                marginBottom: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <AlertCircle size={16} color="#fbbf24" />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#fbbf24" }}>Account Not Found</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--vision-text-muted)", marginBottom: "12px", lineHeight: 1.6 }}>
                  We couldn't find an account for <strong style={{ color: "var(--vision-text)" }}>{email}</strong>. You need to create an account first before signing in.
                </p>
                <Link href={`/register`} className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center", textDecoration: "none", display: "flex" }}>
                  <UserPlus size={14} /> Create Account Now
                </Link>
              </div>
            )}

            <form onSubmit={sendOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="input-label">Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--vision-text-faint)" }} />
                  <input
                    className="input"
                    style={{ paddingLeft: "40px" }}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setNotRegistered(false); setError(""); }}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {error && (
                <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "#ef4444", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span>{error}</span>
                </div>
              )}

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Sending code..." : "Send Sign-In Code"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--vision-text-muted)" }}>
              New to Vision?{" "}
              <Link href="/register" style={{ color: "var(--vision-primary)", fontWeight: 600, textDecoration: "none" }}>Create Account</Link>
            </p>
          </>
        ) : (
          <>
            <button onClick={() => { setStep("email"); setOtp(["","","","","",""]); setError(""); }} className="btn btn-ghost btn-sm" style={{ marginBottom: "20px", paddingLeft: "0" }}>
              <ChevronLeft size={16} /> Back
            </button>
            <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "6px" }}>Enter Your Code</h1>
            <p style={{ color: "var(--vision-text-muted)", fontSize: "13px", marginBottom: "24px" }}>
              We sent a 6-digit code to <strong style={{ color: "var(--vision-text)" }}>{email}</strong>. Check your inbox (and spam folder).
            </p>

            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`login-otp-${i}`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  style={{
                    width: "44px",
                    height: "52px",
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: 700,
                    background: "var(--vision-surface-2)",
                    border: `2px solid ${digit ? "var(--vision-primary)" : "var(--vision-border)"}`,
                    borderRadius: "12px",
                    color: "var(--vision-text)",
                    outline: "none",
                    transition: "border-color 0.2s",
                    flex: "1",
                    minWidth: "0",
                  }}
                />
              ))}
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "#ef4444", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>{error}</span>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={verify} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Verifying..." : "Sign In"}
            </button>

            <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--vision-text-muted)" }}>
              Didn't receive the email?{" "}
              <button onClick={sendOtp as any} style={{ background: "none", border: "none", color: "var(--vision-primary)", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
                Resend Code
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
