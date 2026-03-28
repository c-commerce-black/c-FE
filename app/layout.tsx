import type { Metadata } from "next";
import "./globals.css";

import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { AuthStoreHydrator } from "@/components/providers/auth-store-hydrator";
import { SplashOverlay } from "@/components/providers/splash-overlay";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "C-commerce",
    template: "%s | C-commerce",
  },
  description: "유통기한 임박 상품을 더 빠르게 발견하고 더 합리적으로 구매하는 커머스 플랫폼",
  applicationName: "C-commerce",
  keywords: ["C-commerce", "임박특가", "커머스", "유통기한 임박", "할인"],
  openGraph: {
    title: "C-commerce",
    description:
      "유통기한 임박 상품을 더 빠르게 발견하고 더 합리적으로 구매하는 커머스 플랫폼",
    url: env.siteUrl,
    siteName: "C-commerce",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "C-commerce",
    description:
      "유통기한 임박 상품을 더 빠르게 발견하고 더 합리적으로 구매하는 커머스 플랫폼",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="ko"
      className="h-full bg-background antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthStoreHydrator user={user} />
        <SplashOverlay />
        {children}
      </body>
    </html>
  );
}
