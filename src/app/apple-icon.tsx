import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#12151C",
          borderRadius: 40,
        }}
      >
        <svg width="110" height="110" viewBox="0 0 40 40">
          <path
            d="M28.5 14.5c2.8 2.2 3.6 5.8 1.8 8.8"
            stroke="#3B82F6"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M31.8 12.2l-1.2 4.2 4.1-.9"
            stroke="#10B981"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M12 20.2l5.1 5.1L28 13.8"
            stroke="#F4F3F1"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
