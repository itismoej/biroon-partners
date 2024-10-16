import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "پنل مدیریت بیرون | همکاران",
  description: "مدیریت و پنل همکاران بیرون",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        dir="rtl"
        className={`${vazir.className} font-light bg-white text-black max-w-[500px] m-auto antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
