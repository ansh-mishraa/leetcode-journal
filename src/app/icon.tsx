import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon — dark tile so it reads in browser chrome. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#161B24",
          borderRadius: 8,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <path
            d="M27 11.2A11 11 0 1 0 27 28.8"
            stroke="#3B82F6"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="27" cy="11.2" r="2.2" fill="#F59E0B" />
          <path
            d="M13.2 20.6l5 5L30.2 13.2"
            stroke="#ECEEF2"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
