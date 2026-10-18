import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naturally Decadent | Cakes in Guelph",
  description: "Four dairy-free cake recipes, made without refined sugar. Share a non-binding mock preorder for our Guelph venture experiment.",
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
