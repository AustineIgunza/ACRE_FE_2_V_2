import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARCÉ Learning Platform",
  description: "An engaging, fun learning platform featuring the ARCÉ learning system",
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
      </body>
    </html>
  );
}
