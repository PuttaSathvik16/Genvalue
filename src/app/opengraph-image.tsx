import { ImageResponse } from "next/og";

export const alt = "GenValue - AI Tools Mastery Program";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(145deg, #0D1B2A 0%, #050508 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#F59E0B",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          GenValue
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            fontWeight: 600,
            color: "#E2E8F0",
            textAlign: "center",
          }}
        >
          AI Tools Mastery Program
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            color: "#94A3B8",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          12 weeks · 40+ tools · Judgment-first AI training
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
