import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DaVinci",
  description: "From customer message to field action.",
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
