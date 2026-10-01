"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { checkSlugAvailable } from "@/app/actions/pages";
import { PhoneMockup } from "./phone-mockup";

// Loops back to its first colour so the rotation has no visible seam
const RAINBOW = "conic-gradient(#FBC2A4,#F7A8C4,#C9A7F2,#A7C7F7,#FBC2A4)";

// Oversized square that spins behind the clipped border/glow. Only its transform
// animates, so the browser rotates it on the GPU instead of repainting the gradient.
const rainbowSpinner: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "150%",
  aspectRatio: "1",
  background: RAINBOW,
  transform: "translate(-50%, -50%)",
  willChange: "transform",
};

type SlugState = "idle" | "checking" | "available" | "taken" | "invalid";

export function Hero() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [slugState, setSlugState] = useState<SlugState>("idle");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runCheck = useCallback(async (value: string) => {
    const result = await checkSlugAvailable(value);
    if (result.available) {
      setSlugState("available");
    } else {
      setSlugState(result.error === "That username is already taken." ? "taken" : "invalid");
    }
  }, []);

  const handleUsernameChange = (value: string) => {
    const s = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 30);
    setUsername(s);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (s.length < 2) {
      setSlugState(s.length === 0 ? "idle" : "invalid");
      return;
    }
    setSlugState("checking");
    debounceRef.current = setTimeout(() => runCheck(s), 400);
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      inputRef.current?.focus();
      return;
    }
    if (slugState !== "available") {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    router.push(`/login?username=${encodeURIComponent(username)}`);
  };

  return (
    <section style={{ background: "#0A0A0A" }} aria-label="Hero">
      <div className="hero-outer" style={{ maxWidth: 1140, margin: "0 auto", padding: "88px 24px 56px" }}>
        {/* White framed card — overflow:visible so the glow is never clipped */}
        <div
          className="hero-card"
          style={{
            position: "relative",
            background: "#fff",
            color: "#0A0A0A",
            borderRadius: 28,
            border: "1px solid rgba(0,0,0,.06)",
            padding: "72px 64px",
            overflow: "visible",
          }}
        >
          <div className="hero-grid">
            <div className="hero-copy">
              {/* Beta badge */}
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 16px",
                  borderRadius: 999,
                  background: "#0A0A0A",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 20,
                }}
              >
                Beta
              </span>

              {/* Main headline */}
              <h1
                className="hero-heading"
                style={{
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  fontSize: "clamp(38px, 6vw, 62px)",
                  lineHeight: 1.05,
                  margin: "0 0 20px",
                  color: "#0A0A0A",
                }}
              >
                The link in bio
                <br />
                that converts
              </h1>

              {/* Subhead */}
              <p
                className="hero-subhead"
                style={{
                  color: "#6B6B6B",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "0 0 38px",
                  maxWidth: 480,
                }}
              >
                Send your audience anywhere, track every click, and keep full control of your traffic.
              </p>

              {/*
            Claim container — gradient border + soft pastel glow.
            isolation:isolate keeps z-index values local.
            overflow:visible on the card means the glow is never cut off.
          */}
              <div
                className="hero-claim"
                style={{ position: "relative", maxWidth: 560, margin: "0 0 14px", isolation: "isolate" }}
              >
                {/* Glow */}
                <div
                  aria-hidden="true"
                  className="hero-claim-glow"
                  style={{
                    position: "absolute",
                    inset: -14,
                    borderRadius: 28,
                    overflow: "hidden",
                    filter: "blur(26px)",
                    opacity: 0.7,
                    zIndex: 0,
                    pointerEvents: "none",
                  }}
                >
                  <span className="hero-rainbow" style={rainbowSpinner} />
                </div>
                {/* Gradient border frame — isolation makes Safari clip the spinning layer to the radius */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    borderRadius: 18,
                    padding: 2,
                    overflow: "hidden",
                    isolation: "isolate",
                  }}
                >
                  <span aria-hidden="true" className="hero-rainbow" style={rainbowSpinner} />
                  <form
                    onSubmit={handleClaim}
                    aria-label="Claim your username"
                    className="hero-claim-form"
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#fff",
                      borderRadius: 16,
                      padding: "8px 8px 8px 18px",
                      animation: shake ? "shake 0.4s" : undefined,
                    }}
                  >
                    <div
                      className="hero-claim-input-row"
                      style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, gap: 8 }}
                    >
                      <span
                        style={{
                          color: "#6B6B6B",
                          fontSize: 16,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          userSelect: "none",
                        }}
                      >
                        ultralink.bio/
                      </span>
                      <div
                        style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          value={username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          placeholder="yourname"
                          maxLength={32}
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          aria-label="Your username"
                          style={{
                            width: "100%",
                            minWidth: 0,
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontSize: 16,
                            color: "#0A0A0A",
                            padding: "8px 22px 8px 4px",
                            fontFamily: "inherit",
                          }}
                        />
                        {slugState === "checking" && (
                          <span
                            style={{
                              position: "absolute",
                              right: 4,
                              width: 14,
                              height: 14,
                              border: "2px solid #9a9a9a",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              display: "inline-block",
                              animation: "spin 0.75s linear infinite",
                            }}
                            aria-hidden="true"
                          />
                        )}
                        {slugState === "available" && (
                          <svg
                            style={{ position: "absolute", right: 4, width: 16, height: 16, color: "#059669" }}
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path d="M3 8l3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {(slugState === "taken" || slugState === "invalid") && (
                          <svg
                            style={{ position: "absolute", right: 4, width: 16, height: 16, color: "#dc2626" }}
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="hero-claim-btn"
                      style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        background: "#0A0A0A",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        padding: "12px 18px",
                        fontWeight: 500,
                        fontSize: 15,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "opacity 0.15s, transform 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.8";
                        e.currentTarget.style.transform = "scale(0.97)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      Claim my link
                      <ArrowRight className="hero-claim-arrow" size={16} strokeWidth={2.25} aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Micro-copy */}
              <p style={{ color: slugState === "taken" ? "#dc2626" : "#6B6B6B", fontSize: 13, marginTop: 14 }}>
                {slugState === "taken"
                  ? "That username is already taken."
                  : slugState === "invalid" && username.length > 0
                    ? "2–30 chars, a–z 0–9 -"
                    : null}
              </p>

              <style>{`
            @keyframes shake {
              10%, 90% { transform: translateX(-1px); }
              20%, 80% { transform: translateX(2px); }
              30%, 50%, 70% { transform: translateX(-4px); }
              40%, 60% { transform: translateX(4px); }
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes hero-rainbow-spin {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .hero-rainbow { animation: hero-rainbow-spin 6s linear infinite; }
            @media (prefers-reduced-motion: reduce) {
              .hero-rainbow { animation: none; }
            }
            .hero-grid {
              display: grid;
              grid-template-columns: minmax(0, 1fr) auto;
              align-items: center;
              gap: 56px;
            }
            .hero-claim-arrow { transition: transform 0.2s ease; }
            .hero-claim-btn:hover .hero-claim-arrow { transform: translateX(3px); }
            @media (max-width: 960px) {
              .hero-card { padding: 64px 32px !important; }
              .hero-grid { grid-template-columns: 1fr; gap: 56px; justify-items: center; }
              .hero-copy { text-align: center; }
              .hero-subhead, .hero-claim { margin-left: auto !important; margin-right: auto !important; }
              .hero-trust { justify-content: center !important; }
            }
            @media (max-width: 480px) {
              .phone-mockup { zoom: 0.86; }
              .hero-trust { gap: 8px 14px !important; font-size: 12px !important; }
              .hero-outer {
                padding: 96px 16px 32px !important;
              }
              .hero-card {
                padding: 40px 18px 36px !important;
              }
              .hero-heading {
                font-size: clamp(32px, 9vw, 44px) !important;
              }
              .hero-claim-glow {
                inset: -6px !important;
                filter: blur(14px) !important;
                opacity: 0.55 !important;
              }
              .hero-claim-form {
                flex-wrap: wrap !important;
                padding: 8px !important;
              }
              .hero-claim-input-row {
                width: 100% !important;
                padding-left: 10px !important;
              }
              .hero-claim-btn {
                width: 100% !important;
                padding: 12px 18px !important;
              }
            }
            /* The input hides its own outline, so ring the whole pill for keyboard users */
            .hero-claim-form:has(input:focus-visible) {
              outline: 2px solid #0A0A0A;
              outline-offset: 3px;
            }
          `}</style>

              {/* Trust indicators */}
              <div
                className="hero-trust"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 24,
                  marginTop: 30,
                  color: "#6B6B6B",
                  fontSize: 13,
                }}
              >
                {["Free Forever", "No card needed", "Live in 60 seconds"].map((item) => (
                  <span key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{ width: 12, height: 12, flexShrink: 0 }}
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6l2.5 2.5L10 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <PhoneMockup username={username} />
          </div>
        </div>
      </div>
    </section>
  );
}
