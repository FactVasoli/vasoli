"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NavBar({ username }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

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
        {username ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="nav-link"
            >
              {username}
            </button>
            {showDropdown && (
              <div className="dropdown">
                <button className="dropdown-item">Mi perfil</button>
                <button onClick={handleLogout} className="dropdown-item">
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
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