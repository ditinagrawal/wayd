import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Where Analytics Yield Decisions",
  description:
    "No clutter, no confusing dashboards — just clean insights, meaningful metrics, and the data you need to ship better products.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rubik.className} antialiased`}>
        <NextTopLoader color="#611c69" showSpinner={false} />
        <Toaster />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
