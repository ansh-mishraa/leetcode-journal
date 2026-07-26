import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KeepSolved — Solve it once. Still know it on interview day.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0E1117",
          color: "#ECEEF2",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#12151C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M27 11.2A11 11 0 1 0 27 28.8"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="27" cy="11.2" r="2" fill="#F59E0B" />
              <path
                d="M13.2 20.6l5 5L30.2 13.2"
                stroke="#ECEEF2"
                strokeWidth="3.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
            KeepSolved
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: -1.5,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Solve it once. Still know it on interview day.
          </div>
          <div style={{ fontSize: 26, color: "#8B919C", maxWidth: 720 }}>
            Pattern triggers · graded recall · mastery curve
          </div>
        </div>

        <div
          style={{
            display: "flex",
            height: 6,
            width: "100%",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1, background: "#10B981" }} />
          <div style={{ flex: 1, background: "#3B82F6" }} />
          <div style={{ flex: 1, background: "#F59E0B" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
