import { ImageResponse } from "next/og";

export const alt = "Metadata — Free On-Page SEO Analyzer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "78px 92px",
        background: "linear-gradient(135deg, #f3f7ff 0%, #ffffff 66%, #e8f1ff 100%)",
        color: "#101c34",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#2563eb", fontSize: 28, fontWeight: 700 }}>
        <div style={{ width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: "#2563eb", color: "white", fontSize: 25 }}>M</div>
        Metadata <span style={{ color: "#70809a", fontSize: 18, fontWeight: 500 }}>by NivishDigital</span>
      </div>
      <div style={{ marginTop: 42, fontSize: 68, lineHeight: 1.08, fontWeight: 700, letterSpacing: -3 }}>Free On-Page SEO Analyzer</div>
      <div style={{ maxWidth: 850, marginTop: 24, color: "#60718a", fontSize: 28, lineHeight: 1.4 }}>
        Check titles, meta descriptions, headings, links, images, and technical SEO.
      </div>
      <div style={{ position: "absolute", bottom: 52, color: "#2563eb", fontSize: 20 }}>metadata.nivishdigital.com</div>
    </div>,
    size,
  );
}
