"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";

export default function Home() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkUsername = () => {
      const storedUsername = localStorage.getItem('username');
      setUsername(storedUsername || "");
    };

    checkUsername();
    window.addEventListener('storage', checkUsername);

    return () => window.removeEventListener('storage', checkUsername);
  }, []);

  return (
    <div>
      <NavBar username={username} />
      <div className="container">
        <h1 className="text-2xl font-bold mb-4">Página de Inicio</h1>
        <p className="mb-4">¡Bienvenido! La base de datos se ha inicializado correctamente.</p>
      </div>
    </div>
  );
}