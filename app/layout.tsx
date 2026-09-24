import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "취향사이 — 덕질로 가까워지는 우리",
  description: "같은 취미를 가진 사람들이 기록을 나누고 친구가 되는 커뮤니티 중심 SNS",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}<Toaster position="top-center" richColors /></body></html>;
}
