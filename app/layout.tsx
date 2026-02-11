import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/shared/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gig-a-bit",
  description: "Hyperlocal event hosting and discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
