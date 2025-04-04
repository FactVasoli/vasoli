"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { auth } from "@/firebase.config";
import { getUserData } from "@/lib/auth";
import Link from "next/link";
import DesarrolloModal from "@/components/DesarrolloModal";

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDesarrolloModal, setShowDesarrolloModal] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative min-h-screen">
      <NavBar username={userData?.username} userRole={userData?.cargo} />
      <div className="container pb-16">
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <>
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
                        <Link 
                          href="/busqueda/lista-facturas" 
                          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Lista de facturas
                        </Link>
                        <Link 
                          href="/busqueda/oc-pendientes" 
                          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          O/C pendientes
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
              <p>La base de datos se ha inicializado correctamente.</p>
            )}
          </>
        )}
      </div>
      
      {/* Botón En desarrollo */}
      <div className="fixed bottom-4 left-4">
        <button
          onClick={() => setShowDesarrolloModal(true)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          En desarrollo
        </button>
      </div>

      {/* Modal de desarrollo */}
      <DesarrolloModal 
        isOpen={showDesarrolloModal}
        onClose={() => setShowDesarrolloModal(false)}
      />
    </div>
  );
}