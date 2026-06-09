import type { Metadata } from "next";
import "./globals.css";
import { FloatingChat } from "@/components/FloatingChat";

export const metadata: Metadata = {
  title: "Connecta - Travel eSIM plan finder",
  description: "Find clear travel eSIM plans by destination, dates, and data needs."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <FloatingChat />
      </body>
    </html>
  );
}
