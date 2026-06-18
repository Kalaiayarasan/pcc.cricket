import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PCC - Pungampatti Cricket Club",
  description: "Live tournament scoring and updates for Pungampatti Cricket Club",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
