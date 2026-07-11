import { ImageResponse } from "next/og";

export const alt = "QUIRK — AI toolkit for content creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        {/* Decorative grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Top: logo mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              backdropFilter: "blur(10px)",
            }}
          >
            Q
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>QUIRK</div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            <div>Find your quirk.</div>
            <div>Ship it.</div>
          </div>
        </div>

        {/* Bottom: tagline + features */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
          }}
        >
          <div style={{ fontSize: 28, opacity: 0.85, fontWeight: 500 }}>
            The AI-native workspace for creators who'd rather create than juggle 5 tools.
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["Script Studio", "Idea Engine", "Thumbnail Tester"].map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  fontSize: 18,
                  fontWeight: 600,
                  backdropFilter: "blur(10px)",
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
