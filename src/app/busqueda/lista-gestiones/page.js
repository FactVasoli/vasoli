'use client'; // Marca este archivo como un componente del lado del cliente

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/firebase.config";
import NavBar from "@/components/NavBar";
import BuscadorGestiones from "@/components/BuscadorGestiones"; // Importamos el buscador
import ListadorGestiones2 from "@/components/ListadorGestiones2";
import { useRouter } from "next/navigation";

export default function ListaGestionesPage() {
  const [gestiones, setGestiones] = useState([]);
  const [filteredGestiones, setFilteredGestiones] = useState([]); // Estado para gestiones filtradas

  const router = useRouter();

  // Función para obtener las fechas de facturación
  const obtenerFechasFacturacion = async (codigoSitio, numeroOC) => {
    const facturasRef = collection(db, "Facturas");
    const q = query(facturasRef, where("codigoSitio", "==", codigoSitio), where("ordenCompra", "==", numeroOC));
    const querySnapshot = await getDocs(q);
    const facturas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Obtener las facturas completas
    return facturas;
  };

  useEffect(() => {
    const fetchGestiones = async () => {
      const querySnapshot = await getDocs(collection(db, "Gestiones"));
      const gestionesData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const gestion = { id: doc.id, ...doc.data() };
        gestion.numeroFactura = await obtenerNumeroFactura(gestion.codigoSitio, gestion.numeroOC);
        gestion.fechasFacturacion = await obtenerFechasFacturacion(gestion.codigoSitio, gestion.numeroOC);
        return gestion;
      }));
      setGestiones(gestionesData);
      setFilteredGestiones(gestionesData); // Inicialmente, las gestiones filtradas son las mismas que las gestiones
    };

    fetchGestiones();
  }, []); // Agregar un arreglo de dependencias vacío para que se ejecute solo una vez al montar el componente

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const obtenerNumeroFactura = async (codigoSitio, numeroOC) => {
    const facturasRef = collection(db, "Facturas");
    const q = query(facturasRef, where("codigoSitio", "==", codigoSitio), where("ordenCompra", "==", numeroOC));
    const querySnapshot = await getDocs(q);
    const facturas = querySnapshot.docs.map(doc => doc.data().numeroFactura);
    return facturas.join(" - "); // Concatenar facturas si hay más de una
  };

  // Función para manejar el filtrado de gestiones
  const handleFilter = useCallback((filteredGestiones) => {
    setFilteredGestiones(filteredGestiones);
  }, []); // Memorizar la función para evitar recrearla en cada renderizado

  return (
    <div>
      <NavBar />
      <div className="w-full px-4 py-8 overflow-x-auto">
        <h1 className="text-2xl font-bold">Lista de Gestiones</h1>
        
        {/* Integramos el BuscadorGestiones */}
        <BuscadorGestiones 
          gestiones={gestiones} 
          onFilter={handleFilter} 
        />
  
        <ListadorGestiones2 
          gestiones={filteredGestiones}
        />
      </div>
    </div>
  );
}