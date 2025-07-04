"use client";

import { useState, useEffect, useCallback } from "react";
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
    buscador: false,
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
        buscador: false,
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
        buscador: false,
      };
      newDropdownState[dropdown] = !prev[dropdown];
      return newDropdownState;
    });
  };

  const handleClickOutside = useCallback((event) => {
    if (
      !event.target.closest('.relative') &&
      !event.target.closest('.nav-link')
    ) {
      clearTimeout(closeTimeout);
      setShowDropdown((prevState) => {
        if (!prevState.categorias && !prevState.ingresar && !prevState.administracion && !prevState.usuario && !prevState.buscador) {
          return prevState;
        }
        return {
          categorias: false,
          ingresar: false,
          administracion: false,
          usuario: false,
          buscador: false,
        };
      });
    }
  }, [closeTimeout]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

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
                  <Link href="/categorias?categoria=Sitios nuevos" className="dropdown-item">Sitios nuevos</Link>
                  <Link href="/categorias?categoria=Renegociación" className="dropdown-item">Renegociación</Link>
                  <Link href="/categorias?categoria=C13" className="dropdown-item">C13</Link>
                  <Link href="/categorias?categoria=Bienes nacionales" className="dropdown-item">BBNNs</Link>
                  <Link href="/categorias?categoria=Permiso de instalación" className="dropdown-item">Permiso de Instalación</Link>
                  <Link href="/categorias?categoria=Aviso de instalación" className="dropdown-item">Aviso de Instalación</Link>
                  <Link href="/categorias?categoria=Recepción de obras" className="dropdown-item">Recepción de obras</Link>
                  <Link href="/categorias?categoria=Obra menor" className="dropdown-item">Obra menor</Link>
                  <Link href="/categorias?categoria=DAS" className="dropdown-item">DAS</Link>
                  <Link href="/categorias?categoria=Misceláneos" className="dropdown-item">Misceláneos</Link>
                </div>
              )}
            </div>

            <div className="relative"
              onMouseEnter={() => handleMouseEnter('buscador')}
              onMouseLeave={() => handleMouseLeave('buscador')}
            >
              <button className="nav-link" onClick={() => handleClick('buscador')}>
                Buscador
              </button>
              {showDropdown.buscador && (
                <div className="dropdown transition-all duration-300 ease-in-out">
                  <Link href="/busqueda/lista-gestiones" className="dropdown-item">Lista de Gestiones</Link>
                  <Link href="/busqueda/lista-facturas" className="dropdown-item">Lista de facturas</Link>
                  <Link href="/busqueda/oc-pendientes" className="dropdown-item">O/C pendientes</Link>
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