import "./globals.css";
import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoThai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-noto-thai", display: "swap" });

export const metadata: Metadata = {
  title: "thai-type — Thai touch typing trainer",
  description: "Learn Thai touch typing: lessons, free test, themes, and stats.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} ${notoThai.variable}`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
