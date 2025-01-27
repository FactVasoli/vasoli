"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase.config";
import NavBar from "@/components/NavBar";
import { useRouter } from "next/navigation";
import useAuthAdmin from "@/hooks/useAuthAdmin";

export default function GestoresPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    sigla: ""
  });
  const [gestores, setGestores] = useState([]);
  const [editandoGestor, setEditandoGestor] = useState(null);
  const [mostrarEliminados, setMostrarEliminados] = useState(false);
  const router = useRouter();

  useAuthAdmin();

  const cargarGestores = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "Gestores"));
    const gestoresData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtrar gestores según el estado de baja
    const filteredGestores = mostrarEliminados ? gestoresData : gestoresData.filter(gestor => !gestor.baja);
    setGestores(filteredGestores);
  }, [mostrarEliminados]);

  useEffect(() => {
    cargarGestores();
  }, [mostrarEliminados, cargarGestores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await addDoc(collection(db, "Gestores"), {
      nombre: formData.nombre,
      apellido: formData.apellido,
      sigla: formData.sigla
    });

    setFormData({ nombre: "", apellido: "", sigla: "" });
    cargarGestores();
  };

  const handleEdit = (gestor) => {
    setEditandoGestor(gestor.id);
    setFormData({ nombre: gestor.nombre, apellido: gestor.apellido, sigla: gestor.sigla });
  };

  const handleSaveEdit = async () => {
    const gestorRef = doc(db, "Gestores", editandoGestor);
    await updateDoc(gestorRef, {
      nombre: formData.nombre,
      apellido: formData.apellido,
      sigla: formData.sigla
    });
    setEditandoGestor(null);
    cargarGestores();
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que deseas dar de baja a este gestor?")) {
      const gestorRef = doc(db, "Gestores", id);
      await updateDoc(gestorRef, {
        baja: true
      });
      cargarGestores();
    }
  };

  const handleToggleMostrarEliminados = () => {
    setMostrarEliminados(!mostrarEliminados);
  };

  return (
    <div>
      <NavBar />
      <div className="w-full px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-6">Agregar Gestor</h1>
          <button onClick={() => router.push("/administracion")} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            Volver
          </button>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nombre del Gestor"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Apellido(s) del Gestor"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Sigla"
                value={formData.sigla}
                onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                className="input"
              />
              <button type="submit" className="button w-full">
                Guardar Gestor
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={mostrarEliminados}
            onChange={handleToggleMostrarEliminados}
            className="mr-2"
          />
          <label className="text-white">Mostrar gestores eliminados</label>
        </div>

        {/* Lista de Gestores */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Lista de Gestores</h2>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-gray-300 text-left">
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Apellido(s)</th>
                <th className="px-4 py-2">Sigla</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gestores.map(gestor => (
                <tr key={gestor.id} className="text-gray-300 border-t border-gray-700">
                  <td className="px-4 py-2">
                    {editandoGestor === gestor.id ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="input"
                      />
                    ) : (
                      gestor.nombre
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editandoGestor === gestor.id ? (
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className="input"
                      />
                    ) : (
                      gestor.apellido
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editandoGestor === gestor.id ? (
                      <input
                        type="text"
                        value={formData.sigla}
                        onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                        className="input"
                      />
                    ) : (
                      gestor.sigla
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editandoGestor === gestor.id ? (
                      <div className="flex space-x-2">
                        <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-700">
                          ✓
                        </button>
                        <button onClick={() => setEditandoGestor(null)} className="text-red-500 hover:text-red-700">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(gestor)} className="text-blue-500 hover:text-blue-700">
                          ✎
                        </button>
                        <button onClick={() => handleDelete(gestor.id)} className="text-red-500 hover:text-red-700">
                          🗑
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
