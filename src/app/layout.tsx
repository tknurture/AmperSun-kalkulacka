import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "AmperSun – Kalkulačka zakázek",
  description: "Interní nástroj pro nacenění zakázek a generování nabídek",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="h-full">
      <body className="h-full bg-[#f8f9fb] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
