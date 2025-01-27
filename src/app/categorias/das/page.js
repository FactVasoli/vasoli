"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase.config";
import NavBar from "@/components/NavBar";
import { useRouter } from "next/navigation";
import AddGestionModal from "@/components/AddGestionModal";
import ListaGestiones from "@/components/ListaGestiones";
import { auth } from "@/firebase.config";

export default function SitiosNuevosPage() {
  const [clientes, setClientes] = useState([]);
  const [gestiones, setGestiones] = useState([]);
  const [showAgregarGestion, setShowAgregarGestion] = useState(false);
  const router = useRouter();
  const categoriaInicial = "DAS";

  useEffect(() => {
    const verificarUsuario = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
      }
    };

    const cargarClientes = async () => {
      const querySnapshot = await getDocs(collection(db, "Clientes"));
      const clientesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(clientesData);
    };

    const cargarGestiones = () => {
      const unsubscribe = onSnapshot(collection(db, "Gestiones"), (querySnapshot) => {
        const gestionesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGestiones(gestionesData);
      });
      return unsubscribe; // Return the unsubscribe function
    };

    verificarUsuario();
    cargarClientes();
    const unsubscribeGestiones = cargarGestiones();

    return () => {
      unsubscribeGestiones(); // Clean up the listener on unmount
    };
  }, [router]);

  const handleSave = () => {
    setShowAgregarGestion(false);
  };

  // Filtrar gestiones según el estadoOC y la categoría
  const gestionesEnTramite = gestiones.filter(gestion => gestion.estadoOC === "Gestión en trámite" && gestion.categoria === categoriaInicial);
  const gestionesDelayed = gestiones.filter(gestion => gestion.estadoOC === "Delayed" && gestion.categoria === categoriaInicial);
  const gestionesFacturado = gestiones.filter(gestion => 
    (gestion.estadoOC === "Terminado sin facturar" || gestion.estadoOC === "Facturado no pagado") && 
    gestion.categoria === categoriaInicial
  );
  const gestionesEliminados = gestiones.filter(gestion => gestion.estadoOC === "Eliminado no facturado" && gestion.categoria === categoriaInicial);
  const gestionesTerminados = gestiones.filter(gestion => 
    (gestion.estadoOC === "Terminado" || gestion.estadoOC === "Eliminado y cobrado") && 
    gestion.categoria === categoriaInicial
  );

  return (
    <div>
      <NavBar />
      <div className="w-full px-4 py-8">
        <button
          onClick={() => setShowAgregarGestion(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md w-full hover:bg-blue-700 transition-colors"
        >
          Agregar gestión
        </button>
        <AddGestionModal
          isOpen={showAgregarGestion}
          onClose={() => setShowAgregarGestion(false)}
          onSave={handleSave}
          clientes={clientes}
          categoriaInicial={categoriaInicial}
          tipoCategoria="normal"
        />
        
        {/* Usar el componente ListaGestiones para cada lista solo si hay elementos */}
        {gestionesEnTramite.length > 0 && <ListaGestiones titulo="Gestiones en Trámite" gestiones={gestionesEnTramite} />}
        {gestionesDelayed.length > 0 && <ListaGestiones titulo="Delayed" gestiones={gestionesDelayed} />}
        {gestionesFacturado.length > 0 && <ListaGestiones titulo="Terminados sin Facturar y Facturados no Pagados" gestiones={gestionesFacturado} />}
        {gestionesEliminados.length > 0 && <ListaGestiones titulo="Eliminados sin cobrar" gestiones={gestionesEliminados} />}
        {gestionesTerminados.length > 0 && <ListaGestiones titulo="Terminados y cobrados" gestiones={gestionesTerminados} />}
        
      </div>
    </div>
  );
}
