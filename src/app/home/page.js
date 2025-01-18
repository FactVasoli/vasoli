"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { auth } from "@/firebase.config";
import { getUserData } from "@/lib/auth";

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
      <NavBar username={userData?.username} />
      <div className="container">
        <h1 className="text-2xl font-bold mb-4">
          ¡Bienvenido{userData ? `, ${userData.nombre} ${userData.apellido}` : ''}!
        </h1>
        <p className="mb-4">La base de datos se ha inicializado correctamente.</p>
      </div>
    </div>
  );
}