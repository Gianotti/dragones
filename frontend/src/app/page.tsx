"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();
    if (role === "admin") router.replace("/admin");
    else if (role === "landing") router.replace("/landing");
    else router.replace("/login");
  }, [router]);

  return null;
}
