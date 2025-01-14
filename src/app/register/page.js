"use client";

import { useState } from "react";
import { db } from "@/lib/firestore";
import { collection, addDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Validaciones
      if (!username || !password) {
        throw new Error("Todos los campos son obligatorios");
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Guardar en Firestore
      const usersCollection = collection(db, "Usuario");
      await addDoc(usersCollection, {
        username,
        password: hashedPassword,
        tipoUsuario: 1, // Por defecto: Gestor
      });

      setSuccess("Usuario registrado exitosamente");
      setUsername("");
      setPassword("");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Registro de Usuario</h1>
      <form onSubmit={handleRegister} style={styles.form}>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Registrar
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
  success: {
    color: "green",
  },
};
