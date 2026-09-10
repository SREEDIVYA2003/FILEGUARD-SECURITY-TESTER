import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ToastProvider } from "@/components/ui/toast";
import { CyberCursor } from "@/components/ui/cyber-cursor";

export const metadata: Metadata = {
  title: "FileGuard Security Tester | Safe Upload Security Dashboard",
  description: "Authorized file-upload security testing dashboard for safe static file inspection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060913] text-slate-100 min-h-screen flex font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <ToastProvider>
          <CyberCursor />
          <div className="flex w-full min-h-screen bg-grid-pattern relative">
            {/* Background Radial Glow */}
            <div className="fixed inset-0 bg-cyber-radial pointer-events-none z-0" />

            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 z-10">
              <Header />
              <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
                {children}
              </main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
