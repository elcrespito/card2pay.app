import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Card2pay — Payment links & card-to-crypto checkout",
  description:
    "Card2pay is an enterprise payment platform: create pay-by-links, share them, and receive card payments settled in crypto.",
  icons: { icon: "data:," },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
