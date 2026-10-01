import { SocialIcon } from "@/components/public/social-icon";

// Pastel take on the hero's claim-field gradient, so the phone feels part of the same palette
const SCREEN_BG = "linear-gradient(180deg,#FDEDE4 0%,#FBE3EE 38%,#EEE5FB 72%,#E4EDFC 100%)";

const EXAMPLE_SOCIALS = ["instagram", "tiktok", "youtube", "x"];
const EXAMPLE_LINKS = ["Watch my newest vlog", "Shop my travel essentials", "Join my newsletter", "Book a collab"];

// "franek-k" → "Franek K"
function nameFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const ellipsis: React.CSSProperties = {
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/**
 * Decorative iPhone showing an example Ultralink page. Pure CSS/SVG — no image
 * request — and exposed to assistive tech as a single labelled image.
 */
export function PhoneMockup({ username = "" }: { username?: string }) {
  // Mirrors what the visitor types into the claim field; falls back to the example creator
  const typedName = nameFromSlug(username);
  const name = typedName || "Mia Laurent";
  const handle = typedName ? username : "mialaurent";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div
      role="img"
      aria-label="Example Ultralink page on an iPhone"
      className="phone-mockup"
      style={{ position: "relative" }}
    >
      {/* Side buttons — action + volume left, power right */}
      {[
        { side: "left", top: 112, height: 26 },
        { side: "left", top: 156, height: 46 },
        { side: "left", top: 212, height: 46 },
        { side: "right", top: 176, height: 74 },
      ].map((b) => (
        <span
          key={`${b.side}-${b.top}`}
          aria-hidden="true"
          style={{
            position: "absolute",
            [b.side]: -2,
            top: b.top,
            width: 3,
            height: b.height,
            borderRadius: 2,
            background: "linear-gradient(90deg,#3a3a3d,#5b5b60)",
          }}
        />
      ))}

      {/* Titanium frame */}
      <div
        aria-hidden="true"
        style={{
          width: 290,
          height: 628,
          padding: 3,
          borderRadius: 54,
          background: "linear-gradient(145deg,#5d5d62 0%,#2a2a2d 35%,#1c1c1e 65%,#4a4a4f 100%)",
          boxShadow: "0 40px 80px -24px rgba(10,10,10,.45), 0 16px 32px -16px rgba(10,10,10,.3)",
        }}
      >
        {/* Black bezel */}
        <div style={{ width: "100%", height: "100%", padding: 8, borderRadius: 51, background: "#0A0A0A" }}>
          {/* Screen */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: 43,
              overflow: "hidden",
              background: SCREEN_BG,
              color: "#0A0A0A",
            }}
          >
            {/* Dynamic Island */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 86,
                height: 25,
                borderRadius: 999,
                background: "#000",
                zIndex: 2,
              }}
            />

            <StatusBar />

            {/* Example profile — mirrors the public page layout */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 18px 0" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#F59E8B 0%,#E879B9 50%,#A78BFA 100%)",
                  border: "3px solid #fff",
                  boxShadow: "0 6px 18px rgba(0,0,0,.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {initials}
              </div>
              <div style={{ ...ellipsis, fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{name}</div>
              <div style={{ ...ellipsis, fontSize: 12, color: "#5A5A5A", marginBottom: 10 }}>@{handle}</div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: "#E6F7EF",
                  border: "1px solid rgba(16,185,129,.25)",
                  marginBottom: 10,
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: 10, fontWeight: 500, color: "#059669" }}>Active now</span>
              </div>

              <p
                style={{
                  fontSize: 11.5,
                  lineHeight: 1.5,
                  color: "#5A5A5A",
                  textAlign: "center",
                  margin: "0 0 14px",
                  maxWidth: 200,
                }}
              >
                Travel &amp; lifestyle creator. New videos every Sunday.
              </p>

              <div style={{ display: "flex", gap: 16, marginBottom: 18, color: "#0A0A0A" }}>
                {EXAMPLE_SOCIALS.map((p) => (
                  <SocialIcon key={p} platform={p} size={17} />
                ))}
              </div>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 9 }}>
                {EXAMPLE_LINKS.map((label) => (
                  <div
                    key={label}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 999,
                      background: "#0A0A0A",
                      color: "#fff",
                      fontSize: 12.5,
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Home indicator */}
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 104,
                height: 4,
                borderRadius: 999,
                background: "#0A0A0A",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", height: 46, paddingTop: 2 }}>
      {/* Time and icons are each centred in the "ear" beside the Dynamic Island, like iOS */}
      <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>9:41</div>
      <div style={{ width: 86, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
        {/* Cellular */}
        <svg viewBox="0 0 18 12" width={17} height={11} fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* Wi-Fi */}
        <svg
          viewBox="-1 0 18 13"
          width={15}
          height={11}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M5.03 9.23A4.2 4.2 0 0 1 10.97 9.23" />
          <path d="M2.63 6.83A7.6 7.6 0 0 1 13.37 6.83" />
          <path d="M.22 4.42A11 11 0 0 1 15.78 4.42" />
          <circle cx="8" cy="11.4" r="1.3" fill="currentColor" stroke="none" />
        </svg>
        {/* Battery */}
        <svg viewBox="0 0 27 13" width={25} height={12}>
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" strokeOpacity=".35" />
          <rect x="2" y="2" width="17" height="9" rx="2.4" fill="currentColor" />
          <rect x="24.8" y="4.3" width="1.7" height="4.4" rx=".85" fill="currentColor" fillOpacity=".4" />
        </svg>
      </div>
    </div>
  );
}
