"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase.config";
import NavBar from "@/components/NavBar";
import { useRouter } from "next/navigation";
import useAuthAdmin from "@/hooks/useAuthAdmin";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [editForm, setEditForm] = useState({
    estadoUsuario: "",
    cargo: ""
  });
  const router = useRouter();

  useAuthAdmin();

  const cargarUsuarios = async () => {
    const querySnapshot = await getDocs(collection(db, "Usuarios"));
    const usuariosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsuarios(usuariosData);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const iniciarEdicion = (usuario) => {
    setEditandoUsuario(usuario.id);
    setEditForm({
      estadoUsuario: usuario.estadoUsuario,
      cargo: usuario.cargo
    });
  };

  const cancelarEdicion = () => {
    setEditandoUsuario(null);
    setEditForm({
      estadoUsuario: "",
      cargo: ""
    });
  };

  const handleUpdateUsuario = async () => {
    if (!editandoUsuario) return;
    
    const usuarioRef = doc(db, "Usuarios", editandoUsuario);
    await updateDoc(usuarioRef, {
      estadoUsuario: editForm.estadoUsuario,
      cargo: editForm.cargo,
      updatedAt: new Date()
    });
    
    setEditandoUsuario(null);
    cargarUsuarios();
  };

  return (
    <div>
      <NavBar />
      <div className="w-full px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
          <button onClick={() => router.push("/administracion")} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Volver
          </button>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-gray-300 text-left">
                  <th className="px-4 py-2">Usuario</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Cargo</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id} className="text-gray-300 border-t border-gray-700">
                    <td className="px-4 py-2">{usuario.username}</td>
                    <td className="px-4 py-2">{usuario.email}</td>
                    <td className="px-4 py-2">
                      {editandoUsuario === usuario.id ? (
                        <select
                          value={editForm.estadoUsuario}
                          onChange={(e) => setEditForm({...editForm, estadoUsuario: e.target.value})}
                          className="bg-gray-700 text-white rounded px-2 py-1"
                        >
                          <option value="Activo">Activo</option>
                          <option value="De baja">De baja</option>
                        </select>
                      ) : (
                        usuario.estadoUsuario
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editandoUsuario === usuario.id ? (
                        <select
                          value={editForm.cargo}
                          onChange={(e) => setEditForm({...editForm, cargo: e.target.value})}
                          className="bg-gray-700 text-white rounded px-2 py-1"
                        >
                          <option value="gestor">Gestor</option>
                          <option value="admin">Admin</option>
                          <option value="arquitecto">Arquitecto</option>
                        </select>
                      ) : (
                        usuario.cargo
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editandoUsuario === usuario.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateUsuario}
                            className="text-green-500 hover:text-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => iniciarEdicion(usuario)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ✎
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}