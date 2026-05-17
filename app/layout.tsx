import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TitleBar } from "./components/TitleBar";
import { AtmosphereLayer } from "./components/AtmosphereLayer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://serve-web.tech';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "SERVE — not a tool. a room.",
  description: "An anti-utility AI interface for deep, unstructured, local-first reflection. No chat bubbles. No assistant theater. A thinking environment.",
  keywords: ["SERVE", "local-first AI", "reflection", "deep work", "open source"],
  authors: [{ name: "@jip7e" }],
  alternates: { canonical: '/' },
  openGraph: {
    title: "SERVE — not a tool. a room.",
    description: "An anti-utility AI interface for deep, unstructured, local-first reflection.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SERVE" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SERVE — not a tool. a room.",
    description: "Built like a room, not a tool.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0C0D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-[#0C0C0D] text-[#EDE8DF] min-h-[100dvh] overflow-x-hidden"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#EDE8DF] focus:text-[#0C0C0D] focus:px-3 focus:py-2 focus:text-xs focus:rounded">
          Skip to content
        </a>
        <div className="atmosphere-layer" id="atmosphere-layer" aria-hidden="true" />
        <AtmosphereLayer />
        <TitleBar />
        <div id="main-content" role="main">
          {children}
        </div>
      </body>
    </html>
  );
}
