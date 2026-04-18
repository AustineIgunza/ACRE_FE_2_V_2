import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/UI/Toast";

export const metadata: Metadata = {
  title: "ARCÉ Learning Platform",
  description: "An engaging, fun learning platform featuring the ARCÉ design system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
