import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "thai-type",
  description: "Thai touch typing trainer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
