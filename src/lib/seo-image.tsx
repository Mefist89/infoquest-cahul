import { ImageResponse } from "next/og";

export function renderSeoImage(title: string) {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "linear-gradient(135deg, #020817, #071b35)", color: "#f7fbff", width: "100%", height: "100%", padding: 80 }}>
      <div style={{ display: "flex", color: "#00d9ff", fontSize: 42, fontWeight: 800, marginBottom: 38 }}>INFOQUEST</div>
      <div style={{ display: "flex", fontSize: 58, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
    </div>,
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
