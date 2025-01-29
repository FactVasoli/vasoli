"use client";

import { useRouter } from "next/navigation";

export default function RegistroPendientePage() {
  const router = useRouter();

  return (
    <div className="container text-center">
      <h1 className="text-2xl font-bold mb-4">Registro Pendiente de Verificación</h1>
      <div className="mb-8">
        <p className="mb-4">
          Tu registro ha sido recibido exitosamente. Sin embargo, antes de poder acceder al sistema,
          tus datos deben ser verificados por el administrador.
        </p>
        <p className="mb-4">
          Recibirás un correo electrónico cuando tu cuenta haya sido habilitada para acceder al sistema.
        </p>
      </div>
      <button
        onClick={() => router.push("/home")}
        className="button"
      >
        Volver al Inicio
      </button>
    </div>
  );
}