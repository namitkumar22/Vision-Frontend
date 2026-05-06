"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, Shield, Zap, Activity, ArrowRight, ChevronRight, Star, Scan, Brain, Lock } from "lucide-react";

/* ─── Animated Retina Orb ───────────────────────────── */
function RetinaOrb() {
  return (
    <div className="orb-hero-wrap">
      <div className="orb-blob animate-morph animate-pulse-glow" />
      <div className="orb-ring ring-a animate-spin-slow" />
      <div className="orb-ring ring-b animate-spin-reverse" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <div key={i} className="orbit-particle" style={{ "--deg": `${deg}deg` } as any} />
      ))}
      <div className="orb-core">
        <Eye size={52} strokeWidth={1} color="rgba(96,165,250,0.95)" />
        <div className="scan-beam" />
        <div className="scan-beam delay-beam" />
      </div>
      <div className="data-chip chip-1 animate-float">90% Accuracy</div>
      <div className="data-chip chip-2 animate-float-slow">Grade 0–4</div>
      <div className="data-chip chip-3 animate-float">{"< 30s"}</div>

      <style>{`
        .orb-hero-wrap { position:relative; width:340px; height:340px; display:flex; align-items:center; justify-content:center; }
        .orb-blob { position:absolute; width:260px; height:260px;
          background:radial-gradient(ellipse at 35% 35%, rgba(96,165,250,0.22) 0%, rgba(167,139,250,0.14) 45%, rgba(34,211,238,0.08) 100%);
          border:1px solid rgba(96,165,250,0.2); will-change:border-radius; }
        .orb-ring { position:absolute; border-radius:50%; border:1px solid transparent; pointer-events:none; }
        .ring-a { width:290px; height:290px; border-top-color:rgba(96,165,250,0.5); border-right-color:rgba(96,165,250,0.15); }
        .ring-b { width:320px; height:320px; border-bottom-color:rgba(167,139,250,0.4); border-left-color:rgba(34,211,238,0.2); }
        .orbit-particle { position:absolute; width:7px; height:7px; border-radius:50%;
          background:var(--vision-primary); box-shadow:0 0 10px rgba(96,165,250,0.8),0 0 20px rgba(96,165,250,0.4);
          top:50%; left:50%; margin:-3.5px;
          animation:orbit 12s linear infinite; animation-delay:calc(var(--deg) / 360 * -12s); }
        .orb-core { width:150px; height:150px; border-radius:50%;
          background:radial-gradient(circle at 40% 35%, rgba(96,165,250,0.18) 0%, rgba(2,5,16,0.97) 65%);
          border:1px solid rgba(96,165,250,0.35); display:flex; align-items:center; justify-content:center;
          position:relative; overflow:hidden; z-index:2;
          box-shadow:0 0 60px rgba(96,165,250,0.15) inset, 0 0 40px rgba(96,165,250,0.1); }
        .scan-beam { position:absolute; width:100%; height:2px;
          background:linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.9) 50%, transparent 100%);
          animation:scan-line 2.8s ease-in-out infinite; }
        .delay-beam { animation-delay:1.4s; background:linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.7) 50%, transparent 100%); }
        .data-chip { position:absolute; padding:6px 14px; background:rgba(8,13,26,0.85);
          border:1px solid rgba(96,165,250,0.25); border-radius:100px; font-size:11px; font-weight:700;
          color:var(--vision-primary); backdrop-filter:blur(12px); white-space:nowrap; letter-spacing:0.04em; z-index:3; }
        .chip-1 { top:16px; right:-8px; }
        .chip-2 { bottom:40px; left:-16px; }
        .chip-3 { bottom:16px; right:8px; }
      `}</style>
    </div>
  );
}

/* ─── Animated counter ──────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = () => {
        start += Math.ceil(to / 60);
        setVal(Math.min(start, to));
        if (start < to) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Step card ─────────────────────────────────────── */
function Step({ n, icon, title, desc, delay }: { n: string; icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <div className="step-card animate-fade-up" style={{ animationDelay: `${delay}ms`, opacity: 0 }}>
      <div className="step-number">{n}</div>
      <div className="step-icon-wrap">{icon}</div>
      <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "12px 0 8px" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "var(--vision-text-muted)", lineHeight: 1.7 }}>{desc}</p>

      <style>{`
        .step-card { padding:28px 24px; background:rgba(8,13,26,0.6); border:1px solid rgba(255,255,255,0.055);
          border-radius:22px; position:relative; overflow:hidden; transition:transform 0.3s, border-color 0.3s, box-shadow 0.3s; }
        .step-card:hover { transform:translateY(-4px); border-color:rgba(96,165,250,0.3); box-shadow:0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(96,165,250,0.1); }
        .step-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent); opacity:0; transition:opacity 0.3s; }
        .step-card:hover::before { opacity:1; }
        .step-number { font-family:'DM Mono',monospace; font-size:11px; font-weight:500; color:var(--vision-primary); letter-spacing:0.1em; margin-bottom:14px; opacity:0.8; }
        .step-icon-wrap { width:46px; height:46px; border-radius:14px; background:rgba(96,165,250,0.1);
          border:1px solid rgba(96,165,250,0.2); display:flex; align-items:center; justify-content:center; color:var(--vision-primary); }
      `}</style>
    </div>
  );
}

/* ─── Grade bar row ─────────────────────────────────── */
function GradeRow({ grade, label, color, pct }: { grade: number; label: string; color: string; pct: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}`, flexShrink: 0 }} />
      <div style={{ fontSize: "13px", color: "var(--vision-text-muted)", minWidth: "60px" }}>Grade {grade}</div>
      <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "2px" }} />
      </div>
      <div style={{ fontSize: "13px", fontWeight: 700, color, minWidth: "120px", textAlign: "right" }}>{label}</div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>

      {/* Ambient orbs */}
      <div className="orb" style={{ width: "700px", height: "700px", background: "rgba(96,165,250,0.07)", top: "-200px", left: "-200px" }} />
      <div className="orb" style={{ width: "500px", height: "500px", background: "rgba(167,139,250,0.06)", top: "20%", right: "-200px" }} />
      <div className="orb" style={{ width: "600px", height: "600px", background: "rgba(34,211,238,0.04)", bottom: "-100px", left: "25%" }} />

      {/* ═══ NAV ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 28px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(2,5,16,0.75)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Eye size={17} color="white" />
          </div>
          <span style={{ fontFamily: "Space Grotesk", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em" }}>Vision</span>
          <span style={{ fontSize: "10px", fontWeight: 700, background: "var(--grad-accent)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.1em", marginLeft: "2px" }}>BETA</span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Get Started <ArrowRight size={13} /></Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "96px 24px 64px", textAlign: "center", position: "relative",
      }}>
        {/* Pill badge */}
        <div className="animate-fade-up" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 18px", borderRadius: "100px",
          background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.25)",
          fontSize: "12px", fontWeight: 700, color: "var(--vision-primary)",
          letterSpacing: "0.08em", textTransform: "uppercase",
          marginBottom: "32px", opacity: 0,
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--vision-cyan)", display: "inline-block", animation: "blink 2s ease-in-out infinite" }} />
          AI-Powered · EfficientNet · Clinical Grade
        </div>

        {/* Orb */}
        <div className="animate-fade-up delay-100" style={{ opacity: 0, marginBottom: "44px" }}>
          <RetinaOrb />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-200" style={{
          fontSize: "clamp(38px, 7.5vw, 80px)", fontWeight: 900,
          maxWidth: "860px", lineHeight: 1.05, opacity: 0, letterSpacing: "-0.03em",
        }}>
          See What{" "}
          <span className="text-gradient">Your Eyes</span>
          <br />Can&apos;t Tell You
        </h1>

        <p className="animate-fade-up delay-300" style={{
          fontSize: "clamp(15px, 2vw, 19px)", color: "var(--vision-text-muted)",
          maxWidth: "540px", marginTop: "24px", lineHeight: 1.85, opacity: 0,
        }}>
          Capture 8 retinal photos. Vision&apos;s AI pipeline selects the sharpest,
          enhances it clinically, and delivers your diabetic retinopathy grade
          in under 30 seconds — right in your browser.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up delay-400" style={{
          display: "flex", gap: "14px", marginTop: "44px",
          flexWrap: "wrap", justifyContent: "center", opacity: 0,
        }}>
          <Link href="/register" className="btn btn-primary btn-lg">
            Start Free Scan <ArrowRight size={18} />
          </Link>
          <Link href="#how" className="btn btn-secondary btn-lg">How It Works</Link>
        </div>

        {/* Stats strip */}
        <div className="animate-fade-up delay-500" style={{
          display: "flex", marginTop: "72px",
          background: "rgba(8,13,26,0.6)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", overflow: "hidden", opacity: 0,
        }}>
          {[
            { to: 90, suffix: "%", label: "AI Accuracy" },
            { to: 5, suffix: " Grades", label: "DR Detection" },
            { to: 30, suffix: "s", label: "Results Time" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "20px 36px",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "28px", fontWeight: 900, background: "var(--grad-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: "12px", color: "var(--vision-text-muted)", marginTop: "4px", letterSpacing: "0.04em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" style={{ padding: "100px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--vision-primary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>THE PROCESS</div>
          <h2 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 900 }}>
            From capture to <span className="text-gradient">diagnosis</span>
          </h2>
          <p style={{ color: "var(--vision-text-muted)", marginTop: "14px", fontSize: "16px", maxWidth: "460px", margin: "14px auto 0" }}>
            Four simple steps. Zero ophthalmologist visit required.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
          <Step n="01 /" icon={<Shield size={20} />} title="Register" desc="Sign up with your email and basic health details. No password — we use secure email OTP." delay={0} />
          <Step n="02 /" icon={<Scan size={20} />} title="Capture" desc="Take 8 retinal photos using our guided interface. Hold steady — AI handles the rest." delay={100} />
          <Step n="03 /" icon={<Brain size={20} />} title="AI Analysis" desc="EfficientNet selects the sharpest image, runs Ben Graham + CLAHE preprocessing, and classifies." delay={200} />
          <Step n="04 /" icon={<Activity size={20} />} title="Results" desc="Receive your DR grade (0–4), confidence score, and full scan history — instantly." delay={300} />
        </div>
      </section>

      {/* ═══ DR GRADES ═══ */}
      <section style={{ padding: "80px 24px", maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--vision-violet)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>DETECTION SPECTRUM</div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 900 }}>
            5 Grades of <span className="text-gradient">DR Detection</span>
          </h2>
        </div>
        <div className="glass" style={{ padding: "32px" }}>
          <GradeRow grade={0} label="No DR" color="#34d399" pct={20} />
          <GradeRow grade={1} label="Mild DR" color="#fbbf24" pct={40} />
          <GradeRow grade={2} label="Moderate DR" color="#fb923c" pct={60} />
          <GradeRow grade={3} label="Severe DR" color="#f87171" pct={80} />
          <GradeRow grade={4} label="Proliferative DR" color="#a78bfa" pct={100} />
          <p style={{ fontSize: "12px", color: "var(--vision-text-faint)", marginTop: "20px", textAlign: "center" }}>
            Bar width represents severity progression · Not a clinical substitute
          </p>
        </div>
      </section>

      {/* ═══ FEATURES BENTO ═══ */}
      <section style={{ padding: "80px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--vision-cyan)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>THE TECH</div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 44px)", fontWeight: 900 }}>
            Built for <span className="text-gradient-accent">clinical precision</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <div className="glass animate-fade-up" style={{
            gridColumn: "span 2", padding: "36px", opacity: 0,
            background: "linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(167,139,250,0.05) 100%)",
            borderColor: "rgba(96,165,250,0.2)", position: "relative", overflow: "hidden",
          }}>
            <div className="orb" style={{ width: "200px", height: "200px", background: "rgba(96,165,250,0.12)", top: "-60px", right: "-40px" }} />
            <Eye size={28} color="var(--vision-primary)" style={{ marginBottom: "14px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "10px" }}>Laplacian Sharpness Selection</h3>
            <p style={{ fontSize: "14px", color: "var(--vision-text-muted)", lineHeight: 1.75, maxWidth: "400px" }}>
              From your 8 captures, Vision computes Laplacian variance for each frame and automatically
              selects the sharpest image — the one most suitable for clinical grading.
            </p>
          </div>

          <div className="glass animate-fade-up delay-100" style={{ padding: "28px", opacity: 0 }}>
            <Zap size={24} color="var(--vision-cyan)" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>Ben Graham Pipeline</h3>
            <p style={{ fontSize: "13px", color: "var(--vision-text-muted)", lineHeight: 1.7 }}>
              Award-winning preprocessing that removes uneven phone-flash illumination.
            </p>
          </div>

          <div className="glass animate-fade-up delay-200" style={{ padding: "28px", opacity: 0 }}>
            <Activity size={24} color="var(--vision-violet)" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>CLAHE Enhancement</h3>
            <p style={{ fontSize: "13px", color: "var(--vision-text-muted)", lineHeight: 1.7 }}>
              Adaptive histogram equalization amplifies blood vessel contrast in the green channel.
            </p>
          </div>

          <div className="glass animate-fade-up delay-300" style={{
            gridColumn: "span 2", padding: "36px", opacity: 0,
            background: "linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(34,211,238,0.04) 100%)",
            borderColor: "rgba(52,211,153,0.18)",
          }}>
            <Lock size={28} color="var(--vision-green)" style={{ marginBottom: "14px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "10px" }}>Secure by Design</h3>
            <p style={{ fontSize: "14px", color: "var(--vision-text-muted)", lineHeight: 1.75 }}>
              Every scan gets a unique UUID. Row-level security on all data.
              Email OTP authentication — no passwords, no SMS, no hassle.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section style={{ padding: "80px 24px 120px" }}>
        <div style={{
          maxWidth: "760px", margin: "0 auto", padding: "72px 48px", textAlign: "center",
          background: "linear-gradient(135deg, rgba(96,165,250,0.1) 0%, rgba(167,139,250,0.08) 50%, rgba(244,114,182,0.06) 100%)",
          border: "1px solid rgba(96,165,250,0.25)", borderRadius: "32px",
          position: "relative", overflow: "hidden",
        }}>
          <div className="orb" style={{ width: "400px", height: "400px", background: "rgba(96,165,250,0.1)", top: "-80px", right: "-80px" }} />
          <div className="orb" style={{ width: "300px", height: "300px", background: "rgba(167,139,250,0.08)", bottom: "-60px", left: "-60px" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <Star size={36} color="var(--vision-primary)" style={{ marginBottom: "20px", opacity: 0.9 }} />
            <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.025em" }}>
              Start screening today —{" "}
              <span className="text-gradient">it&apos;s free</span>
            </h2>
            <p style={{ color: "var(--vision-text-muted)", marginTop: "16px", marginBottom: "40px", fontSize: "16px", maxWidth: "420px", margin: "16px auto 40px" }}>
              No app download. No ophthalmologist. Works on any smartphone browser.
            </p>
            <Link href="/register" className="btn btn-primary btn-xl">
              Create Free Account <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "40px 24px", textAlign: "center", color: "var(--vision-text-faint)", fontSize: "13px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Eye size={12} color="white" />
          </div>
          <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, color: "var(--vision-text-muted)" }}>Vision</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "28px", marginBottom: "16px" }}>
          <Link href="/privacy" style={{ color: "var(--vision-text-faint)", textDecoration: "none" }}>Privacy</Link>
          <Link href="/about" style={{ color: "var(--vision-text-faint)", textDecoration: "none" }}>About</Link>
          <Link href="/contact" style={{ color: "var(--vision-text-faint)", textDecoration: "none" }}>Contact</Link>
        </div>
        <p>© 2026 Vision Health Technology · Vision beyond sight.</p>
      </footer>
    </main>
  );
}
