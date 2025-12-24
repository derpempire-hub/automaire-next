import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Automaire - Automation Agency",
  description: "Custom websites, AI automation, and intelligent agents for modern businesses.",
  authors: [{ name: "Automaire" }],
  openGraph: {
    title: "Automaire - Automation Agency",
    description: "Custom websites, AI automation, and intelligent agents for modern businesses.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Automaire",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
