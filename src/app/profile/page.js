"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase.config";
import { getUserData, updateUserProfile } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import EditField from "@/components/EditField";
import ChangePassword from "@/components/ChangePassword";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        const data = await getUserData(auth.currentUser.uid);
        setUserData(data);
        setLoading(false);
      } else {
        router.push("/login");
      }
    };

    loadUserData();
  }, [router]);

  const handleUpdate = async (field, value) => {
    try {
      await updateUserProfile(auth.currentUser.uid, { [field]: value });
      setUserData(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="container">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray">
      <NavBar username={userData?.username} />
      <div className="flex justify-center py-8 px-4">
        <div
          className="bg-gray-800 rounded-lg shadow-xl p-8"
          style={{
            minWidth: "768px", // Ancho mínimo
            maxWidth: "85%",   // Ancho máximo relativo a la pantalla
          }}
        >
          <div className="border-b border-gray-700 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
            <p className="text-gray-400 mt-2">Gestiona tu información personal</p>
          </div>
    
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-300 mb-4">
                Información Personal
              </h2>
              <div className="profile-field">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                <EditField
                  value={userData?.nombre}
                  onSave={(value) => handleUpdate("nombre", value)}
                />
              </div>
              <div className="profile-field">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apellido
                </label>
                <EditField
                  value={userData?.apellido}
                  onSave={(value) => handleUpdate("apellido", value)}
                />
              </div>
            </div>
    
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-300 mb-4">
                Información de Cuenta
              </h2>
              <div className="profile-field">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de usuario
                </label>
                <EditField
                  value={userData?.username}
                  onSave={(value) => handleUpdate("username", value)}
                />
              </div>
              <div className="profile-field">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <EditField
                  value={userData?.email}
                  onSave={(value) => handleUpdate("email", value)}
                  type="email"
                />
              </div>
              <div className="profile-field">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <ChangePassword />
              </div>
            </div>
          </div>
    
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="bg-gray-700 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-300">
                Información adicional
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Cargo: {userData?.cargo} <br />
                Estado: {userData?.estadoUsuario}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}