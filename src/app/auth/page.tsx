"use client";

import { Auth } from "@/app/auth/Auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  return <Auth onAuth={() => router.push("/")} />;
}
