"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase.config";
import NavBar from "@/components/NavBar";
import ListadorGestiones2 from "@/components/ListadorGestiones2";
import BuscadorGestiones from "@/components/BuscadorGestiones";

export default function OCPendientes() {
  const [gestionesFiltradasBase, setGestionesFiltradasBase] = useState([]);
  const [filteredGestiones, setFilteredGestiones] = useState([]);

  useEffect(() => {
    // Suscripción en tiempo real a la colección de gestiones
    const unsubscribe = onSnapshot(collection(db, "Gestiones"), (querySnapshot) => {
      const gestionesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Solo gestiones sin OC y con estado válido
      const base = gestionesData.filter(gestion =>
        (!gestion.numeroOC || gestion.numeroOC === "") &&
        (gestion.estadoOC === "Gestión en trámite" || gestion.estadoOC === "Terminado sin facturar")
      );
      setGestionesFiltradasBase(base);
    });
    return () => unsubscribe();
  }, []);

  // Cuando cambian las gestiones base, inicializa el filtro con todas
  useEffect(() => {
    setFilteredGestiones(gestionesFiltradasBase);
  }, [gestionesFiltradasBase]);

  return (
    <div>
      <NavBar />
      <main className="w-full px-4 py-8 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-4">Órdenes de Compra Pendientes</h1>
        <BuscadorGestiones
          gestiones={gestionesFiltradasBase}
          onFilter={setFilteredGestiones}
          modoOCPendientes={true}
        />
        <ListadorGestiones2
          gestiones={filteredGestiones}
          modoOCPendientes={true}
        />
      </main>
    </div>
  );
} 