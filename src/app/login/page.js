"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginUser(email, password);
      router.push("/home"); // Redirigir al dashboard
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Inicio de Sesión</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Iniciar Sesión</button>
      </form>
    </div>
  );
}
const styles = {
  container: { maxWidth: "400px", margin: "0 auto", padding: "20px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { padding: "10px", fontSize: "16px", color: "#fff", backgroundColor: "#007bff", border: "none", borderRadius: "5px", cursor: "pointer" },
  error: { color: "red" },
  success: { color: "green" },
};
