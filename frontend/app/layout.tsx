import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Connecta - Travel eSIM plan finder",
  description: "Travel eSIM recommendations, plan comparison, and setup guidance."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
