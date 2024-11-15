import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const vazir = Vazirmatn({ subsets: ["latin"], variable: "--font-vazir" });

export const metadata: Metadata = {
  title: "همکاران | پنل مدیریت بیرون",
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
        className={`${vazir.variable} font-sans font-light bg-white text-black max-w-[500px] m-auto`}
        dir="rtl"
      >
        {children}
        <Toaster containerClassName="!top-[65px] !bottom-[78px]" />
      </body>
    </html>
  );
}
