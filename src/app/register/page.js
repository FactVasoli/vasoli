"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import { validatePassword } from "@/lib/passwordValidation";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
  
    // Validar la contraseña
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
  
    try {
      await registerUser(email, password, username, nombre, apellido);
      setSuccess("Usuario registrado exitosamente.");
      // Redirigir a la página de registro pendiente sin iniciar sesión
      router.push("/registro/pendiente");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container">
        <h1>Registro</h1>
        <form onSubmit={handleRegister} className="form">
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="Nombre de Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            required
          />
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            required
          />
          <button type="submit" className="button">
            Registrar
          </button>
        </form>
        <p className="mt-4">
          ¿Ya tienes una cuenta? <Link href="/login" className="text-primary hover:underline">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}