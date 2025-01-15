"use client";

import { useEffect } from "react";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await logoutUser();
      router.push("/login"); // Redirigir al login
    };
    logout();
  }, [router]);

  return <h1>Cerrando sesión...</h1>;
}
