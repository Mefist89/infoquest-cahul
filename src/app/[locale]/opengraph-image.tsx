import { ImageResponse } from "next/og";

export const alt = "InfoQuest digital safety education";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const subtitle = locale === "ro" ? "SCUTUL COMUNITĂȚII DIGITALE" : "ЩИТ ЦИФРОВОГО СООБЩЕСТВА";

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #020817 0%, #071b35 58%, #00101e 100%)",
        color: "#f7fbff",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 22, textAlign: "center" }}>
        <div style={{ alignItems: "center", border: "4px solid #00d9ff", borderRadius: 32, boxShadow: "0 0 55px rgba(0,217,255,.45)", display: "flex", height: 112, justifyContent: "center", width: 112 }}>
          <div style={{ border: "6px solid #00d9ff", borderRadius: "28px 28px 40px 40px", display: "flex", height: 64, width: 50 }} />
        </div>
        <div style={{ display: "flex", fontSize: 82, fontWeight: 800, letterSpacing: -3 }}>
          <span>INFO</span><span style={{ color: "#00d9ff" }}>QUEST</span>
        </div>
        <div style={{ color: "#94dfff", display: "flex", fontSize: 30, letterSpacing: 2 }}>
          {subtitle}
        </div>
      </div>
    </div>,
    size,
  );
}
