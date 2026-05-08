"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  Loader2,
  X,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";

const REQUIRED_IMAGES = 8;

type ScanState =
  | "intro"
  | "capturing"
  | "uploading"
  | "processing"
  | "done"
  | "error";

export default function ScanPage() {
  const router = useRouter();
  const supabase = createClient();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<ScanState>("intro");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [scanUuid] = useState(() => uuidv4());

  const stopCamera = useCallback(async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;

      for (const track of stream.getVideoTracks()) {
        try {
          const capabilities = track.getCapabilities() as any;

          if (capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: false }] as any,
            });
          }
        } catch (e) {
          console.log("Could not disable torch");
        }

        track.stop();
      }

      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = async () => {
    setState("capturing");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      const track = stream.getVideoTracks()[0];

      const capabilities = track.getCapabilities() as any;

      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: true }] as any,
        });
      } else {
        console.log("Torch not supported");
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setError("Could not access camera. Please check permissions.");
      setState("error");
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture_${images.length}.jpg`, {
          type: "image/jpeg",
        });
        const url = URL.createObjectURL(blob);
        setImages((prev) => [...prev, file]);
        setPreviews((prev) => [...prev, url]);

        if (images.length + 1 >= REQUIRED_IMAGES) {
          stopCamera();
        }
      },
      "image/jpeg",
      0.95,
    );
  };

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (images.length >= REQUIRED_IMAGES && state === "capturing") {
      upload();
    }
  }, [images.length, state]);

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
    if (images.length === REQUIRED_IMAGES) {
      startCamera();
    }
  };

  const upload = async () => {
    if (images.length < REQUIRED_IMAGES) {
      setError(`Please capture all ${REQUIRED_IMAGES} images.`);
      return;
    }

    setState("uploading");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated.");
      setState("error");
      return;
    }

    try {
      // Upload all 8 images to Supabase Storage
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const path = `scans/${scanUuid}/${i}_${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("retinal-images")
          .upload(path, file, { contentType: file.type });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("retinal-images").getPublicUrl(path);

        imageUrls.push(publicUrl);
        setProgress(Math.round(((i + 1) / images.length) * 60));
      }

      // Store image records in DB
      const imageRecords = imageUrls.map((url) => ({
        scan_uuid: scanUuid,
        user_id: user.id,
        image_url: url,
      }));

      await supabase.from("scan_images").insert(imageRecords);

      // Create pending scan record
      await supabase.from("scans").insert({
        scan_uuid: scanUuid,
        user_id: user.id,
        status: "processing",
      });

      setProgress(70);
      setState("processing");

      // Poll DB for completed status — timeout after 3 minutes
      const POLL_TIMEOUT_MS = 3 * 60 * 1000;
      const pollStart = Date.now();
      let pollAttempt = 0;

      const checkStatus = async () => {
        pollAttempt++;
        const elapsed = Date.now() - pollStart;

        if (elapsed > POLL_TIMEOUT_MS) {
          setError(
            "Analysis timed out. The backend may be unavailable. Please try again or contact support.",
          );
          setState("error");
          return;
        }

        try {
          const { data, error: dbErr } = await supabase
            .from("scans")
            .select("status")
            .eq("scan_uuid", scanUuid)
            .single();

          if (dbErr) {
            console.error("[Scan] DB poll error:", dbErr.message);
          }

          if (data && data.status === "completed") {
            setProgress(100);
            setState("done");
            setTimeout(() => {
              router.push(`/result/${scanUuid}`);
            }, 1500);
          } else if (data && data.status === "error") {
            setError(
              "AI analysis failed on the server. Please try capturing again.",
            );
            setState("error");
          } else {
            // Slowly increment to 95% max while waiting
            setProgress((p) => (p < 95 ? Math.min(p + 1, 95) : p));
            setTimeout(checkStatus, 2500);
          }
        } catch (pollErr: any) {
          console.error("[Scan] Polling exception:", pollErr);
          setProgress((p) => (p < 95 ? p + 1 : p));
          setTimeout(checkStatus, 3000);
        }
      };

      checkStatus();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60dvh",
          gap: "16px",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(16,185,129,0.15)",
            border: "2px solid #10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="animate-scale-in"
        >
          <CheckCircle2 size={40} color="#10b981" />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 800 }}>
          Analysis Complete!
        </h2>
        <p style={{ color: "var(--vision-text-muted)", fontSize: "14px" }}>
          Redirecting to your results...
        </p>
      </div>
    );
  }

  if (state === "processing" || state === "uploading") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60dvh",
          gap: "20px",
          padding: "24px",
        }}
      >
        <div style={{ position: "relative", width: "100px", height: "100px" }}>
          <svg
            width="100"
            height="100"
            className="progress-ring animate-spin-slow"
            style={{ position: "absolute" }}
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="var(--vision-surface-3)"
              strokeWidth="4"
            />
          </svg>
          <svg
            width="100"
            height="100"
            className="progress-ring"
            style={{ position: "absolute" }}
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="var(--vision-primary)"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Eye size={28} color="var(--vision-primary)" />
          </div>
        </div>
        <div>
          <h2
            style={{ fontSize: "20px", fontWeight: 800, textAlign: "center" }}
          >
            {state === "uploading" ? "Uploading Images" : "AI Analysis Running"}
          </h2>
          <p
            style={{
              color: "var(--vision-text-muted)",
              fontSize: "14px",
              textAlign: "center",
              marginTop: "6px",
            }}
          >
            {state === "uploading"
              ? "Securely uploading your retinal images..."
              : "Selecting best image and running prediction..."}
          </p>
        </div>
        <div
          style={{
            width: "200px",
            height: "4px",
            background: "var(--vision-surface-3)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "var(--grad-primary)",
              transition: "width 0.3s ease",
              borderRadius: "2px",
            }}
          />
        </div>
        <div style={{ fontSize: "13px", color: "var(--vision-text-muted)" }}>
          {progress}%
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800 }}>New Retinal Scan</h1>
        <p
          style={{
            color: "var(--vision-text-muted)",
            fontSize: "14px",
            marginTop: "6px",
          }}
        >
          Capture {REQUIRED_IMAGES} images for accurate analysis.
        </p>
      </div>

      {/* Instructions */}
      {state === "intro" && (
        <div
          className="glass animate-fade-up"
          style={{
            padding: "20px",
            marginBottom: "20px",
            opacity: 0,
            background: "rgba(99,102,241,0.06)",
            borderColor: "rgba(99,102,241,0.2)",
          }}
        >
          <div
            style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
          >
            <Eye
              size={18}
              color="var(--vision-primary)"
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                Before you start
              </div>
              <ul
                style={{
                  fontSize: "13px",
                  color: "var(--vision-text-muted)",
                  lineHeight: 1.9,
                  listStyle: "none",
                  padding: 0,
                }}
              >
                <li>• Hold phone 5–10cm from the eye</li>
                <li>• Use the Vision device attachment</li>
                <li>• Keep your eye open and centered</li>
                <li>• Take {REQUIRED_IMAGES} photos — AI picks the sharpest</li>
              </ul>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "20px" }}
            onClick={startCamera}
          >
            <Camera size={16} /> Open Camera
          </button>
        </div>
      )}

      {state === "capturing" && images.length < REQUIRED_IMAGES && (
        <div
          style={{
            marginBottom: "20px",
            position: "relative",
            borderRadius: "14px",
            overflow: "hidden",
            background: "#000",
            aspectRatio: "4/3",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={captureFrame}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "4px solid white",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              background: "rgba(0,0,0,0.6)",
              padding: "4px 12px",
              borderRadius: "20px",
              color: "white",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {images.length} / {REQUIRED_IMAGES}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Progress bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--vision-text-muted)" }}>
          {images.length}/{REQUIRED_IMAGES} images
        </span>
        <span
          style={{
            fontSize: "13px",
            color:
              images.length === REQUIRED_IMAGES
                ? "#10b981"
                : "var(--vision-text-muted)",
            fontWeight: 600,
          }}
        >
          {images.length === REQUIRED_IMAGES
            ? "✓ Ready to analyze"
            : `Need ${REQUIRED_IMAGES - images.length} more`}
        </span>
      </div>
      <div
        style={{
          height: "4px",
          background: "var(--vision-surface-3)",
          borderRadius: "2px",
          marginBottom: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(images.length / REQUIRED_IMAGES) * 100}%`,
            height: "100%",
            background: "var(--grad-primary)",
            transition: "width 0.3s",
            borderRadius: "2px",
          }}
        />
      </div>

      {/* Image Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {Array.from({ length: REQUIRED_IMAGES }).map((_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: "1",
              borderRadius: "10px",
              border: `2px dashed ${previews[i] ? "transparent" : "var(--vision-border)"}`,
              background: "var(--vision-surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
          >
            {previews[i] ? (
              <>
                <img
                  src={previews[i]}
                  alt={`Retina ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.7)",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--vision-text-faint)",
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {(error || state === "error") && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            padding: "12px 16px",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            fontSize: "13px",
            color: "#ef4444",
            marginBottom: "16px",
            alignItems: "flex-start",
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
          {error || "An error occurred. Please try again."}
        </div>
      )}

      {state === "error" && (
        <button
          className="btn btn-ghost"
          onClick={() => {
            setState("intro");
            setError("");
          }}
        >
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
}
