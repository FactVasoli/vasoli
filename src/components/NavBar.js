"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/firebase.config";
import { getUserData } from "@/lib/auth";

export default function NavBar() {
  const [showDropdown, setShowDropdown] = useState({
    categorias: false,
    ingresar: false,
    administracion: false,
    usuario: false,
  });
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const [closeTimeout, setCloseTimeout] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    setShowDropdown({ ...showDropdown, usuario: false });
    router.push("/logout");
  };

  const handleMouseEnter = (dropdown) => {
    clearTimeout(closeTimeout);
    setShowDropdown(() => {
      const newDropdownState = {
        categorias: false,
        ingresar: false,
        administracion: false,
        usuario: false,
      };
      newDropdownState[dropdown] = true;
      return newDropdownState;
    });
  };

  const handleMouseLeave = (dropdown) => {
    const timeout = setTimeout(() => {
      setShowDropdown((prev) => ({ ...prev, [dropdown]: false }));
    }, 500);
    setCloseTimeout(timeout);
  };

  const handleClick = (dropdown) => {
    clearTimeout(closeTimeout);
    setShowDropdown((prev) => {
      const newDropdownState = {
        categorias: false,
        ingresar: false,
        administracion: false,
        usuario: false,
      };
      newDropdownState[dropdown] = !prev[dropdown];
      return newDropdownState;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest('.relative') &&
        !event.target.closest('.nav-link')
      ) {
        clearTimeout(closeTimeout);
        setShowDropdown({
          categorias: false,
          ingresar: false,
          administracion: false,
          usuario: false,
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeTimeout]);

  return (
    <nav className="nav">
      <Link href="/home" className="nav-brand hover:opacity-80">
        Gestión Vasoli
      </Link>
      <div className="nav-links">
        {userData ? (
          <>
            <div className="relative"
              onMouseEnter={() => handleMouseEnter('categorias')}
              onMouseLeave={() => handleMouseLeave('categorias')}
            >
              <button className="nav-link" onClick={() => handleClick('categorias')}>
                Categorías
              </button>
              {showDropdown.categorias && (
                <div className="dropdown transition-all duration-300 ease-in-out">
                  <Link href="/categorias/sitios-nuevos" className="dropdown-item">Sitios nuevos</Link>
                  <Link href="/categorias/renegociacion" className="dropdown-item">Renegociación</Link>
                  <Link href="/categorias/c13" className="dropdown-item">C13</Link>
                  <Link href="/categorias/bbnns" className="dropdown-item">BBNNs</Link>
                  <Link href="/categorias/p-instalacion" className="dropdown-item">Permiso de Instalación</Link>
                  <Link href="/categorias/a-instalacion" className="dropdown-item">Aviso de Instalación</Link>
                  <Link href="/categorias/recepcion-obras" className="dropdown-item">Recepción de obras</Link>
                  <Link href="/categorias/obra-menor" className="dropdown-item">Obra menor</Link>
                  <Link href="/categorias/das" className="dropdown-item">DAS</Link>
                  <Link href="/categorias/miscelaneos" className="dropdown-item">Misceláneos</Link>
                </div>
              )}
            </div>

            <div className="relative"
              onMouseEnter={() => handleMouseEnter('ingresar')}
              onMouseLeave={() => handleMouseLeave('ingresar')}
            >
              <button className="nav-link" onClick={() => handleClick('ingresar')}>
                Ingresar
              </button>
              {showDropdown.ingresar && (
                <div className="dropdown transition-all duration-300 ease-in-out">
                  <Link href="/sitios" className="dropdown-item">Sitios</Link>
                  <Link href="/gestiones" className="dropdown-item">Gestiones</Link>
                  {userData.cargo === "admin" && (
                    <Link href="/facturas" className="dropdown-item">Facturas</Link>
                  )}
                </div>
              )}
            </div>

            {userData.cargo === "admin" && (
              <div className="relative"
                onMouseEnter={() => handleMouseEnter('administracion')}
                onMouseLeave={() => handleMouseLeave('administracion')}
              >
                <button className="nav-link" onClick={() => handleClick('administracion')}>
                  Administración
                </button>
                {showDropdown.administracion && (
                  <div className="dropdown transition-all duration-300 ease-in-out">
                    <Link href="/administracion/usuarios" className="dropdown-item">Usuarios</Link>
                    <Link href="/administracion/clientes" className="dropdown-item">Clientes</Link>
                    <Link href="/administracion/gestores" className="dropdown-item">Gestores</Link>
                    <Link href="/administracion" className="dropdown-item">Ir a Administración</Link>
                  </div>
                )}
              </div>
            )}

            <div className="relative"
              onMouseEnter={() => handleMouseEnter('usuario')}
              onMouseLeave={() => handleMouseLeave('usuario')}
            >
              <button
                onClick={() => handleClick('usuario')}
                className="nav-link"
              >
                {userData.username}
              </button>
              {showDropdown.usuario && (
                <div className="dropdown transition-all duration-300 ease-in-out">
                  <Link href="/profile" className="dropdown-item">Mi perfil</Link>
                  <button onClick={handleLogout} className="dropdown-item">Cerrar sesión</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link">Iniciar sesión</Link>
            <Link href="/register" className="nav-link">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}