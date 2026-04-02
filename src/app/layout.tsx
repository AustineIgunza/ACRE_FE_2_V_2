import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn Forge Learning Platform",
  description: "An engaging, fun learning platform featuring the Learn Forge design system",
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
