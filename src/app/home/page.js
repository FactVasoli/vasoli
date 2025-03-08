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
          <div className="flex space-x-6 mt-8">
            {/* Contenedor de Categorías */}
            <div className="bg-gray-800 p-6 rounded-lg flex-1">
              <h2 className="text-xl font-bold text-gray-300 mb-4">Categorías</h2>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/categorias/sitios-nuevos" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sitios nuevos
                  </Link>
                  <Link 
                    href="/categorias/renegociacion" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Renegociación
                  </Link>
                  <Link 
                    href="/categorias/c13" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    C13
                  </Link>
                  <Link 
                    href="/categorias/bbnns" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Bienes nacionales
                  </Link>
                  <Link 
                    href="/categorias/das" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    DAS
                  </Link>
                </div>
                <hr className="border-gray-600" />
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/categorias/p-instalacion" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Permiso de instalación
                  </Link>
                  <Link 
                    href="/categorias/a-instalacion" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Aviso de instalación
                  </Link>
                  <Link 
                    href="/categorias/obra-menor" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Obra menor
                  </Link>
                  <Link 
                    href="/categorias/recepcion-obras" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Recepción de obras
                  </Link>
                </div>
                <hr className="border-gray-600" />
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/categorias/miscelaneos" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Misceláneos
                  </Link>
                </div>
              </div>
            </div>

            {/* Contenedores del lado derecho */}
            <div className="flex-1 space-y-6">
              {/* Contenedor derecho 1 "Buscador" */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-300 mb-4">Buscador</h2>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/busqueda/gestiones" 
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Gestiones
                    </Link>
                    <Link 
                      href="/busqueda/facturas" 
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Facturas
                    </Link>
                  </div>
                  <hr className="border-gray-600" />
                </div>
              </div>

              {/* Contenedor derecho 2 "Sin título 1" */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/busqueda/lista-gestiones" 
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Lista de gestiones
                    </Link>
                  </div>
                  <hr className="border-gray-600" />
                </div>
              </div>

              {/* Contenedor derecho 3 "Sin título 2" */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/dashboard" 
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Pizarra
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mb-4">La base de datos se ha inicializado correctamente.</p>
        )}
      </div>
    </div>
  );
}