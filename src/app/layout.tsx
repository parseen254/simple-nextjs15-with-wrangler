import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NextAuthProvider } from "@/components/common/providers";
import { Navbar } from "@/components/common/navbar";
import { auth } from "@/lib/auth";
import { DevPreview } from "@/components/dev/dev-preview";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple todo app with authentication",
};

// Loading state for the navbar
function NavbarFallback() {
  return (
    <div className="w-full border-b py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-20 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the initial session state from the server
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <NextAuthProvider>
          <Suspense fallback={<NavbarFallback />}>
            <Navbar user={session?.user} />
          </Suspense>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <DevPreview />
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}
