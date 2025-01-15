"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await loginUser(email, password);
      // Aquí deberías obtener el username del usuario desde Firestore
      localStorage.setItem('username', user.email); // Por ahora usamos el email como username
      router.push("/home");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container">
        <h1>Inicio de Sesión</h1>
        <form onSubmit={handleLogin} className="form">
          {error && <p className="error">{error}</p>}
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <button type="submit" className="button">
            Iniciar Sesión
          </button>
        </form>
        <p className="mt-4">
          ¿No tienes una cuenta? <Link href="/register" className="text-primary hover:underline">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}