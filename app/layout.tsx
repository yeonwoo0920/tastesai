import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "취향사이 — 덕질로 가까워지는 우리",
  description: "영화·애니·아이돌·게임·책 등 좋아하는 작품과 최애를 중심으로 기록하고 덕친을 만나는 커뮤니티",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}<Toaster position="top-center" richColors /></body></html>;
}
