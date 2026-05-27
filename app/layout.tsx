import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medallion Fence SEO Dashboard",
  description: "Premium real-time SEO and website performance reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
