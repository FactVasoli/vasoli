"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase.config";
import NavBar from "@/components/NavBar";
import useAuthAdmin from "@/hooks/useAuthAdmin";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [mostrarEliminados, setMostrarEliminados] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const router = useRouter();

  useAuthAdmin();

  const cargarClientes = async () => {
    const querySnapshot = await getDocs(collection(db, "Clientes"));
    const clientesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setClientes(clientesData);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombreCliente.trim()) return;

    await addDoc(collection(db, "Clientes"), {
      nombre: nombreCliente,
      createdAt: new Date()
    });

    setNombreCliente("");
    cargarClientes();
  };

  const handleEdit = (cliente) => {
    setEditandoCliente(cliente.id);
    setEditNombre(cliente.nombre);
  };

  const handleSaveEdit = async (id) => {
    const clienteRef = doc(db, "Clientes", id);
    await updateDoc(clienteRef, {
      nombre: editNombre,
      updatedAt: new Date()
    });
    setEditandoCliente(null);
    cargarClientes();
  };

  const handleBaja = async (id) => {
    const clienteRef = doc(db, "Clientes", id);
    await updateDoc(clienteRef, {
      baja: true,
      updatedAt: new Date()
    });
    cargarClientes();
  };

  return (
    <div>
      <NavBar />
      <div className="w-full px-4 py-8 flex">
        {/* Contenedor de ingreso de datos */}
        <div className="w-1/2 pr-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold mb-6">Clientes</h1>
            <button onClick={() => router.push("/administracion")} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Volver
            </button>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Agregar Nuevo Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                className="input w-full"
                required
              />
              <button type="submit" className="button">
                Agregar Cliente
              </button>
            </form>
          </div>
        </div>

        {/* Contenedor de lista de clientes */}
        <div className="w-1/2 pl-4">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Lista de Clientes</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mostrarEliminados"
                  checked={mostrarEliminados}
                  onChange={(e) => setMostrarEliminados(e.target.checked)}
                  className="form-checkbox"
                />
                <label htmlFor="mostrarEliminados" className="text-white">
                  Mostrar clientes eliminados
                </label>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-gray-300 text-left">
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes
                    .filter(cliente => mostrarEliminados || !cliente.baja)
                    .map(cliente => (
                      <tr key={cliente.id} className="text-gray-300 border-t border-gray-700">
                        <td className="px-4 py-2">
                          {editandoCliente === cliente.id ? (
                            <input
                              type="text"
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              className="input w-full"
                            />
                          ) : (
                            cliente.nombre
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editandoCliente === cliente.id ? (
                            <button
                              onClick={() => handleSaveEdit(cliente.id)}
                              className="text-green-500 hover:text-green-700 mr-2"
                            >
                              ✓
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(cliente)}
                              className="text-blue-500 hover:text-blue-700 mr-2"
                            >
                              ✎
                            </button>
                          )}
                          <button
                            onClick={() => handleBaja(cliente.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}