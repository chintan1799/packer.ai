import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "packer.ai — Carton Size Optimizer",
  description:
    "Stop guessing carton sizes. Enter your SKU dimensions and get standardized outer carton recommendations with exact packing layouts — in seconds.",
  keywords: ["carton sizing", "warehouse packing", "SKU optimization", "packaging"],
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
