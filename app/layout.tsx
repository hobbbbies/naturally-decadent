import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naturally Decadent | Cakes in Guelph",
  description: "Four creamy, dairy-free cake flavours in Guelph, made without refined sugar. Preorder your favourite slices from Naturally Decadent.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/assets/favicon.svg",
    shortcut: "/assets/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <body>{children}</body>
    </html>
  );
}
