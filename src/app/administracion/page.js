"use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function AdministracionPage() {
  return (
    <div>
      <NavBar />
      <div className="w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gestión de Usuarios */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Gestión de Usuarios</h2>
            <p className="text-gray-300 mb-4">
              Administra los usuarios del sistema, sus estados y cargos.
            </p>
            <Link 
              href="/administracion/usuarios" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Gestionar Usuarios
            </Link>
          </div>

          {/* Gestión de Clientes */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Gestión de Clientes</h2>
            <p className="text-gray-300 mb-4">
              Administra el registro de clientes del sistema.
            </p>
            <Link 
              href="/administracion/clientes" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Gestionar Clientes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}