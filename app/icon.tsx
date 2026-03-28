import { ImageResponse } from "next/og";
import { getLogoDataUrl } from "@/lib/shared/branding/server";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default async function Icon() {
  const logoDataUrl = await getLogoDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        <img
          src={logoDataUrl}
          alt="C-commerce 로고"
          width={56}
          height={56}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size,
  );
}
