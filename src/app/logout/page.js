"use client";

import { useEffect, useState } from "react";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function LogoutPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    const logout = async () => {
      await logoutUser();
      
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    };

    logout();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/home");
    }
  }, [countdown, router]);

  return (
    <div className="container text-center">
      <h1 className="text-2xl font-bold mb-4">Cerrando sesión...</h1>
      <Spinner />
      <p className="mt-4">
        Has cerrado sesión exitosamente.
        <br />
        Serás redirigido a la página principal en {countdown} segundos.
      </p>
    </div>
  );
}