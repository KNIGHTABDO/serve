import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TitleBar } from "./components/TitleBar";
import { AtmosphereLayer } from "./components/AtmosphereLayer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://serve.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "SERVE — AI that sees patterns",
  description: "A quiet space for conversations that matter. SERVE speaks with earned authority — pattern recognition, parables, and the hard questions beneath the surface.",
  keywords: ["AI", "chat", "minimalist", "conversational AI", "SERVE"],
  authors: [{ name: "SERVE" }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SERVE — AI that sees patterns",
    description: "A quiet space for conversations that matter.",
    type: "website",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "SERVE — AI that sees patterns",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SERVE — AI that sees patterns",
    description: "A quiet space for conversations that matter.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased bg-black text-white flex flex-col h-screen overflow-hidden"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:text-xs focus:rounded">
          Skip to content
        </a>
        <div className="atmosphere-layer" id="atmosphere-layer" aria-hidden="true" />
        <AtmosphereLayer />
        <TitleBar />
        <div id="main-content" className="flex-1 overflow-hidden" role="main">
          {children}
        </div>
      </body>
    </html>
  );
}

