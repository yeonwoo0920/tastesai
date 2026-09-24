import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "취향사이 — 덕질로 가까워지는 우리",
  description: "영화·애니·아이돌·게임·책 등 좋아하는 작품과 최애를 중심으로 기록하고 덕친을 만나는 커뮤니티",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ambientInit=`(()=>{try{const d=new Date(),n=d.getHours()*60+d.getMinutes(),tm=localStorage.getItem("chwihyang-ambient-time")||"auto",wm=localStorage.getItem("chwihyang-ambient-weather")||"auto";let t=tm==="auto"?(n>=330&&n<660?"morning":n>=660&&n<1020?"day":n>=1020&&n<1200?"sunset":"night"):tm,w=wm==="auto"?"clear":wm;if(wm==="auto"){const c=JSON.parse(localStorage.getItem("chwihyang-weather-cache")||"null");if(c&&c.kind&&c.at&&Date.now()-c.at<1800000)w=c.kind}document.documentElement.dataset.ambientTime=t;document.documentElement.dataset.ambientWeather=w}catch{document.documentElement.dataset.ambientTime="day";document.documentElement.dataset.ambientWeather="clear"}})()`;
  return <html lang="ko" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:ambientInit}}/></head><body>{children}<Toaster position="top-center" richColors /></body></html>;
}
