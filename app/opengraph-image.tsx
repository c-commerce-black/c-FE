import { ImageResponse } from "next/og";
import { getLogoDataUrl } from "@/lib/branding.server";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoDataUrl = await getLogoDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 56,
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at 10% 10%, rgba(255,105,180,0.18), transparent 22%), linear-gradient(180deg, #fffdfd 0%, #f6f8fc 100%)",
          color: "#111827",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 112,
            height: 112,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 32,
            background: "#ffffff",
            boxShadow: "0 14px 32px rgba(17,24,39,0.08)",
          }}
        >
          <img
            src={logoDataUrl}
            alt="C-commerce 로고"
            width={88}
            height={88}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "-0.05em",
            }}
          >
            C-commerce
          </div>
          <div
            style={{
              maxWidth: 760,
              fontSize: 30,
              lineHeight: 1.35,
              color: "#667085",
            }}
          >
            Discover expiry-soon deals faster and convert them into smarter
            purchases.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
