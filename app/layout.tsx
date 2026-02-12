import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SERVE — AI that sees patterns",
  description: "A quiet space for conversations that matter. SERVE speaks with earned authority — pattern recognition, parables, and the hard questions beneath the surface.",
  keywords: ["AI", "chat", "minimalist", "conversational AI", "SERVE"],
  authors: [{ name: "SERVE" }],
  openGraph: {
    title: "SERVE — AI that sees patterns",
    description: "A quiet space for conversations that matter.",
    type: "website",
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
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
