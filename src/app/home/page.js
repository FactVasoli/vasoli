"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { auth } from "@/firebase.config";
import { getUserData } from "@/lib/auth";
import Link from "next/link";

export default function Home() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        const data = await getUserData(auth.currentUser.uid);
        setUserData(data);
      }
    };

    loadUserData();
  }, []);

  return (
    <div>
      <NavBar username={userData?.username} userRole={userData?.cargo} />
      <div className="container">
        <h1 className="text-2xl font-bold mb-4">
          ¡Bienvenido{userData ? `, ${userData.nombre} ${userData.apellido}` : ''}!
        </h1>
        
        {userData ? (
          <div className="space-y-6 mt-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-300 mb-4">
                Para agregar un sitio nuevo, ve a:
              </p>
              <Link 
                href="/sitios" 
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sitios
              </Link>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-300 mb-4">
                Para agregar una nueva gestión, ve a:
              </p>
              <Link 
                href="/gestiones" 
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Gestiones
              </Link>
            </div>

            {userData.cargo === "admin" && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <p className="text-gray-300 mb-4">
                  Para acceder al módulo de pruebas, ve a:
                </p>
                <Link 
                  href="/prueba" 
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Prueba
                </Link>
              </div>
            )}
          </div>
        ) : (
          <p className="mb-4">La base de datos se ha inicializado correctamente.</p>
        )}
      </div>
    </div>
  );
}