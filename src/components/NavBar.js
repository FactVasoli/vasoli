"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/firebase.config";
import { getUserData } from "@/lib/auth";

export default function NavBar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

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
    setShowDropdown(false);
    router.push("/logout");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <nav className="nav">
      <Link href="/home" className="nav-brand hover:opacity-80">
        Gestión Vasoli
      </Link>
      <div className="nav-links">
        {userData ? (
          <>
            <Link href="/sitios" className="nav-link">Sitios</Link>
            <Link href="/gestiones" className="nav-link">Gestiones</Link>
            {userData.cargo === "admin" && (
              <Link href="/administracion" className="nav-link">Administración</Link>
            )}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="nav-link"
              >
                {userData.username}
              </button>
              {showDropdown && (
                <div className="dropdown">
                  <Link href="/profile" className="dropdown-item">
                    Mi perfil
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link">Iniciar sesión</Link>
            <Link href="/register" className="nav-link">Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
}