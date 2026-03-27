import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

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
      <body className="h-full flex bg-[#f8f9fb] antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
